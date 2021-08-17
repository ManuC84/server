const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: { type: String, required: true, index: true },
  id: { type: String, index: true },
  notifications: {
    type: [],
    default: [],
  },
});

var User = mongoose.model("User", userSchema);

module.exports = User;
