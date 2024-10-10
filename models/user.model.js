const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
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
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
