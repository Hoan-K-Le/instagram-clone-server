const db = require('../../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = require('express').Router()
const authLockedRoute = require('./authLockedRoute')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const path = require('path')
const { unlinkSync } = require('fs')
// config multer -- tell it about the static folder
const uploads = multer({ dest: 'uploads/' })

// POST /users/register -- CREATE a new user
router.post('/register', async (req, res) => {
  try {
    // check if the user exists already
    const findUser = await db.User.findOne({
      email: req.body.email,
    })

    // disallow users from resgistering twice
    if (findUser) {
      // stop the route and send a response saying the user exists
      return res.status(400).json({ msg: 'email already exists' })
    }

    // hash the user's pass
    const password = req.body.password
    const salts = 12
    const hashedPassword = await bcrypt.hash(password, salts)

    // create a new user with hassed password
    const newUser = new db.User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    })

    await newUser.save()

    // sign the user in by sending a valid jwt back
    // create the jwt payload
    const payload = {
      name: newUser.name,
      email: newUser.email,
      id: newUser.id,
    }
    // sign the token and send it back
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })
    res.json({ token })
  } catch (err) {
    console.warn(err)
    // handle validationn errors
    if (err.name === 'ValidationError') {
      res.status(400).json({ msg: err.message })
    } else {
      // handle all other errors
      res.status(500).json({ msg: 'server error 500' })
    }
  }
})

// POST /users/login -- validate login creds
router.post('/login', async (req, res) => {
  try {
    // all the data will come in on the req.body
    // try to find the user in the database
    const foundUser = await db.User.findOne({
      email: req.body.email,
    })
    // if the user is not found, send a status of 400 let user know login failed
    if (!foundUser) {
      return res.status(400).json({ msg: 'No user exists with that email' })
    }

    // check the supplied password aagainst the password in the database
    // if they do not match, return and let the user know that the login has failed
    const passwordCheck = await bcrypt.compare(
      req.body.password,
      foundUser.password
    )
    if (!passwordCheck) {
      return res.status(400).json({ msg: 'password and email doesnt match' })
    }

    // create a jwt payload
    const payload = {
      name: foundUser.name,
      email: foundUser.email,
      id: foundUser.id,
    }
    // sign the jwt and send it back
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })
    res.json({ token })
  } catch (err) {
    console.warn(err)
    // dont forget to handle your errors
    if (err.name === 'ValidationError') {
      res.status(400).json({ msg: err.message })
    } else {
      // handle all other errors
      res.status(500).json({ msg: 'server error 500' })
    }
  }
})

// GET /auth-locked -- checks user creds and only send back privleged
// info if the user is logged in properly
router.get('/auth-locked', authLockedRoute, (req, res) => {
  console.table(res.locals.user)
  res.json({ msg: 'welcome to the secret auth-locked route' })
})

// upload data
router.post('/', uploads.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'no file uploaded' })
    // upload to cloudinary
    const cloudImageData = await cloudinary.uploader.upload(req.file.path)
    // png that can be manipulated
    const cloudImage = `https://res.cloudinary.com/${process.env.CLOUD_USER_ID}/image/upload/v1593119998/${cloudImageData.public_id}.png`
    // delete the file so it doesnt clutter up the server folder
    unlinkSync(req.file.path)
    // save url to db
    // console.log(req.body)

    res.json({ cloudImage })
  } catch (err) {
    console.warn(err)
    res.status.json(503).json({ msg: 'you should look at the server console.' })
  }
})

// GET all users with pictures populating
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.User.find({}).populate({
      path: 'pictures',
    })

    res.json(allUsers)
  } catch (err) {
    console.warn(err)
  }
})

// GET a specific user with pictures populating
router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const foundUser = await db.User.findById(id).populate({
      path: 'pictures',
    })

    res.json(foundUser)
  } catch (err) {
    console.warn(err)
  }
})

// GET users picture details
router.get('/:pic_id', async (req, res) => {
  const id = req.params.id
  try {
    const foundPicture = await db.Picture.findById(id).populate({
      path: 'comments',
    })

    res.json(foundPicture)
  } catch (err) {
    console.warn(err)
  }
})

// POST add a new comment to a picture
router.post('/:pic_id/comment', async (req, res) => {
  const id = req.params.id
  try {
    const foundPicture = await db.Picture.findById(id).populate({
      path: 'comments',
    })
    const newComment = await db.Comment.create(req.body)

    foundPicture.comments.push(newComment)
    newComment.picture = foundPicture

    await foundPicture.save()
    await newComment.save()

    res.status(201).json(newComment)
  } catch (err) {
    console.warn(err)
  }
})

module.exports = router
