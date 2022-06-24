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
app.use(express.static('uploads'))

// config for multer
// const uploads = multer({ dest: 'uploads/' })

// simple middleware
// app.use((req, res, next) => {
//   console.log('hello i am a middleware')
//   res.locals.myData = 'i am data that is passed out of the middleware'
//   // tell express to move on to the next thing
//   next()
// })

const myMiddleware = (req, res, next) => {
  console.log('hello i am a middleware')
  res.locals.myData = 'i am data that is passed out of the middleware'
  // tell express to move on to the next thing
  next()
}

// routes and controllers
app.get('/', myMiddleware, (req, res) => {
  res.json({ msg: 'Welcome back beech!' })
  // console.log(res.locals.myData)
})

// cloudinary boilerplate for posting multi part form data images
// app.post('/images', uploads.single('image'), async (req, res) => {
//   if (!req.file) return res.status.(400).json({ msg: 'no file uploaded! ' })
//   const cloudImageData = await cloudinary.uploader.upload(req.file.path)
//   console.log(cloudImageData)
//   const cloudinaryUrl = `https://res.cloudinary.com/dkchpbore/image/upload/v1593119998/${cloudImageData.public_id}.png`
//   // remove the file after finishing up with it
//   unlinkSync(req.file.path)
//   res.json({ cloudinaryUrl })
// })

app.use('/api-v1/users', require('./controllers/api-v1/users'))

// listen on a port
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`)
})
