const mongoose = require("mongoose");

const reactionsSchema = mongoose.Schema({
  parentId: String,
  userId: String,
  reactionType: String,
  parentType: String,
});

var Reactions = mongoose.model("reactions", reactionsSchema);

module.exports = Reactions;
