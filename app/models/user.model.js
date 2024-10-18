module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    username: {
      type: Sequelize.STRING,
      allowNull: false, // Đảm bảo trường này không được để trống
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false, // Đảm bảo trường này không được để trống
      unique: true, // Email phải là duy nhất
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false, // Đảm bảo trường này không được để trống
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true, // Người dùng sẽ được kích hoạt theo mặc định
    },
    resetPasswordToken: {
      type: Sequelize.STRING,
    },
    resetPasswordExpires: {
      type: Sequelize.DATE,
    },

    auth_provider: {
      type: Sequelize.STRING,
      defaultValue: 'password',  // Giá trị mặc định cho đăng ký thông thường
    }
  }, {
    timestamps: true, // Tự động tạo các trường createdAt và updatedAt
    underscored: true, // Chuyển đổi tên trường từ camelCase sang snake_case
  });

  return User;
};
