const { postControllers } = require("../controllers")
const router = require("express").Router()

router.get("/", postControllers.getAllPost)

router.post("/", postControllers.createPost)

router.delete("/:id", )

router.patch("/:id", )

module.exports = router