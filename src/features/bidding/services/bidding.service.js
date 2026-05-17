const pool = require('../../../config/db');

class BiddingService {
  // Check if project exists and get its details
  async getProjectDetails(projectId) {
    const query = 'SELECT * FROM proyek WHERE proyek_id = $1';
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
  }

  // Check if group exists
  async getGroupDetails(groupId) {
    const query = 'SELECT * FROM kelompok WHERE kelompok_id = $1';
    const result = await pool.query(query, [groupId]);
    return result.rows[0];
  }

  // Check if student/pendaftar exists
  async getStudentDetails(studentId) {
    const query = 'SELECT * FROM mahasiswa WHERE mahasiswa_id = $1';
    const result = await pool.query(query, [studentId]);
    return result.rows[0];
  }

  // Count existing bids for a project (accepted/pending bids)
  async countProjectBids(projectId) {
    const query = `
      SELECT COUNT(*) as total 
      FROM bid 
      WHERE proyek_id = $1 AND status_bid IN ('Accepted', 'Pending')
    `;
    const result = await pool.query(query, [projectId]);
    return parseInt(result.rows[0].total, 10);
  }

  // Check if group already bid on this project (uniqueness)
  async checkExistingBid(projectId, groupId) {
    const query = `
      SELECT * FROM bid 
      WHERE proyek_id = $1 AND kelompok_id = $2
    `;
    const result = await pool.query(query, [projectId, groupId]);
    return result.rows[0];
  }

  // Create a new bid with market maker logic
  async createBid(bidData) {
    return this.createBidWithTransactionLock(bidData);
  }

  // Get bid by ID for update (with lock)
  async getBidByIdForUpdate(bidId) {
    const query = 'SELECT * FROM bid WHERE bid_id = $1';
    const result = await pool.query(query, [bidId]);
    return result.rows[0];
  }

  // Update bid status (accept/reject)
  async updateBidStatus(bidId, status, notes = null) {
    const query = `
      UPDATE bid 
      SET status_bid = $1
      WHERE bid_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, bidId]);
    return result.rows[0];
  }

  // Update project status to 'Full' if quota is reached
  async updateProjectStatusIfFull(projectId) {
    const project = await this.getProjectDetails(projectId);
    const currentBids = await this.countProjectBids(projectId);

    if (currentBids >= project.kuota_maksimal && project.status_proyek !== 'Full') {
      const updateQuery = `
        UPDATE proyek 
        SET status_proyek = 'Full' 
        WHERE proyek_id = $1
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [projectId]);
      return result.rows[0];
    }

    return project;
  }

  // Get a single bid by its ID
  async getBidById(bidId) {
    const query = `
      SELECT 
        b.bid_id,
        b.proyek_id,
        b.kelompok_id,
        b.pendaftar_id,
        b.status_bid,
        b.urutan_prioritas,
        b.dokumen_url,
        b.tawaran_harga,
        b.tawaran_waktu,
        b.waktu_bid,
        p.judul_proyek,
        p.status_proyek,
        m.nama_mitra
      FROM bid b
      JOIN proyek p ON b.proyek_id = p.proyek_id
      JOIN mitra m ON p.mitra_id = m.mitra_id
      WHERE b.bid_id = $1
    `;
    const result = await pool.query(query, [bidId]);
    return result.rows[0];
  }

  // Get bids with role-based filtering
  // Mitra: hanya lihat bid untuk proyek miliknya
  // Talent: hanya lihat bid yang mereka submit
  async getBids(userId, userType) {
    try {
      let query;
      let params;

      if (userType === 'mitra') {
        // Mitra hanya lihat bid dari proyek miliknya
        // JOIN dengan proyek table untuk filter berdasarkan mitra_id
        query = `
          SELECT 
            b.bid_id,
            b.proyek_id,
            b.kelompok_id,
            b.pendaftar_id,
            b.status_bid,
            b.urutan_prioritas,
            b.dokumen_url,
            b.waktu_bid,
            p.judul_proyek,
            p.status_proyek,
            m.nama_mitra
          FROM bid b
          JOIN proyek p ON b.proyek_id = p.proyek_id
          JOIN mitra m ON p.mitra_id = m.mitra_id
          WHERE p.mitra_id = $1
          ORDER BY b.waktu_bid DESC
        `;
        params = [userId];

      } else if (userType === 'talent') {
        // Talent hanya lihat bid yang mereka submit (berdasarkan kelompok_id)
        query = `
          SELECT 
            b.bid_id,
            b.proyek_id,
            b.kelompok_id,
            b.pendaftar_id,
            b.status_bid,
            b.urutan_prioritas,
            b.dokumen_url,
            b.waktu_bid,
            p.judul_proyek,
            p.status_proyek,
            m.nama_mitra
          FROM bid b
          JOIN proyek p ON b.proyek_id = p.proyek_id
          JOIN mitra m ON p.mitra_id = m.mitra_id
          WHERE b.kelompok_id = $1
          ORDER BY b.waktu_bid DESC
        `;
        params = [userId];

      } else {
        throw new Error(`Invalid user type: ${userType}`);
      }

      const result = await pool.query(query, params);
      return result.rows;

    } catch (error) {
      console.error('Error in getBids:', error);
      throw error;
    }
  }

  async createBidWithTransactionLock(bidData) {
    const client = await pool.connect();
    try {
      // Start transaction
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      
      // Lock project row untuk prevent concurrent updates
      await client.query(
        'SELECT * FROM proyek WHERE proyek_id = $1 FOR UPDATE',
        [bidData.projectId]
      );
      
      // Re-check quota after acquiring lock
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM bid 
        WHERE proyek_id = $1 AND status_bid IN ('Accepted', 'Pending')
      `;
      const countResult = await client.query(countQuery, [bidData.projectId]);
      const currentBids = parseInt(countResult.rows[0].total, 10);
      
      // Get project details
      const projectQuery = 'SELECT * FROM proyek WHERE proyek_id = $1';
      const projectResult = await client.query(projectQuery, [bidData.projectId]);
      const project = projectResult.rows[0];
      
      // Determine bid status based on quota
      let bidStatus = 'Queued';
      if (currentBids >= project.kuota_maksimal) {
        bidStatus = 'Rejected';
      }
      
      // Insert new bid
      const insertQuery = `
        INSERT INTO bid (proyek_id, kelompok_id, pendaftar_id, status_bid, urutan_prioritas, dokumen_url, tawaran_harga, tawaran_waktu)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const insertResult = await client.query(insertQuery, [
        bidData.projectId,
        bidData.groupId,
        bidData.studentId,
        bidStatus,
        bidData.priority,
        bidData.documentUrl,
        bidData.tawaranHarga,
        bidData.tawaranWaktu
      ]);
      
      // Update project status if full
      if (currentBids + 1 >= project.kuota_maksimal && project.status_proyek !== 'Full') {
        await client.query(
          'UPDATE proyek SET status_proyek = $1 WHERE proyek_id = $2',
          ['Full', bidData.projectId]
        );
      }
      
      // Commit transaction
      await client.query('COMMIT');
      
      return insertResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in createBidWithTransactionLock:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new BiddingService();
