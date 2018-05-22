const log = require('./log');
const config = require('../config');

const mysql = config.mysql;
const Sequelize = require('sequelize');
const sequelize = new Sequelize(mysql.database, mysql.username, mysql.password, {
  host: mysql.host,
  port: mysql.port,
  dialect: 'mysql',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize
  .authenticate()
  .then(() => {
    log.info('MYSQL_TEST_CONNECT', 'Connection has been established successfully.');
  })
  .catch(err => {
    log.info('MYSQL_TEST_CONNECT', 'Unable to connect to the database:', err);
  });

module.exports = sequelize;
