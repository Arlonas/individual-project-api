const { Op } = require("sequelize");
const { User } = require("../lib/sequelize");
const bcrypt = require("bcrypt");
const { generateToken } = require("../lib/jwt");
const mailer = require("../lib/mailer");
const authControllers = {
  signupUser: async (req, res, next) => {
    try {
      const { username, email, full_name, password } = req.body;
      const isUsernameEmailTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (isUsernameEmailTaken) {
        return res.status(400).json({
          message: "Username or Email has been taken",
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 5);

      await User.create({
        username,
        email,
        full_name,
        password: hashedPassword,
      });

      await mailer({
        to: email,
        subject: "Verify your account!",
        html: `Your account has been registered, please verify it by clicking the <a href="">link</a>`
      })

      return res.status(201).json({
        message: "Registered User",
      });
    } catch (err) {
      console.log(err);
      next();
    }
  },
  signinUser: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const findUserSignIn = await User.findOne({
        where: {
          username,
        },
      });

      if (!findUserSignIn) {
        return res.status(400).json({
          message: "Wrong username or password",
        });
      }

      const isPasswordCorrect = bcrypt.compareSync(
        password,
        findUserSignIn.password
      );

      if(!isPasswordCorrect) {
          return res.status(400).json({
              message: "Wrong username or password"
          })
      }

      delete findUserSignIn.dataValues.password

      const token = generateToken({ id: findUserSignIn.id })

      // await mailer({
      //   to: "@gmail.com",
      //   subject: "",
      //   text: "",

      // })

      return res.status(200).json({
          message: "Logged in User",
          result: {
              user: findUserSignIn,
              token
          }
      })
    } catch (err) {
      console.log(err);
      next();
    }
  },
  verifyUser: async (req, res, next) => {
    try {

    } catch (err) {
      console.log(err);
      next();
    }
  },
  keepLogin: async (req, res, next) => {
    try {
      const { id } = req.token

      const renewedToken = generateToken({ id })
    //  ngirim sebuah object bukan array seperti findOne
      const findUser = User.findByPk(id)

      delete findUser.dataValues.password

      return res.status(200).json({
        message: "Renewed Token",
        result: {
          user: findUser,
          token: renewedToken
        }
      })
    } catch (err) {
      console.log(err);
      next();
    }
  },
  resendVerificationEmail: async (req, res, next) => {
    try {
    } catch (err) {
      console.log(err);
      next();
    }
  },
};

module.exports = authControllers;
