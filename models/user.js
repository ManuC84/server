const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  password: { type: String, required: true, index: true },
  id: { type: String, index: true },
  notifications: {
    type: [],
    default: [],
    index: true,
  },
});

var User = mongoose.model("User", userSchema);

module.exports = User;
