const { DataTypes } = require("sequelize");

const Comment = (sequelize) => {
  return sequelize.define("Comment", {
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

module.exports = Comment;
