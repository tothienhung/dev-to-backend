const config = require('../config/db.config.js')
const Sequelize = require('sequelize')
const mysql2 = require('mysql2')

const sequelize = new Sequelize(
  config.db_name,
  config.db_user,
  config.db_password,
  {
    host: config.db_host,
    port: config.db_port,
    dialect: config.db_dialect,
    dialectModule: mysql2,
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: config.db_pool.max,
      min: config.db_pool.min,
      acquire: config.db_pool.acquire,
      idle: config.db_pool.idle,
    },
  }
)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.user = require('./user.model.js')(sequelize, Sequelize)
db.role = require('./role.model.js')(sequelize, Sequelize)

module.exports = db
