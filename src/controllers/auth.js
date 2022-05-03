const { Op } = require("sequelize");
const { nanoid } = require("nanoid");
const { User } = require("../lib/sequelize");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../lib/jwt");
const mailer = require("../lib/mailer");
const mustache = require("mustache");
const fs = require("fs");
// tanya kak theo gimn carnaya forget password pake jwt
// kalo mau tampilin waktu buat di detail post hrs ditolocalestring
const authControllers = {
  signupUser: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const isUsernameEmailTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });
      console.log(isUsernameEmailTaken);

      if (isUsernameEmailTaken) {
        return res.status(400).json({
          message: "Username or Email has been taken",
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 5);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        id: nanoid(40)
      });

      const verificationToken = generateToken(
        {
          id: newUser.id,
          isEmailVerification: true,
        },
        "1h"
      );

      const verificationLink = `http://localhost:2020/auth/verify/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username,
        verify_url: verificationLink,
      });

      await mailer({
        to: email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });

      return res.status(201).json({
        message: "Registered User",
        // di frontend g perlu res.data.result.datavalues lagi lgsng aja username ato id
        result: newUser,
      });
    } catch (err) {
      console.log(err);
      next(res);
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
      next(res);
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

      return res.redirect(
        `http://localhost:3000/verification-success?referral=${token}`
      );
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  keepLogin: async (req, res, next) => {
    try {
      const { id } = req.token;

      // console.log(id)
      const renewedToken = generateToken({ id });
      //  ngirim sebuah object bukan array seperti findOne
      const findUser = await User.findByPk(id);

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
      next(res);
    }
  },
  resendVerificationEmail: async (req, res, next) => {
    try {
      const userId = req.token.id;

      const findUser = await User.findByPk(userId);

      if (findUser.is_verified) {
        return res.status(400).json({
          message: "User is already verified",
        });
      }

      const verificationToken = generateToken(
        {
          id: userId,
          isEmailVerification: true,
        },
        "1h"
      );

      const verificationLink = `http://localhost:2020/auth/verify/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username: findUser.username,
        verify_url: verificationLink,
      });

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
      next(res);
    }
  },
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      const findUser = await User.findOne({
        where: {
          email,
        },
      });
      if(!findUser) {
        return res.status(400).json({
          message: "Wrong email, Please input the right email"
        })
      }

      const forgotPasswordToken = generateToken(
        {
          id: findUser.id,
        },
        "15m"
      );

      const forgotPasswordLink = `http://localhost:2020/change-password?${forgotPasswordToken}`;

      const template = fs
        .readFileSync(__dirname + "/../templates/forgotPassword.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username: findUser.username,
        verify_url: forgotPasswordLink,
      });

      await mailer({
        to: email,
        subject: "Please click the button below to change your password!",
        html: renderedTemplate,
      });

      return res.status(201).json({
        message: "Email sent, please check your inbox",
      });

      // di frontend dapetin token di url itu pake router.query.token.id buat daptein id dari user
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const { password, forgotPasswordToken } = req.body;

      const verifiedforgotPasswordToken = verifyToken(forgotPasswordToken);

      if (!verifiedforgotPasswordToken) {
        return res.status(400).json({
          message: "Invalid Token",
        });
      }
      const hashedPassword = bcrypt.hashSync(password, 7);
      await User.update(
        { password: hashedPassword },
        {
          where: {
            id: verifiedforgotPasswordToken.id,
          },
        }
      );

      return res.status(200).json({
        message: "Change password success",
      });
    } catch (err) {
      console.log(err);
      next(res);
    }
  },
};

module.exports = authControllers;
