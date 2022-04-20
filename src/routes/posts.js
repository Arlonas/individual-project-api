const { postControllers } = require("../controllers");
const fileUploader = require("../lib/uploader");
const uploader = require("../lib/uploader");
const router = require("express").Router();
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");

router.get("/", postControllers.getAllPost);

router.post(
  "/",
  fileUploader({
    destinationFolder: "posts",
    fileType: "image",
    prefix: "POST",
  }).single("post_image_file"),
  postControllers.createPost
);

router.delete("/:id", authorizedLoggedInUser, postControllers.deletePostById);

router.patch("/:id", authorizedLoggedInUser, postControllers.editPostById);

module.exports = router;
