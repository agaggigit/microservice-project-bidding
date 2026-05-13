const express = require('express')
const router = express.Router()
const negotiatingController = require('../controllers/negotiating.controller')
const authMiddleware = require('../../../middleware/auth.middleware')

// GET all negotiations (was placeholder, now implemented)
router.get('/', authMiddleware, negotiatingController.getAllNegotiations)

// GET negotiations by bid_id (fixed: param mismatch req.params.id → req.params.bid_id)
router.get('/:bid_id', authMiddleware, negotiatingController.getNegotiationsByBidId)

// POST create negotiation for a bid
router.post('/:bid_id', authMiddleware, negotiatingController.createNegotiation)

// DELETE a negotiation
router.delete('/', authMiddleware, negotiatingController.deleteNegotiation)

module.exports = router