const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { authJwt } = require("../middleware");
const passport = require('passport');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,

    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/signout", controller.signout);

  app.post("/api/auth/forgotpassword", controller.forgotPassword);

  app.post("/api/auth/reset-password/:token", controller.resetPassword);

  app.post('/api/auth/change-password', [authJwt.verifyToken], controller.changePassword);

  app.post('/api/auth/google', controller.googleLogin);
  app.post('/api/auth/facebook', controller.facebookLogin);

  
};