const express = require('express')
const app = express()

const projectsRoute = require('./features/projects/routes/project.routes')
const biddingRoute = require('./features/bidding/routes/bidding.routes')

app.use(express.json())

app.use('/api/projects', projectsRoute)
app.use('/api/bidding', biddingRoute)

app.get('/', (req, res) => {
  res.send('Halo ini layanan bidding')
})

module.exports = app
