const { Sequelize } = require("sequelize")
const mysqlConfig = require("../configs/database")

const sequelize = new Sequelize({
    username: mysqlConfig.MYSQL_USERNAME,
    password: mysqlConfig.MYSQL_PASSWORD,
    database: mysqlConfig.MYSQL_DB_NAME,
    port: 3306,
    dialect: "mysql",
    logging: false
})

// Models
const Post = require("../models/post")(sequelize)
const User = require("../models/user")(sequelize)
// const Like = require("../models/like")(sequelize)

// Relationships is complicated
// 1 : M
Post.belongsTo(User, { foreignKey: "user_id" })
User.hasMany(Post, { foreignKey: "user_id" })

// Post.belongsToMany(User, { through: Like })
// User.belongsToMany(Post, { through: Like })

module.exports = {
    sequelize,
    Post,
    User,
    // Like
}