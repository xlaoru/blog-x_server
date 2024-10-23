const Blog = require("../models/blog.model");
const User = require("../models/user.model");
const Comment = require("../models/comment.model");

exports.getBlogs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const blogs = await Blog.find({});

    blogs.forEach((blog) => {
      blog.isSaved = user.savedBlogs.includes(blog._id);
      blog.isEditable = user.blogs.includes(blog._id);
    });

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendBlog = async (req, res, next) => {
  try {
    const blog = await Blog.create(req.body);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.blogs.push(blog._id);
    await user.save();

    res.status(200).json({ blog, message: "Blog created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveBlog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { id } = req.params;
    const isBlogSaved = user.savedBlogs.includes(id);

    if (!isBlogSaved) {
      user.savedBlogs.push(id);
      await user.save();
      res.status(200).json({ message: "Blog saved successfully" });
    } else {
      user.savedBlogs = user.savedBlogs.filter(
        (savedBlogId) => savedBlogId.toString() !== id
      );
      await user.save();
      res.status(200).json({ message: "Blog removed from saved" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getSavedBlogs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const blogs = await Blog.find({ _id: { $in: user.savedBlogs } });

    const savedBlogs = blogs.map(blog => ({
      ...blog._doc,
      isSaved: true
    }));

    res.status(200).json({ blogs: savedBlogs, message: "Saved blogs fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.updateBlog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { id } = req.params;
    const isCorrectUser = user.blogs.includes(id);

    if (!isCorrectUser) {
      res.status(404).json({ message: "You are not allowed to update this blog" })
    } else {
      const blog = await Blog.findByIdAndUpdate(id, req.body);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.status(200).json({ blog, message: "Blog updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { id } = req.params;
    const isCorrectUser = user.blogs.includes(id);

    if (!isCorrectUser) {
      res.status(404).json({ message: "You are not allowed to delete this blog" });
    } else {
      const blog = await Blog.findByIdAndDelete(id);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      await User.updateMany(
        { savedBlogs: id },
        { $pull: { savedBlogs: id } }
      );

      await Comment.deleteMany({ _id: { $in: blog.commentsId } });

      user.blogs = user.blogs.filter((blogId) => blogId.toString() !== id);
      await user.save();

      res.status(200).json({ message: "Blog deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = new Comment({ text, createdBy: userId });
    await comment.save();

    blog.commentsId.push(comment._id);
    await blog.save();

    const responseComment = {
      ...comment._doc,
      createdBy: user.name
    }

    res.status(201).json({ comment: responseComment, message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getComments = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { id } = req.params;

    const blog = await Blog.findById(id).populate("commentsId");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comments = blog.commentsId;

    const commentsList = await Promise.all(comments.map(async (comment) => {
      const commentOwner = await User.findById(comment.createdBy);
      const commentOwnerName = commentOwner.name

      return {
        ...comment._doc,
        createdBy: commentOwnerName
      }
    }))

    res.status(200).json({ comments: commentsList, message: "Comments fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.sendVote = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { id, votetype } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const hasVoted = user.votedPosts.includes(id);

    /* 
    *  Если два раза зделать upvote/downvote, то счетчик вместо того, чтоб оставатся 
    *  на месте - будет уменьшатся. А нужно, чтоб стоял на месте если повторный запрос шёл. 
    */

    if (!hasVoted) {
      if (votetype === "upvote") {
        blog.upVotes += 1;
      } else if (votetype === "downvote") {
        blog.downVotes += 1;
      } else {
        return res.status(400).json({ message: "Invalid vote type" });
      }

      user.votedPosts.push(id);
    } else {
      // TODO: Add logic here
      /* 
      * Create logic if you duplicate your vote => return "You have already voted for upvote/downvote" 
      * Create logic if you want to switch your vote. (EX: You have already voted for upvote, but you want to switch to downvote) => return "You switched your vote for upvote/downvote"
      */
      return res.status(400).json({
        message: "You have already voted for this post"
      })
    }

    /* 
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    else if (hasVoted && votetype === "upvote") {
      Ты уже голосовал за upvote
      return res.status(400).json({ message: "You have already voted for upvote" });
    } else if (hasVoted && votetype === "downvote") {
      Ты уже голосовал за downvote
      return res.status(400).json({ message: "You have already voted for downvote" });
    }
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    */

    /* 
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      if (votetype === 'downvote') {
        blog.upVotes -= 1;
        blog.downVotes += 1;
      } else if (votetype === 'upvote') {
        blog.downVotes -= 1;
        blog.upVotes += 1;
      } else {
        return res.status(400).json({ message: "Invalid vote type" });
      } 
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    */

    await blog.save();
    await user.save();
    res.status(200).json({ message: "Vote added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}