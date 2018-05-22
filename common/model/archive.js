const Sequelize = require('sequelize');
const sequelize = require('../mysql');

const Archive = sequelize.define('archive', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: Sequelize.STRING,
  },
  content: {
    type: Sequelize.TEXT,
  },
  // 标题
  cover: {
    type: Sequelize.STRING
  },
  // 作者
  writer: {
    type: Sequelize.STRING
  },
  // 浏览次数
  views: {
    type: Sequelize.INTEGER
  },
  // 是否发布
  publish: {
    type: Sequelize.BOOLEAN
  }
});

// force: true 如果表已经存在，将会丢弃表
Archive.sync({force: false});

module.exports = Archive;
