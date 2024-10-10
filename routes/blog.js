const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/is-auth");

const {
  getBlogs,
  sendBlog,
  updateBlog,
  deleteBlog,
  saveBlog
} = require("../controllers/blog.js");

router.get("/api/blogs", isAuth, getBlogs);

router.post("/api/blogs", isAuth, sendBlog);

router.patch("/api/blogs/:id", isAuth, saveBlog);

router.put("/api/blogs/:id", isAuth, updateBlog);

router.delete("/api/blogs/:id", isAuth, deleteBlog);

module.exports = router;
