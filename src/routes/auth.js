const { authControllers } = require("../controllers")
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware")

const router = require("express").Router()

router.post("/signin", authControllers.signinUser)
router.post("/signup", authControllers.signupUser)

router.get("/refresh-token", authorizedLoggedInUser, authControllers.keepLogin)
router.get("/verify/:token", authControllers.verifyUser)

router.post("/resend-verification", authorizedLoggedInUser, authControllers.resendVerificationEmail)
module.exports = router
