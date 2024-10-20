const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const { secret } = require("../config");

const User = require("../models/user.model");
const Blog = require("../models/blog.model");

const generateAccessToken = (id) => {
  return jwt.sign({ id }, secret, {
    expiresIn: "24h",
  });
};

exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const candidate = await User.findOne({ email });
    if (candidate) {
      return res
        .status(400)
        .json({ errors: [{ msg: "User already exists." }] });
    }

    const hashedPassword = await bcrypt.hash(password, 7);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "USER",
    });

    await user.save();
    return res.json({ message: "User created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Registration error." }] });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: `User with email ${email} not found.` }] });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ errors: [{ msg: "Incorrect password." }] });
    }

    const token = generateAccessToken(user._id);

    const userValidData = {
      avatar: user.avatar,
      email: user.email,
      name: user.name,
      savedBlogs: user.savedBlogs,
    }

    return res.json({ token, userValidData, message: "User logged in successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Login error." }] });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userBlogs = await Blog.find({ _id: { $in: user.blogs } });
    const userBlogsArray = userBlogs.map(blog => ({
      ...blog._doc,
      isSaved: user.savedBlogs.includes(blog._id)
    }))

    const userData = {
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      bio: user.bio,
      blogs: userBlogsArray,
    }

    return res.json({ user: userData, message: "User fetched successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "User not found." }] });
  }
};

exports.editUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ errors: [{ msg: `User with email ${email} not found.` }] });
    }

    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.avatar = req.body.avatar || user.avatar;

    await user.save();

    return res.json({ user, message: "User updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "User not found." }] });
  }
}