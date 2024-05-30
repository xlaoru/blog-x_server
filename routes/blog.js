const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/is-auth");

const {
  getBlogs,
  sendBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blog.js");

router.get("/api/blogs", getBlogs);

router.post("/api/blogs", sendBlog);
// router.post("/api/blogs", isAuth, sendBlog); // Ready

router.put("/api/blogs/:id", updateBlog);

router.delete("/api/blogs/:id", deleteBlog);

module.exports = router;
