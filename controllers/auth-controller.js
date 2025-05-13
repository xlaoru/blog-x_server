const events = require("events")
const emitter = new events.EventEmitter()

const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const { generateTokens, validateRefreshToken } = require('../service/token-service');

const User = require("../models/user.model");
const Blog = require("../models/blog.model");

exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().join(', ') });
    }

    const { name, email, password, role } = req.body;

    const candidate = await User.findOne({ email });
    if (candidate) {
      return res
        .status(400)
        .json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 7);

    const userCount = await User.countDocuments({});
    const userRole = userCount === 0 ? "OWNER" : (role || "USER");

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    await user.save();

    const userUpdatePayload = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isBanned: user.isBanned
    };

    emitter.emit("created_user", { type: "created_user", payload: userUpdatePayload });

    return res.json({ message: "User created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Registration error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: `User with email ${email} not found.` });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const tokens = await generateTokens({ id: user._id });

    const isAdminOrOwner = user.role === "ADMIN" || user.role === "OWNER";

    const userValidData = {
      isAdminOrOwner: isAdminOrOwner,
      isBanned: user.isBanned,
      _id: user._id,
      avatar: user.avatar,
      email: user.email,
      name: user.name,
      role: user.role,
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

exports.eventsControl = async (req, res) => {
  try {
    res.writeHead(200, {
      "Connection": "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache"
    });

    const send = (message) => {
      res.write(`data: ${JSON.stringify(message)} \n\n`);
    };

    const updataingHandler = (data) => send(data);

    emitter.on("created_user", updataingHandler)
    emitter.on("updated_user", updataingHandler);

    req.on("close", () => {
      emitter.off("created_user", updataingHandler);
      emitter.off("updated_user", updataingHandler);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Events control error." });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token not provided." });
    }

    const userData = await validateRefreshToken(refreshToken);

    if (!userData) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const tokens = await generateTokens({ id: userData.id });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ token: tokens.accessToken, message: "Token refreshed successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Token refresh error." });
  }
}

exports.getUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const users = await User.find({});

    const usersData = users.map(user => {
      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isBanned: user.isBanned,
      }
    })

    const isAdminOrOwner = user.role === "ADMIN" || user.role === "OWNER";

    const userValidData = {
      isAdminOrOwner: isAdminOrOwner,
      isBanned: user.isBanned,
      _id: user._id,
      avatar: user.avatar,
      email: user.email,
      name: user.name,
      role: user.role,
      savedBlogs: user.savedBlogs,
    }

    return res.json({ users: usersData, userValidData, message: "Users fetched successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Users not found." });
  }
}

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const userBlogs = await Blog.find({ _id: { $in: user.blogs } });
    const userBlogsArray = userBlogs.map(blog => {
      const upVote = user.votedBlogs.find(vote => vote.blogId.toString() === blog._id.toString() && vote.vote === "upvote");
      const downVote = user.votedBlogs.find(vote => vote.blogId.toString() === blog._id.toString() && vote.vote === "downvote");
      return {
        ...blog._doc,
        isSaved: user.savedBlogs.includes(blog._id),
        upVotes: {
          quantity: blog.upVotes.quantity,
          isVoted: !!upVote
        },
        downVotes: {
          quantity: blog.downVotes.quantity,
          isVoted: !!downVote
        }
      }
    })

    const isAdminOrOwner = user.role === "ADMIN" || user.role === "OWNER";

    const userValidData = {
      isAdminOrOwner: isAdminOrOwner,
      isBanned: user.isBanned,
      _id: user._id,
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      role: user.role,
      bio: user.bio,
      blogs: userBlogsArray,
    }

    return res.json({ userValidData, message: "User fetched successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "User not found." });
  }
};

exports.editUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found.` });
    }

    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.avatar = req.body.avatar || user.avatar;

    await user.save();

    return res.json({ user, message: "User updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "User not found." });
  }
}

exports.banUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { id } = req.params;

    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found.` });
    }

    const candidate = await User.findById(id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    if (candidate.role === "OWNER") {
      return res.status(403).json({ message: "Access denied: cannot ban OWNER." });
    }

    if (candidate.isBanned) {
      return res.status(403).json({ message: "Access denied: user is already banned." });
    }

    candidate.isBanned = true;
    await candidate.save();

    const isAdminOrOwner = candidate.role === "ADMIN" || candidate.role === "OWNER";

    const userUpdatePayload = {
      userId: candidate._id.toString(),
      changes: {
        isBanned: candidate.isBanned,
        isAdminOrOwner: isAdminOrOwner,
        role: candidate.role
      }
    };

    emitter.emit("updated_user", { type: "updated_user", payload: userUpdatePayload });

    return res.json({ message: "User banned successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "User not found." });
  }
}

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { id } = req.params;

    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found.` });
    }

    const candidate = await User.findById(id);

    if (candidate.role === "OWNER") {
      return res.status(403).json({ message: "Access denied: cannot unban OWNER." });
    }

    if (!candidate.isBanned) {
      return res.status(403).json({ message: "Access denied: user is not banned." });
    }

    candidate.isBanned = false;
    await candidate.save();

    const isAdminOrOwner = candidate.role === "ADMIN" || candidate.role === "OWNER";

    const userUpdatePayload = {
      userId: candidate._id.toString(),
      changes: {
        isBanned: candidate.isBanned,
        isAdminOrOwner: isAdminOrOwner,
        role: candidate.role
      }
    };

    emitter.emit("updated_user", { type: "updated_user", payload: userUpdatePayload });

    return res.json({ message: "User unbanned successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "User not found." });
  }
}

exports.setAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { id } = req.params

    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found.` });
    }

    const candidate = await User.findById(id);

    if (!candidate) {
      return res.status(404).json({ message: "User not found." });
    }

    if (candidate.role === "OWNER") {
      return res.status(403).json({ message: "Access denied: cannot change OWNER role." });
    }

    if (candidate.role === "ADMIN") {
      return res.status(403).json({ message: "Access denied: user is already an ADMIN." });
    }

    candidate.role = "ADMIN";
    await candidate.save();

    const isAdminOrOwner = candidate.role === "ADMIN" || candidate.role === "OWNER";

    const userUpdatePayload = {
      userId: candidate._id.toString(),
      changes: {
        isBanned: candidate.isBanned,
        isAdminOrOwner: isAdminOrOwner,
        role: candidate.role
      }
    };

    emitter.emit("updated_user", { type: "updated_user", payload: userUpdatePayload });

    res.status(200).json({ message: "User role updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "User not found." });
  }
}

exports.removeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { id } = req.params;

    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found.` });
    }

    const candidate = await User.findById(id);

    if (!candidate) {
      return res.status(404).json({ message: "User not found." });
    }

    if (candidate.role === "OWNER") {
      return res.status(403).json({ errors: "Access denied: cannot change OWNER role." });
    }

    if (candidate.role === "USER") {
      return res.status(403).json({ message: "Access denied: user is already a USER." });
    }

    candidate.role = "USER";
    await candidate.save();

    const isAdminOrOwner = candidate.role === "ADMIN" || candidate.role === "OWNER";

    const userUpdatePayload = {
      userId: candidate._id.toString(),
      changes: {
        isBanned: candidate.isBanned,
        isAdminOrOwner: isAdminOrOwner,
        role: candidate.role
      }
    };

    emitter.emit("updated_user", { type: "updated_user", payload: userUpdatePayload });

    res.status(200).json({ message: "User role updated successfully." });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ message: "User not found." });
  }
}