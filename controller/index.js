'use strict';

const config = require('../config');
const Archive = require('../common/model/archive');
const co = require('co');
const _ = require('lodash');
const log = require('../common/log');

/**
 * @api /
 * @desc 文章&活动首页
 */
exports.index = function (req, callback) {
  callback(null, {
    tpl: 'index.html',
    data: {
      prefix: config.prefix === '/' ? '' : config.prefix
    }
  }, 'html');
};

/**
 * 
 * @api /list
 * @description 列出所有的文章，带分页功能的
 * @query
 *  offset {Number} 偏移
 *  limit {Number} 分页数目
 */
exports.list = function (req, callback){
  const query = req.query;
  const offset = query.offset || 0;
  const limit = query.limit || 10;
  co(function*(){
    const archives = yield Archive.findAndCountAll({
      limit: limit,
      offset: offset,
    });
    log.info(archives);
    callback(null, archives, 'json');
  }).catch(e => {
    callback(e.stack || e.message || e);
  });
}

/**
 * @api /archive
 * @description 获取某一篇文章的详情
 * @query
 *  id {Number} archive的id
 */
exports.archive = function(req, callback){
  const id = _.get(req,'query.id');
  Archive.findOne({
    where: {
      id: id
    }
  }).then(result => {
    callback(null, result, 'json');
  }).catch(e => {
    callback(e.stack || e.message || e);
  });
}

/**
 * @api /archive/edit
 * @description 编辑某一篇archive
 * @query
 *  id {Number} 
 *  title {String}
 *  content {String}
 */
exports.edit = function(req, callback){
  const { title, content, cover, id } = req.query;
  const writer = _.get(req, 'session.user.login');
  // 如果是自己的文章
  // 如果用户是管理员
  // 就允许编辑文章
  if(!writer){
    return callback('UNAUTH');
  }

  if(title.length >= 30){
    return callback('TITLE_TO_LONG');
  }

  co(function *(){
    log.info('update archive', title, cover);
    yield Archive.update({
      title, content, cover
    }, {
      where: {
        id
      }
    });
    callback(null);
  }).catch(e => {
    callback(e.stack || e.message || e);
  })  
}

/**
 * @api /archive/delete
 * @description 删除某一篇
 * @query
 *  id {Number} 
 */
exports.delete = function(req, callback){
  const { id } = req.query;
  if(!id){
    return callback('NO_ID_GET');
  }
  co(function*(){
    const archive = yield Archive.findOne({
      where: {
        id
      }
    });
    if(archive){
      archive.destroy();
    }
  });
}