const { DataTypes } = require("sequelize");

const Like = (sequelize) => {
  return sequelize.define("Like", {
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },

    PostId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Posts",
        key: "id",
      },
    },
  });
};

// module.exports = Like;
