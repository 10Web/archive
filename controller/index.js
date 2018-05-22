'use strict';

const config = require('../config');
const GitArchive = require('..//model/git');
const co = require('co');
const _ = require('lodash');
const log = require('../common/log');
const markdown = require('markdown').markdown;

const archive = new GitArchive(config.own, config.repo);

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
exports.list = function (req, callback) {
  const query = req.query;
  const offset = query.offset || 0;
  const limit = query.limit || 10;
  const name = query.name || '';
  log.info('begin to fetch data');
  co(function* () {
    const result = yield archive.list(offset, limit, name);
    callback(null, result, 'json');
  });
};

/**
 * @api /find/:name
 * @description 获取某一篇文章的详情
 * @params
 *  name {String} archive的name
 */
exports.find = function (req, callback) {
  const name = _.get(req, 'params.name');
  if (!name) {
    return callback('NO_NAME_FOUND');
  }

  co(function* () {
    const item = yield archive.find(name);
    callback(null, item, 'json');
  });
};

/**
 * @api /p/:name
 * @description 用于访问每一个archive的具体内容
 */
exports.p = function (req, callback) {
  const name = _.get(req, 'params.name');
  if (!name) {
    return callback(null, '/error_not_fount', 'redirect');
  }

  co(function* () {
    const item = yield archive.find(name);
    if (item) {
      item.content = markdown.toHTML(item.content);
      callback(null, {
        tpl: 'p.html',
        data: {
          archive: item,
          prefix: config.prefix === '/' ? '' : config.prefix
        }
      }, 'html');
    }
  }).catch(e => {
    callback(e.stack || e.message || e);
  });
};
