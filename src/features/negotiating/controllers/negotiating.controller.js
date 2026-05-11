const negotiatingService = require('../services/negotiating.service');
const { getDigitCount, isValidDate } = require('../../../helper_function/functions');

class NegotiatingController {
  async createNegotiation(req, res) {
    try {
      const { bid_id, response_harga, response_waktu, role_ } = req.body;

      // Validation: Check required fields
      if (!bid_id || !response_harga || !response_waktu || !role_) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: bid_id, response_harga, response_waktu, role_',
          code: 'VALIDATION_ERROR'
        });
      }

      // Check if bid exists
      const bid = await negotiatingService.getBitDetails(bid_id);
      if (!bid) {
        return res.status(400).json({
          success: false,
          message: 'Bid never exists',
          code: 'BID_NOT_FOUND'
        });
      }

      // Validation: response_harga must be positive integer
      if (!isFinite(response_harga) || response_harga < 0 || getDigitCount(response_harga) > 15) {
        return res.status(400).json({
          success: false,
          message: 'response_harga must be a positive number with up to 15 digits',
          code: 'INVALID_RESPONSE_HARGA'
        });
      }

      // Validation: response_tanggal must be a valid date
      if (!isValidDate(response_tanggal)) {
        return res.status(400).json({
          success: false,
          message: 'response_tanggal must be in date format',
          code: 'INVALID_RESPONSE_TANGGAL'
        });
      }

      // Validation: role_ must be either 'Mitra' or 'Kelompok'
      if (!(role_ === 'Mitra' || role_ === 'Kelompok')) {
        return res.status(400).json({
          success: false,
          message: 'role must be either Mitra or Kelompok',
          code: 'INVALID_ROLE'
        });
      }

      // Check if project is closed
      if (bid.status_bid === 'Rejected') {
        return res.status(400).json({
          success: false,
          message: 'Cannot negotiate: project is closed for bidding and negotiation',
          code: 'PROJECT_CLOSED'
        });
      }

      // Create bid with market maker logic
      const negotiationData = {
        bit_Id: bit_id,
        response_harga: response_harga,
        response_waktu: response_waktu,
        role_: role_
      };

      const newNegotiation = await negotiatingService.createNegotiation(negotiationData);

      // Success response
      return res.status(201).json({
        success: true,
        message: 'Negotiated bid created successfully',
        data: {
          nego_id: newNegotiation.nego_id,
          bid_id: newNegotiation.bid_id,
          response_harga: newNegotiation.response_harga,
          response_waktu: newNegotiation.response_waktu,
          role_: newNegotiation.role_,
          created_at: newNegotiation.created_at
        }
      });

    } catch (error) {
      console.error('Error in createNegotiation:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'SERVER_ERROR',
        error: error.message
      });
    }
  }

  async deleteNegotiation(req, res) {
      const nego= req.body;
      const nego_id = nego.nego_id;
      const bid_id = nego.bid_id;
      try{
        // Check if negotiation exists
        const negotiation = await negotiatingService.getNegotiationById(nego_id);
        if (!negotiation) {
          return res.status(404).json({
            success: false,
            message: 'Negotiation not found',
            code: 'NEGOTIATION_NOT_FOUND'
          });
        }

        await negotiatingService.deleteNegotiation(nego_id, bid_id);
      }catch(error){
        console.error('Error in deleteNegotiation:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          code: 'SERVER_ERROR',
          error: error.message
        });
      }

  }
}

module.exports = new NegotiatingController();
