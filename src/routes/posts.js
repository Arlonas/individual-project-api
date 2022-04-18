const { postControllers } = require("../controllers")
const router = require("express").Router()

router.get("/", postControllers.getAllPost)

router.post("/", )

router.delete("/:id", )

router.patch("/:id", )

module.exports = router