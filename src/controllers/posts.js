const { Post } = require("../lib/sequelize");

const PostControllers = {
    getAllPost: async (req, res, next) => {
        try {
            const { _limit = 5, _page = 1  } = req.query
        //  didelete karena biar g masuk ke dalam wherenya 
        // biar g eror karena di dlm wherenya g ada kolom limit dan page
            delete req.query._limit
            delete req.query._page
            const findPosts = await Post.findAllAndCountAll({
              where: {
                  ...req.query
              },
              _limit: _limit ? parseInt(_limit) :undefined,
              offset: (_page - 1) * _limit
            })

            return res.status(200).json({
                message: "Find posts",
                result: findPosts
            })
        } catch (err) {
            console.log(err)
            next()
        }
    },
    createPost: async (req, res, next) => {
        try {
            const { image_url, location, caption } = req.body
            const newPost = await Post.create({
               image_url,
               location,
               caption
            })
            return res.status(201).json({
                message: "Post created",
                result: newPost
            })
        } catch (err) {
            console.log(err)
            next()
        }
    }
};

module.exports = PostControllers;
