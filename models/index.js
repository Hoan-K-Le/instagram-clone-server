require('dotenv').config()

const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/mernAuth'

mongoose.connect(MONGODB_URI)

const db = mongoose.connection

db.once('open', () => {
  console.log(`🔗 connected on MongoDB ${db.host}:${db.port}`)
})

db.on('error', err => {
  console.error('Data is not working 😭', err)
})

module.exports = {
  User: require('./user'),
}
