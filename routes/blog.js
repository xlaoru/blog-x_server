const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/is-auth");

const {
  getBlogs,
  sendBlog,
  updateBlog,
  deleteBlog,
  saveBlog,
  getSavedBlogs
} = require("../controllers/blog.js");

router.get("/blogs", isAuth, getBlogs);

router.get('/blogs/saved', isAuth, getSavedBlogs);

router.post("/blogs", isAuth, sendBlog);

router.patch("/blogs/:id/save", isAuth, saveBlog);

router.put("/blogs/:id", isAuth, updateBlog);

router.delete("/blogs/:id", isAuth, deleteBlog);

module.exports = router;
