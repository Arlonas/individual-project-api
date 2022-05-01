const { nanoid } = require("nanoid");
const { Post, User, Comment, Like } = require("../lib/sequelize");
const fs = require("fs");

const PostControllers = {
  // kalo mau daptein user liked post mana tinggal fetch post dengan user id sama userid yang lagi login sama trs di include keusernya
  getAllPost: async (req, res, next) => {
    try {
      // _limit = 5, _page = 1
      const { _sortBy = "", _sortDir = "" } = req.query;
      //  didelete karena biar g masuk ke dalam wherenya
      // biar g error karena di dlm wherenya g ada kolom limit dan page
      // delete req.query._limit;
      // delete req.query._page;
      delete req.query._sortBy;
      delete req.query._sortDir;
      const findPosts = await Post.findAndCountAll({
        where: {
          ...req.query,
        },
        // _limit: _limit ? parseInt(_limit) : undefined,
        // offset: (_page - 1) * _limit,
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
        // kalo sortbynya createdat dia akan return array kalo g undefined
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });

      return res.status(200).json({
        message: "Find posts",
        result: findPosts,
      });
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  getPostById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { _limit = 5, _sortBy = "", _sortDir = "" } = req.query

      delete req.query._limit
      delete req.query._sortBy
      delete req.query._sortDir
      const findPostById = await Post.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Comment,
            limit: _limit ? parseInt(_limit) : undefined,
            include: [
              {
                model: User,
                attributes: {
                  exclude: [
                    "password",
                    "email",
                    "full_name",
                    "is_verified",
                    "createdAt",
                    "updatedAt",
                  ],
                },
              },
            ],
            order: _sortBy ? [[_sortBy, _sortDir]] : undefined
          },
          {
            model: User,
            attributes: {
              exclude: [
                "password",
                "email",
                "full_name",
                "is_verified",
                "createdAt",
                "updatedAt",
              ],
            },
          },
        ],
      });
      // console.log(findPostById);

      delete findPostById.User.dataValues.password;

      return res.status(200).json({
        message: "Fetch Post By Id",
        result: findPostById,
      });
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  createPost: async (req, res, next) => {
    try {
      const { location, caption, like_count, user_id } = req.body;

      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = `post-images`;
      const { filename } = req.file;
      // kalo ada error foreign key contrain coba di cek ada g misalakan taro user idnya ada g udh pernah signup blm

      const newPost = await Post.create({
        image_url: `${uploadFileDomain}/${filePath}/${filename}`,
        location,
        caption,
        like_count,
        user_id,
        id: nanoid(40),
      });
      return res.status(201).json({
        message: "Post created",
        result: newPost,
      });
    } catch (err) {
      console.log(err);
      fs.unlinkSync(__dirname + "/../public/posts/" + req.file.filename);
      next(res);
    }
  },
  editPostById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const updatedPost = await Post.update(
        {
          ...req.body,
        },
        {
          where: {
            id,
            user_id: req.token.id,
          },
        }
      );
      return res.status(201).json({
        message: "Post edited",
        result: updatedPost,
      });
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  deletePostById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const deletedPost = await Post.destroy({
        where: {
          id,
          user_id: req.token.id,
        },
      });

      return res.status(201).json({
        message: "Post deleted",
        result: deletedPost,
      });
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  createComment: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { comment } = req.body;

      const newComment = await Comment.create({
        comment,
        post_id: postId,
        user_id: req.token.id,
      });

      return res.status(201).json({
        message: "Comment created",
        result: newComment,
      });
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  getAllComment: async (req, res, next) => {
    try {
      const { _sortBy = "", _sortDir = "" } = req.query;
      const { postId } = req.params;
      delete req.query._sortBy;
      delete req.query._sortDir;

      const findComment = await Comment.findAndCountAll({
        where: {
          ...req.query,
          post_id: postId,
        },
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
        include: [
          {
            model: User,
            attributes: {
              exclude: [
                "password",
                "email",
                "full_name",
                "is_verified",
                "updatedAt",
              ],
            },
          },
        ],
      });
      return res.status(200).json({
        message: "Find posts",
        result: findComment,
      });
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  createAndDeleteLike: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const postLikes = await Like.findOne({
        where: {
          post_id: postId,
          user_id: req.token.id,
        },
      });
      if (!postLikes) {
        const newLike = await Like.create({
          post_id: postId,
          user_id: req.token.id,
        });

        await Post.increment({ like_count: 1 }, { where: { id: postId } });

        return res.status(201).json({
          message: "Like created",
          result: newLike,
        });
      }
      if (postLikes) {
        Like.destroy({
          where: {
            post_id: postId,
            user_id: req.token.id,
          },
          truncate: true,
        });

        await Post.increment({ like_count: -1 }, { where: { id: postId } });

        return res.status(201).json({
          message: "Like deleted",
        });
      }
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  getLikes: async (req, res, next) => {
    try {
      const { postId } = req.params;

      const findLike = await Like.findOne({
        where: {
          post_id: postId,
          user_id: req.token.id,
        },
      });
      if (findLike) {
        return res.status(200).json({
          message: "post is liked",
          result: true,
        });
      }
      if (!findLike) {
        return res.status(200).json({
          message: "post are not liked",
          result: false,
        });
      }
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
};

module.exports = PostControllers;
