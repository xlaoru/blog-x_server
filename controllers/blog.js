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