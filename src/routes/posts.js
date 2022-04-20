const { postControllers } = require("../controllers")
const router = require("express").Router()
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware")

router.get("/", postControllers.getAllPost)

router.post("/", postControllers.createPost)

router.delete("/:id", authorizedLoggedInUser, postControllers.deletePostById)

router.patch("/:id", authorizedLoggedInUser, postControllers.editPostById)

module.exports = router