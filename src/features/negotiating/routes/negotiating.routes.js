const express = require('express')
const router = express.Router()
const negotiatingController = require('../controllers/negotiating.controller')

router.post('/:bidid', negotiatingController.createNegotiation)

router.get('/', (req,res) => {
    res.send('ini adalah semua nego')
})

router.get('/:bid_id', (req,res) => {
    const id = req.params.id
    res.send(`ini adalah semua histori bidding ${id}`)
})

module.exports = router