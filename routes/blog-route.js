const Router = require("express");
const router = new Router();

const isAuth = require("../middleware/is-auth.js");

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

router.get("/blogs/tags", isAuth, getBlogsByTags);

router.get('/blogs/saved', isAuth, getSavedBlogs);

router.get("/blogs/:id/comments", isAuth, getComments);

router.post("/blogs", isAuth, sendBlog);

router.patch("/blogs/:id/vote/:votetype", isAuth, sendVote)

router.patch("/blogs/:id/save", isAuth, saveBlog);

router.put("/blogs/:id", isAuth, updateBlog);

router.delete("/blogs/:id", isAuth, deleteBlog);

router.post("/blogs/:id/comments", isAuth, addComment);

module.exports = router;
