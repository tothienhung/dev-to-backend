const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const { OAuth2Client } = require('google-auth-library');
const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config();

const crypto = require('crypto');
const nodemailer = require('nodemailer');
exports.signup = async (req, res) => {

  try {
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    if (user) {
      res.send({ message: "User registered successfully!" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      config.secret,
      {
        algorithm: 'HS256',
        expiresIn: 86400, // 24 hours
      }
    );

    return res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken: token,
    });
  } catch (error) {
    console.error('Signin Error:', error);
    return res.status(500).send({ message: error.message });
  }
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({
      message: "You've been signed out!"
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }
    console.log("error forgot")
    // Tạo token đặt lại mật khẩu
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Log giá trị JWT_SECRET
    console.log("Creating reset token with secret:", process.env.JWT_SECRET);
    // Cập nhật người dùng với token và thời gian hết hạn
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
    await user.save();

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Yêu cầu đặt lại mật khẩu',
      text: `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu tài khoản của bạn.\n\n
      Vui lòng nhấn vào liên kết sau hoặc sao chép và dán vào trình duyệt của bạn để hoàn tất quy trình:\n\n
      ${resetPasswordUrl}\n\n
      Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không bị thay đổi.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Email đặt lại mật khẩu đã được gửi!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;


    // Log giá trị JWT_SECRET
    console.log("Verifying reset token with secret:", process.env.JWT_SECRET);
    // Thử giải mã token và thêm debug nếu có lỗi
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      console.log("Token decoded successfully:", decoded);
    } catch (err) {
      console.error("Error decoding token:", err.message);
      return res.status(400).json({ message: "Token không hợp lệ." });
    }

    // Tìm kiếm người dùng dựa trên token và thời hạn của token
    const user = await User.findOne({
      where: {
        id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }, // Token phải chưa hết hạn
      },
    });

    if (!user) {
      console.error("Invalid or expired token");
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }

    console.log("User found:", user.email);

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("New password hashed successfully");

    // Cập nhật thông tin người dùng với mật khẩu mới và xóa token
    user.password = hashedPassword;
    user.resetPasswordToken = null;  // Xóa token sau khi đặt lại thành công
    user.resetPasswordExpires = null;
    await user.save();

    console.log("Password updated successfully for user:", user.email);

    res.json({ message: "Mật khẩu của bạn đã được cập nhật!" });
  } catch (error) {
    console.error("Error during password reset:", error.message);
    res.status(500).json({ message: error.message });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Lấy user từ JWT token đã được xác thực
    const userId = req.userId;

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Kiểm tra auth_provider
    if (user.auth_provider === 'google') {
      // Nếu auth_provider là Google, cho phép đổi mật khẩu mà không kiểm tra mật khẩu cũ
      const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
      user.password = hashedNewPassword;

      // Lưu mật khẩu mới
      await user.save();

      return res.status(200).json({ message: 'Password changed successfully without current password verification!' });
    }
    // Kiểm tra mật khẩu hiện tại có đúng không
    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
    if (!passwordIsValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Mã hóa mật khẩu mới
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedNewPassword;

    // Lưu mật khẩu mới
    await user.save();

    res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}








// Tạo client của Google OAuth2 với CLIENT_ID và CLIENT_SECRET từ .env
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

// Hàm tạo mật khẩu ngẫu nhiên
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

exports.googleLogin = async (req, res) => {
  const { id_token } = req.body; // Nhận id_token từ frontend

  if (!id_token) {
    return res.status(400).json({ message: 'Thiếu id_token từ Google' });
  }

  try {
    // Xác thực token với Google
    const ticket = await client.verifyIdToken({
      idToken: id_token, // Sử dụng id_token từ request
      audience: process.env.GOOGLE_CLIENT_ID, // CLIENT_ID của bạn
    });

    const payload = ticket.getPayload(); // Nhận thông tin từ Google

    // Kiểm tra người dùng đã tồn tại trong hệ thống chưa
    let user = await User.findOne({ where: { email: payload.email } });

    if (!user) {
      // Nếu chưa tồn tại, tạo mới người dùng
      const randomPassword = generateRandomPassword(); // Tạo mật khẩu ngẫu nhiên
      const hashedPassword = await bcrypt.hash(randomPassword, 10); // Mã hóa mật khẩu

      user = await User.create({
        email: payload.email,
        username: payload.name || payload.email.split('@')[0], // Dùng tên đầy đủ hoặc phần đầu email làm username
        password: hashedPassword, // Lưu mật khẩu đã mã hóa
        auth_provider: 'google',
      });
    }


    // Tạo JWT token cho người dùng trong hệ thống
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token hết hạn sau 1 giờ
    });

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token: accessToken, // Trả JWT token về cho frontend
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Lỗi xác thực Google:', error);
    return res.status(401).json({ message: 'Xác thực Google thất bại' });
  }
};
