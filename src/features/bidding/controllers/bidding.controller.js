const biddingService = require('../services/bidding.service');
const { responseSuccess, responseError } = require('../../../utils/response');

class BiddingController {
  async getBids(req, res) {
    try {
      // Get user info dari auth middleware
      const userId = req.user.id;
      const userType = req.user.type;

      // Fetch bids dengan role-based filtering
      const bids = await biddingService.getBids(userId, userType);

      // Return success response
      return responseSuccess(res, 'Bids retrieved successfully', {
        bids,
        count: bids.length,
        user_type: userType
      }, 200);

    } catch (error) {
      console.error('Error in getBids:', error);
      return responseError(res, error.message, 500, 'SERVER_ERROR');
    }
  }

  async createBid(req, res) {
    try {
      const { group_id, project_id, priority, document_url, student_id, tawaran_harga, tawaran_waktu } = req.body;

      // Validation: Check required fields
      if (!group_id || !project_id || !priority || !document_url || !student_id || !tawaran_harga || !tawaran_waktu) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: group_id, project_id, priority, document_url, student_id, tawaran_harga, tawaran_waktu',
          code: 'VALIDATION_ERROR'
        });
      }

      // Validation: Priority must be positive integer
      if (!Number.isInteger(priority) || priority < 1) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be a positive integer',
          code: 'VALIDATION_ERROR'
        });
      }

      // Check if project exists
      const project = await biddingService.getProjectDetails(project_id);
      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
      }

      // Check if project is closed
      if (project.status_proyek === 'Closed') {
        return res.status(400).json({
          success: false,
          message: 'Project is closed for bidding',
          code: 'PROJECT_CLOSED'
        });
      }

      // Check if group exists
      const group = await biddingService.getGroupDetails(group_id);
      if (!group) {
        return res.status(400).json({
          success: false,
          message: 'Group not found',
          code: 'GROUP_NOT_FOUND'
        });
      }

      // Check if student/pendaftar exists
      const student = await biddingService.getStudentDetails(student_id);
      if (!student) {
        return res.status(400).json({
          success: false,
          message: 'Student not found',
          code: 'STUDENT_NOT_FOUND'
        });
      }

      // Check if group already bid on this project (uniqueness constraint)
      const existingBid = await biddingService.checkExistingBid(project_id, group_id);
      if (existingBid) {
        return res.status(409).json({
          success: false,
          message: 'Group has already bid on this project',
          code: 'DUPLICATE_BID'
        });
      }

      // Create bid with market maker logic
      const bidData = {
        projectId: project_id,
        groupId: group_id,
        studentId: student_id,
        priority: priority,
        documentUrl: document_url,
        tawaranHarga: tawaran_harga, // Tambahan baru
        tawaranWaktu: tawaran_waktu  // Tambahan baru
      };

      const newBid = await biddingService.createBid(bidData);

      // Update project status if quota reached
      await biddingService.updateProjectStatusIfFull(project_id);

      // Success response
      return res.status(201).json({
        success: true,
        message: newBid.status_bid === 'Rejected' 
          ? 'Bid rejected: project quota full' 
          : 'Bid created successfully',
        data: {
          bid_id: newBid.bid_id,
          group_id: newBid.kelompok_id,
          project_id: newBid.proyek_id,
          status: newBid.status_bid,
          priority: newBid.urutan_prioritas,
          created_at: newBid.waktu_bid
        }
      });

    } catch (error) {
      console.error('Error in createBid:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'SERVER_ERROR',
        error: error.message
      });
    }
  }
}

module.exports = new BiddingController();
