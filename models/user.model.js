const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
    default: ""
  },
  bio: {
    type: String,
    required: false,
    default: "",
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "USER",
  },
  blogs: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "Blog"
  },
  savedBlogs: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "Blog"
  },
  votedBlogs: {
    type: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
      },
      vote: {
        type: String,
        enum: ["upvote", "downvote", "none"],
        required: true,
        default: "none"
      }
    }],
    default: []
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;