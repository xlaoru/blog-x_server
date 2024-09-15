const Blog = require("../models/blog.model");
const User = require("../models/user.model");

exports.getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({});
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

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

      res.status(200).json(blog);
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
      res.status(404).json({ message: "You are not allowed to delete this blog" })
    } else {
      const blog = await Blog.findByIdAndDelete(id);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      user.blogs = user.blogs.filter((blogId) => blogId.toString() !== id);
      await user.save();

      res.status(200).json({ message: "Blog deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
