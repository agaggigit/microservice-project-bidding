const pool = require('../../../config/db');

class NegotiatingService {
  // Check if bid exists and get its details (fixed typo: getBitDetails → getBidDetails)
  async getBidDetails(bidId) {
    const query = 'SELECT * FROM bid WHERE bid_id = $1';
    const result = await pool.query(query, [bidId]);
    return result.rows[0];
  }

  // Create a new negotiation (fixed typo: bit_Id → bid_id)
  async createNegotiation(negotiationData) {
    const { bid_id, response_harga, response_waktu, role_ } = negotiationData;

    const query = `
      INSERT INTO negosiasi (bid_id, response_harga, response_waktu, role_)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      bid_id,
      response_harga,
      response_waktu,
      role_
    ]);

    return result.rows[0];
  }

  // Delete a negotiation by id (fixed: checkArr.rows bug — getNegotiationsByBidId already returns rows)
  async deleteNegotiation(negotiationId, bidId) {
    const query = 'DELETE FROM negosiasi WHERE nego_id = $1 RETURNING *';

    // Check if there is a negotiation from opposite role before deleting
    const negotiations = await this.getNegotiationsByBidId(bidId);
    const negoToDelete = negotiations.find(nego => nego.nego_id === negotiationId);

    if (!negoToDelete) {
      throw new Error('Negotiation not found for this bid');
    }

    const oppositeRole = negoToDelete.role_ === 'Kelompok' ? 'Mitra' : 'Kelompok';
    const hasOppositeRole = negotiations.some(nego => nego.role_ === oppositeRole);

    if (hasOppositeRole) {
      // Check if the most recent negotiation is from the opposite role
      // If so, we can't delete because they already replied
      if (negotiations[0].role_ === oppositeRole) {
        throw new Error(`Cannot delete: ${oppositeRole} has already replied to this negotiation.`);
      }
    }

    const deleteResult = await pool.query(query, [negotiationId]);
    return deleteResult.rows[0];
  }

  // Get all negotiations (NEW — was placeholder before)
  async getAllNegotiations() {
    const query = `
      SELECT n.*, b.proyek_id, b.kelompok_id, b.status_bid
      FROM negosiasi n
      JOIN bid b ON n.bid_id = b.bid_id
      ORDER BY n.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get all negotiations for a specific bid_id
  async getNegotiationsByBidId(bidId) {
    const query = 'SELECT * FROM negosiasi WHERE bid_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [bidId]);
    return result.rows;
  }

  // Get a negotiation by its ID
  async getNegotiationById(negoId) {
    const query = 'SELECT * FROM negosiasi WHERE nego_id = $1';
    const result = await pool.query(query, [negoId]);
    return result.rows[0];
  }

  // Accept a negotiation (role must be mitra)
  async acceptNegotiation(negoId) {
    const negotiation = await this.getNegotiationById(negoId);
    
    if (!negotiation) {
      throw new Error('Negotiation not found');
    }
    
    const bidDetails = await this.getBidDetails(negotiation.bid_id);
    
    if (!bidDetails) {
      throw new Error('Associated bid not found');
    }

    const proyekId = bidDetails.proyek_id;
    const bidId = bidDetails.bid_id;

    const query = 'UPDATE proyek SET status_proyek = $1 WHERE proyek_id = $2 RETURNING *; UPDATE bid SET status_bid = $3 WHERE bid_id = $4 RETURNING *; UPDATE bid SET status_bid = $5 WHERE proyek_id = $2 AND bid_id != $4  RETURNING *';
    
    const result = await pool.query(query, ['Closed', proyekId, 'Accepted', bidId, 'Rejected']);
    
    return result.rows[0];
  }
}
module.exports = new NegotiatingService();
