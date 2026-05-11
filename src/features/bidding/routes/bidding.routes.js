const express = require('express')
const router = express.Router()
const biddingController = require('../controllers/bidding.controller')
const authMiddleware = require('../../../middleware/auth.middleware')

// GET all bids dengan role-based filtering (Mitra atau Talent)
// Memerlukan header: X-User-ID dan X-User-Type
router.get('/', authMiddleware, biddingController.getBids)

router.post('/', biddingController.createBid)

router.get('/:id', (req, res) => {
  const id = req.params.id
  res.send(`ini adalah bidding ${id}`)
})

module.exports = router