const pool = require('../../../config/db');
const helpers = require('../../../helper_function/functions');

class negotiatingService {
  // Check if project exists and get its details
  async getBitDetails(BitId) {
    const query = 'SELECT * FROM bid WHERE bid_id = $1';
    const result = await pool.query(query, [BitId]);
    return result.rows[0];
  }

  // Create a new negotiation
  async createNegotiation(negotiationData) {
    const { bit_Id, response_harga, response_waktu, role_ } = negotiationData;

    const query = `
      INSERT INTO negosiasi (bid_id, response_harga, response_waktu, role_)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      bit_Id,
      response_harga,
      response_waktu,
      role_
    ]);

    return result.rows[0];
  }

 //Delete a negotiation by id
  async deleteNegotiation(negotiationId, bidId) {
    const query = 'DELETE FROM negosiasi WHERE id = $1 RETURNING *';
    //check if there is a negotiation from opposite role before deleting
    const checkArr = await this.getNegotiationsByBidId(bidId); 
    const nego_to_delete = checkArr.rows.find(nego => nego.id === negotiationId)
    if (!nego_to_delete) {
      throw new Error('Negotiation not found');
    }
    const oppositeRole = nego_to_delete.role_ === 'kelompok' ? 'mitra' : 'kelompok';

    const hasOppositeRole = checkArr.rows.some(nego => nego.role_ === oppositeRole);

    if(hasOppositeRole){
      const oppositeLastNego = () => {
        if (checkArr[0].role_ === oppositeRole){
          return true;
        }return false;
      }
      if (oppositeLastNego()){
        throw new Error(`Cannot delete the last negotiation because ${oppositeRole} has replied.`);
      }
      const deleteResult = await pool.query(query, [negotiationId]);
      return deleteResult.rows[0];
    }
    const deleteResult = await pool.query(query, [negotiationId]);
    return deleteResult.rows[0];
  }

 // Get all negotiations for a specific bid_id
 async getNegotiationsByBidId(bidId) {
  const requestQuery = 'SELECT * FROM negosiasi WHERE bid_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(requestQuery, [bidId])
  return result.rows;
 }

 // Get a negotiation by its ID
  async getNegotiationById(negoId) {
    const query = 'SELECT * FROM negosiasi WHERE id = $1';
    const result = await pool.query(query, [negoId]);
    return result.rows[0];
  }
}

module.exports = new negotiatingService();
