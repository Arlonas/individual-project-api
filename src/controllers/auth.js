const { Op } = require("sequelize");
const { User } = require("../lib/sequelize");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../lib/jwt");
const mailer = require("../lib/mailer");
const mustache = require("mustache")
const fs = require("fs");
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

      const newUser = await User.create({
        username,
        email,
        full_name,
        password: hashedPassword,
      });

      const verificationToken = generateToken({
        id: newUser.id,
        isEmailVerification: true,
      }, "1h");

      const verificationLink = `http://localhost:2020/auth/verify/${verificationToken}`;

      const template = fs.readFileSync(__dirname + "/../templates/verify.html").toString()

      const renderedTemplate = mustache.render(template, {
        username,
        verify_url: verificationLink
      })

      await mailer({
        to: email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });

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

      if (!isPasswordCorrect) {
        return res.status(400).json({
          message: "Wrong username or password",
        });
      }

      delete findUserSignIn.dataValues.password;

      const token = generateToken({ id: findUserSignIn.id });

      // await mailer({
      //   to: "@gmail.com",
      //   subject: "",
      //   text: "",

      // })

      return res.status(200).json({
        message: "Logged in User",
        result: {
          user: findUserSignIn,
          token,
        },
      });
    } catch (err) {
      console.log(err);
      next();
    }
  },
  verifyUser: async (req, res, next) => {
    try {
      const { token } = req.params;

      const isTokenVerified = verifyToken(token);

      if (!isTokenVerified || !isTokenVerified.isEmailVerification) {
        return res.status(400).json({
          message: "Token invalid!",
        });
      }

      await User.update(
        { is_verified: true },
        {
          where: {
            id: isTokenVerified.id,
          },
        }
      );

      return res.redirect(`http://localhost:3000/verification-success?referral=${token}`)
    } catch (err) {
      console.log(err);
      next();
    }
  },
  keepLogin: async (req, res, next) => {
    try {
      const { id } = req.token;

      const renewedToken = generateToken({ id });
      //  ngirim sebuah object bukan array seperti findOne
      const findUser = User.findByPk(id);

      delete findUser.dataValues.password;

      return res.status(200).json({
        message: "Renewed Token",
        result: {
          user: findUser,
          token: renewedToken,
        },
      });
    } catch (err) {
      console.log(err);
      next();
    }
  },
  resendVerificationEmail: async (req, res, next) => {
    try {
      const userId = req.token.id

      const findUser = await User.findByPk(userId)

      if(findUser.is_verified) {
        returnres.status(400).json({
          message: "User is already verified"
        })
      }

      const verificationToken = generateToken({
        id: userId,
        isEmailVerification: true,
      }, "1h");

      const verificationLink = `http://localhost:2020/auth/verify/${verificationToken}`;

      const template = fs.readFileSync(__dirname + "/../templates/verify.html").toString()

      const renderedTemplate = mustache.render(template, {
        username,
        verify_url: verificationLink
      })

      await mailer({
        to: findUser.email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });

      return res.status(200).json({
        message: "Email sent",
      });
    } catch (err) {
      console.log(err);
      next();
    }
  },
};

module.exports = authControllers;
