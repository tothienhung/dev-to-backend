module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("roles", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true, // Đảm bảo id tự động tăng
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      unique: true, // Đảm bảo tên là duy nhất
      allowNull: false // Không cho phép giá trị null
    }
  }, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    tableName: 'roles' // Tên bảng trong cơ sở dữ liệu
  });

  return Role;
};
