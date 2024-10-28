const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const { generateTokens, validateRefreshToken } = require('../service/token-service');

const User = require("../models/user.model");
const Blog = require("../models/blog.model");

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

    const tokens = await generateTokens({ id: user._id });

    const userValidData = {
      avatar: user.avatar,
      email: user.email,
      name: user.name,
      savedBlogs: user.savedBlogs,
    }

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.json({ token: tokens.accessToken, userValidData, message: "User logged in successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Login error." }] });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(403).json({ errors: [{ msg: "Refresh token not provided." }] });
    }

    const userData = await validateRefreshToken(refreshToken);

    if (!userData) {
      return res.status(403).json({ errors: [{ msg: "Invalid refresh token." }] });
    }

    const tokens = await generateTokens({ id: userData.id });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(500).json({ token: tokens.accessToken, message: "Token refreshed successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Token refresh error." }] });
  }
}

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