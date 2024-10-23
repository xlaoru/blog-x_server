const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
    isEditable: {
      type: Boolean,
      default: false,
    },
    upVotes: {
      quantity: {
        type: Number,
        default: 0,
      },
      isVoted: {
        type: Boolean,
        default: false,
      }
    },
    downVotes: {
      quantity: {
        type: Number,
        default: 0,
      },
      isVoted: {
        type: Boolean,
        default: false,
      }
    },
    commentsId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }]
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;
