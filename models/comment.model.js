const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    }
)

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
