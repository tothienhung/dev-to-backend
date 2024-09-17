const db = require("../models");
const User = db.user; // Kiểm tra rằng db.user tồn tại và đúng với định nghĩa mô hình

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
// Thêm hàm để lấy tất cả người dùng đã đăng ký
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email"],
      where: { active: true },
    });

    console.log("Fetched users:", users);  // Log danh sách người dùng

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);  // Log chi tiết lỗi
    res.status(500).json({ error: "Failed to fetch users" });
  }
};