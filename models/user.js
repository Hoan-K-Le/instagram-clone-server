const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: String,
    pictures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Picture',
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('User', UserSchema)
