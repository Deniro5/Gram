const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  author: { type: String, require: true },
  date: { type: String, require: true },
  likedBy: [],
  likes: { type: Number, require: true },
  comments: [{}],
  src: { type: String, require: true },
});

module.exports = mongoose.model("Post", postSchema);
