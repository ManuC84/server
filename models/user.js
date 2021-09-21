const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: { type: String, required: true },
  notifications: {
    type: [],
    default: [],
  },
  imageUrl: { type: String },
});

var User = mongoose.model('User', userSchema);

module.exports = User;
