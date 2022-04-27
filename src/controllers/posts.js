const { nanoid } = require("nanoid");
const { Post, User, Comment } = require("../lib/sequelize");
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

      const findPostById = await Post.findOne({
        where: {
          id,
        },
        include: User,
      });
      console.log(findPostById);

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
      const { location, caption, like_count, date, user_id } = req.body;

      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = `post-images`;
      const { filename } = req.file;
      // kalo ada error foreign key contrain coba di cek ada g misalakan taro user idnya ada g udh pernah signup blm

      const newPost = await Post.create({
        image_url: `${uploadFileDomain}/${filePath}/${filename}`,
        location,
        caption,
        like_count,
        date,
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
      const { postId } = req.params
      delete req.query._sortBy;
      delete req.query._sortDir;

      const findComment = await Comment.findAndCountAll({
        where: {
          ...req.query,
          post_id: postId
        },
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password", "email", "full_name", "is_verified", "updatedAt"],
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
};

module.exports = PostControllers;
