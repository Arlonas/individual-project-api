const { DataTypes } = require("sequelize")

const User = (sequelize) => {
    return sequelize.define(
        "User",
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            full_name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            is_verified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            profile_picture: {
                type: DataTypes.STRING,
                allowNull: false
            },
            bio: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }
    )
}

module.exports = User