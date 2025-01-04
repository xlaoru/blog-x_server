const Router = require("express");
const router = new Router();

const isAuth = require("../middleware/is-auth");
const hasSpecialPermission = require("../middleware/has-special-permission");
const isBanned = require("../middleware/is-banned");

const {
  getBlogs,
  sendBlog,
  getBlogsByTags,
  updateBlog,
  deleteBlog,
  saveBlog,
  getSavedBlogs,
  addComment,
  getComments,
  sendVote
} = require("../controllers/blog-controller.js");

router.get("/blogs", isAuth, getBlogs);

router.post("/blogs/tags", isAuth, getBlogsByTags);

router.get('/blogs/saved', isAuth, getSavedBlogs);

router.get("/blogs/:id/comments", isAuth, getComments);

router.post("/blogs", isAuth, isBanned, sendBlog);

router.patch("/blogs/:id/vote/:votetype", isAuth, isBanned, sendVote)

router.patch("/blogs/:id/save", isAuth, saveBlog);

router.put("/blogs/:id", isAuth, isBanned, hasSpecialPermission, updateBlog);

router.delete("/blogs/:id", isAuth, isBanned, hasSpecialPermission, deleteBlog);

router.post("/blogs/:id/comments", isAuth, isBanned, addComment);

module.exports = router;
