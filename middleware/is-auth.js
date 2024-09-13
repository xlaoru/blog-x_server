const jwt = require("jsonwebtoken");
const { secret } = require("../config");

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ message: "Auth error: no authorization header." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Auth error: no token provided." });
    }

    const decodedData = jwt.verify(token, secret);
    req.user = decodedData;

    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: "Auth error: token verification failed." });
  }
};
