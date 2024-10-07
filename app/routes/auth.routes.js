const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { authJwt } = require("../middleware");
const cors = require('cors'); // Import cors

module.exports = function (app) {
  // Cấu hình CORS để cho phép các yêu cầu từ domain frontend của bạn
  app.use(cors({
    origin: 'https://admin-frontend-ochre.vercel.app', // Đảm bảo không có khoảng trắng
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Origin, Content-Type, Accept, Authorization',
    credentials: true // Thêm nếu cần gửi cookies hoặc thông tin xác thực
  }));

  // Xử lý các yêu cầu preflight (OPTIONS) cho tất cả các route
  // app.options('*', cors()); // Không cần thiết nếu đã có app.use(cors({...}))

  // Đặt headers chung cho tất cả các yêu cầu
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // Các route xác thực
  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/signout", controller.signout);

  app.post("/api/auth/forgotpassword", controller.forgotPassword);

  app.post("/api/auth/reset-password/:token", controller.resetPassword);

  app.post('/api/auth/change-password', [authJwt.verifyToken], controller.changePassword);
};
