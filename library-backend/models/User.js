const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
favoriteGenre:{
    type: String,
    required: true,
},
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }
  ],
})

module.exports = mongoose.model('User', schema)
