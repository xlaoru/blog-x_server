const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const { secret } = require("../config");

const User = require("../models/user.model");

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
    return res.json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Login error." }] });
  }
};
