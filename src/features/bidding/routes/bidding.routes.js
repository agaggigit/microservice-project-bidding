const express = require('express')
const router = express.Router()
const biddingController = require('../controllers/bidding.controller')
const authMiddleware = require('../../../middleware/auth.middleware')

// GET all bids dengan role-based filtering (Mitra atau Talent)
// Memerlukan header: X-User-ID dan X-User-Type
router.get('/', authMiddleware, biddingController.getBids)

// GET bid by id (was placeholder, now implemented)
router.get('/:id', authMiddleware, biddingController.getBidById)

// POST create a new bid
router.post('/', authMiddleware, biddingController.createBid)

module.exports = router