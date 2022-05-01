const { User, Post } = require("../lib/sequelize");
const fs = require("fs");

const profileControllers = {
  getMyProfile: async (req, res, next) => {
    try {
      const findMyProfile = await User.findOne({
        where: {
          id: req.token.id,
        },
        attributes: {
          exclude: [
            "password",
            "is_verified",
            "updatedAt",
            "id",
            "createdAt",
          ],
        },
        include: [
          {
            model: Post,
            attributes: {
              exclude: [
                "user_id",
                "location",
                "like_count",
                "updatedAt",
                "caption",
                "createdAt",
              ],
            },
          },
        ],
      });
      return res.status(200).json({
        message: "My Profile found",
        result: findMyProfile,
      });
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  getProfileById: async (req, res, next) => {
    try {
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  editMyProfile: async (req, res, next) => {
    try {
      const { username } = req.body;
      const findUser = await User.findOne({
        where: {
          username,
        },
      });
      if (findUser) {
        return res.status(400).json({
          message: "Username has been taken",
        });
      }
      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = `profile-pictures`;
      const { filename } = req.file;

      const updatedMyProfile = await User.update(
        {
          ...req.body,
          profile_picture: `${uploadFileDomain}/${filePath}/${filename}`
        },
        {
          where: {
            id: req.token.id,
          },
        }
      );
      return res.status(201).json({
        message: "Profile updated",
        result: updatedMyProfile
      })
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
};

module.exports = profileControllers;