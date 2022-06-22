// required packages
require('dotenv').config()
require('./models')
const express = require('express')
const cors = require('cors')

// app config/middleware
const app = express()
const PORT = process.env.PORT || 8000
app.use(cors())
app.use(express.json()) // json req.bodies

// routes and controllers
app.get('/', (req, res) => {
  res.json({ msg: 'Welcome back beech!' })
})

// listen on a port
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`)
})
