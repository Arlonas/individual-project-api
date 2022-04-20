const { Post, User } = require("../lib/sequelize");

const PostControllers = {
  getAllPost: async (req, res, next) => {
    try {
      const { _limit = 5, _page = 1 } = req.query;
      //  didelete karena biar g masuk ke dalam wherenya
      // biar g error karena di dlm wherenya g ada kolom limit dan page
      delete req.query._limit;
      delete req.query._page;
      const findPosts = await Post.findAllAndCountAll({
        where: {
          ...req.query,
        },
        _limit: _limit ? parseInt(_limit) : undefined,
        offset: (_page - 1) * _limit,
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
    // try {
    // } catch (err) {
    //   console.log(err)
    //   next(res)
    // }
  },
  createPost: async (req, res, next) => {
    try {
      const { image_url, location, caption } = req.body;

      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = `post-images`;
      const { fileName } = req.file.filename;

      const newPost = await Post.create({
        image_url: `${uploadFileDomain}/${filePath}/${fileName}`,
        location,
        caption,
      });
      return res.status(201).json({
        message: "Post created",
        result: newPost,
      });
    } catch (err) {
      console.log(err);
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
};

module.exports = PostControllers;
