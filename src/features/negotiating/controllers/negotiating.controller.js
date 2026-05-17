const negotiatingService = require('../services/negotiating.service');
const { getDigitCount } = require('../../../helper_function/functions');
const { responseSuccess, responseError } = require('../../../utils/response');

class NegotiatingController {
  async createNegotiation(req, res) {
    try {
      const { bid_id } = req.params;
      const { response_harga, response_waktu, role_ } = req.body;

      // Validation: Check required fields
      if (!bid_id || !response_harga || !response_waktu || !role_) {
        return responseError(res, 'Missing required fields: bid_id (URL param), response_harga, response_waktu, role_', 400, 'VALIDATION_ERROR');
      }

      // Check if bid exists
      const bid = await negotiatingService.getBidDetails(bid_id);
      if (!bid) {
        return responseError(res, 'Bid not found', 404, 'BID_NOT_FOUND');
      }

      // Validation: response_harga must be positive number
      if (!isFinite(response_harga) || response_harga < 0 || getDigitCount(response_harga) > 15) {
        return responseError(res, 'response_harga must be a positive number with up to 15 digits', 400, 'INVALID_RESPONSE_HARGA');
      }

      // Validation: response_waktu must be a valid date string (YYYY-MM-DD)
      const parsedDate = new Date(response_waktu);
      if (isNaN(parsedDate.getTime())) {
        return responseError(res, 'response_waktu must be in valid date format (YYYY-MM-DD)', 400, 'INVALID_RESPONSE_WAKTU');
      }

      // Validation: role_ must be either 'Mitra' or 'Kelompok'
      if (!(role_ === 'Mitra' || role_ === 'Kelompok')) {
        return responseError(res, 'role_ must be either Mitra or Kelompok', 400, 'INVALID_ROLE');
      }

      // Check if project is closed (bid rejected)
      if (bid.status_bid === 'Rejected') {
        return responseError(res, 'Cannot negotiate: bid has been rejected', 400, 'BID_REJECTED');
      }

      // Create negotiation
      const negotiationData = {
        bid_id: bid_id,
        response_harga: response_harga,
        response_waktu: response_waktu,
        role_: role_
      };

      const newNegotiation = await negotiatingService.createNegotiation(negotiationData);

      // Success response
      return responseSuccess(res, 'Negotiation created successfully', {
        nego_id: newNegotiation.nego_id,
        bid_id: newNegotiation.bid_id,
        response_harga: newNegotiation.response_harga,
        response_waktu: newNegotiation.response_waktu,
        role_: newNegotiation.role_,
        created_at: newNegotiation.created_at
      }, 201);

    } catch (error) {
      console.error('Error in createNegotiation:', error);
      return responseError(res, 'Internal server error', 500, 'SERVER_ERROR');
    }
  }

  async getAllNegotiations(req, res) {
    try {
      const negotiations = await negotiatingService.getAllNegotiations();

      return responseSuccess(res, 'Negotiations retrieved successfully', {
        negotiations,
        count: negotiations.length
      }, 200);

    } catch (error) {
      console.error('Error in getAllNegotiations:', error);
      return responseError(res, 'Internal server error', 500, 'SERVER_ERROR');
    }
  }

  async getNegotiationsByBidId(req, res) {
    try {
      const { bid_id } = req.params;

      if (!bid_id) {
        return responseError(res, 'bid_id parameter is required', 400, 'VALIDATION_ERROR');
      }

      // Check if bid exists
      const bid = await negotiatingService.getBidDetails(bid_id);
      if (!bid) {
        return responseError(res, 'Bid not found', 404, 'BID_NOT_FOUND');
      }

      const negotiations = await negotiatingService.getNegotiationsByBidId(bid_id);

      return responseSuccess(res, 'Negotiations retrieved successfully', {
        bid_id: parseInt(bid_id),
        negotiations,
        count: negotiations.length
      }, 200);

    } catch (error) {
      console.error('Error in getNegotiationsByBidId:', error);
      return responseError(res, 'Internal server error', 500, 'SERVER_ERROR');
    }
  }

  async deleteNegotiation(req, res) {
    try {
      const { nego_id, bid_id } = req.body;

      if (!nego_id || !bid_id) {
        return responseError(res, 'Missing required fields: nego_id, bid_id', 400, 'VALIDATION_ERROR');
      }

      // Check if negotiation exists
      const negotiation = await negotiatingService.getNegotiationById(nego_id);
      if (!negotiation) {
        return responseError(res, 'Negotiation not found', 404, 'NEGOTIATION_NOT_FOUND');
      }

      const deleted = await negotiatingService.deleteNegotiation(nego_id, bid_id);

      return responseSuccess(res, 'Negotiation deleted successfully', {
        deleted_negotiation: deleted
      }, 200);

    } catch (error) {
      console.error('Error in deleteNegotiation:', error);

      // Handle specific business logic errors from service
      if (error.message.includes('Cannot delete')) {
        return responseError(res, error.message, 400, 'DELETE_NOT_ALLOWED');
      }

      return responseError(res, 'Internal server error', 500, 'SERVER_ERROR');
    }
  }

  async acceptNegotiation(req, res) {
    userId = req.user.id; 
    userType = req.user.type;

    if (userType !== 'mitra') {
      return responseError(res, 'Only Mitra can accept negotiations', 403, 'FORBIDDEN');
    }

    const { nego_id } = req.body;

    if (!nego_id) {
      return responseError(res, 'Missing required field: nego_id', 400, 'VALIDATION_ERROR');
    }
    
    try {
      const acceptedNegotiation = await negotiatingService.acceptNegotiation(nego_id);
      return responseSuccess(res, 'Negotiation accepted successfully', { nego_id: acceptedNegotiation.nego_id }, 200);
    }
    catch (error) {
      console.error('Error in acceptNegotiation:', error);
      return responseError(res, 'Internal server error', 500, 'SERVER_ERROR');
    }
  }
}

module.exports = new NegotiatingController();
