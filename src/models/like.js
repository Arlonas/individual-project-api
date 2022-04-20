const { DataTypes } = require("sequelize");

const Like = (sequelize) => {
  return sequelize.define("Like", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },

    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Posts",
        key: "id",
      },
    },
  });
};

module.exports = Like;
