const { postControllers } = require("../controllers");
const fileUploader = require("../lib/uploader");
const uploader = require("../lib/uploader");
const router = require("express").Router();
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");

router.get("/", postControllers.getAllPost);

router.get("/:id", postControllers.getPostById)

router.post(
  "/",
  authorizedLoggedInUser,
  fileUploader({
    destinationFolder: "posts",
    fileType: "image",
    prefix: "POST",
  }).single("post_image_file"),
  postControllers.createPost
);

router.delete("/:id", authorizedLoggedInUser, postControllers.deletePostById);

router.patch("/:id", authorizedLoggedInUser, postControllers.editPostById);

router.post("/:postId/comments", authorizedLoggedInUser, postControllers.createComment)
router.get("/:postId/comments", postControllers.getAllComment)
router.post("/:postId/likes", authorizedLoggedInUser, postControllers.createAndDeleteLike)
router.get("/:postId/likes", authorizedLoggedInUser, postControllers.getLikes)

module.exports = router;
