const { Post } = require("../lib/sequelize");

const PostControllers = {
    getAllPost: async (req, res, next) => {
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
