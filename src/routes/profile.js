const { profileControllers } = require("../controllers");
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");
const fileUploader = require("../lib/uploader");

const router = require("express").Router();

router.get("/:id", profileControllers.getProfileById);

router.get("/", authorizedLoggedInUser, profileControllers.getMyProfile);

router.post(
  "/",
  authorizedLoggedInUser,
  fileUploader({
    destinationFolder: "profile_pictures",
    fileType: "image",
    prefix: "POST",
  }).single("update_image_file"),
  profileControllers.editMyProfile
);

router.get(
  "/posts/likes",
  authorizedLoggedInUser,
  profileControllers.getUserLikedPostForMyProfile
);

module.exports = router;
