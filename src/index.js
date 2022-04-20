const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const PORT = process.env.PORT


const { sequelize } = require("./lib/sequelize")
sequelize.sync({ alter: true })

const app = express()

app.use(cors())
app.use(express.json())

const { authRoutes, postRoutes } = require("./routes")

app.use("/post-images", express.static(`${__dirname}/public/posts`))
app.use("/profile-pictures", express.static(`${__dirname}/public/profile_pictures`))

app.use("/auth", authRoutes)
app.use("/post", postRoutes)

app.use((err, req, res, next) => {
    return res.status(500).json({
        message:"Server error"
    })
})

app.listen(PORT, () => {
    console.log("Listening in port", PORT)
})