module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    resetPasswordToken: {
      type: Sequelize.STRING,
    },
    resetPasswordExpires: {
      type: Sequelize.DATE,
    },
    auth_provider: {
      type: Sequelize.STRING,
      defaultValue: 'password',
    },
    roleId: {  
      type: Sequelize.INTEGER,
      references: {
        model: 'roles',  
        key: 'id',
      },
    }
  }, {
    timestamps: true,
    underscored: true,
  });

   
  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'roleId' });
  };

  return User;
};
