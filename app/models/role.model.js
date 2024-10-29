module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("role", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),  
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),  
    },
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'roleId' });
  };

  return Role;
};
