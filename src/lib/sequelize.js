const { Sequelize } = require("sequelize");
const mysqlConfig = require("../configs/database");

const sequelize = new Sequelize({
  username: mysqlConfig.MYSQL_USERNAME,
  password: mysqlConfig.MYSQL_PASSWORD,
  database: mysqlConfig.MYSQL_DB_NAME,
  port: 3306,
  dialect: "mysql",
  logging: false,
});

// Models
const Post = require("../models/post")(sequelize);
const User = require("../models/user")(sequelize);
const Comment = require("../models/comment")(sequelize);
const Like = require("../models/like")(sequelize);
const VerificationToken = require("../models/verfication_token")(sequelize);
const ForgotPasswordToken = require("../models/forgot_password_token")(
  sequelize
);

// Relationships is complicated
// 1 : M
Post.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Post, { foreignKey: "user_id" });
ForgotPasswordToken.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(ForgotPasswordToken, { foreignKey: "user_id" });
VerificationToken.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(VerificationToken, { foreignKey: "user_id" });

// M : M
Post.belongsToMany(User, {
  through: Like,
  foreignKey: "post_id",
  as: "user_likes",
});
User.belongsToMany(Post, {
  through: Like,
  foreignKey: "user_id",
  as: "user_likes",
});
User.hasMany(Like, { foreignKey: "user_id" });
Like.belongsTo(User, { foreignKey: "user_id" });
Post.hasMany(Like, { foreignKey: "post_id" });
Like.belongsTo(Post, { foreignKey: "post_id" });

Comment.belongsTo(Post, { foreignKey: "post_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Comment, { foreignKey: "user_id" });
Post.hasMany(Comment, { foreignKey: "post_id" });

module.exports = {
  sequelize,
  Post,
  User,
  Comment,
  Like,
  VerificationToken,
  ForgotPasswordToken,
};
