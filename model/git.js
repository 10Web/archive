const request = require('superagent');
const co = require('co');
const _ = require('lodash');
const log = require('../common/log');

// 缓存,文章多了需要使用到redis
const cache = {};
const findCache = {};

// 列出某一个项目的所有的readme
// 用这个project作为archive的容器
class GitArchive {
  /**
   *
   * @param {String} own 拥有者
   * @param {String} repo repositry
   */
  constructor(own, repo) {
    this.own = own;
    this.repo = repo;
    this.baseUrl = `https://api.github.com/repos/${this.own}/${this.repo}/contents`;
  }

  /**
   * 列出部分archive
   * TODO: 这个api会列出所有的数据，需要作出缓存
   * @param {Object} where 筛选条件
   *           {Number} offset 偏移
   *           {Number} limit 限制
   *           {String} name 筛选条件
   */
  list(
    offset = 0,
    limit = 10,
    name = ''
  ) {
    const self = this;
    return co(function* () {
      const baseUrl = self.baseUrl;
      const now = new Date();

      // 检查缓存
      if (cache[name + offset + limit]) {
        log.info('use cache');
        const save = cache[name + offset + limit];
        // 5分钟内使用缓存
        if (Number(save.time - now) <= 5 * 60 * 1000) {
          return save.data;
        }
      }

      const result = yield request.get(baseUrl);
      let list = result.body;
      /**
        {
          "name": ".gitignore",
          "size": 938,
          "url": "https://api.github.com/repos/10Web/archive/contents/.gitignore?ref=master",
          "html_url": "https://github.com/10Web/archive/blob/master/.gitignore",
          "git_url": "https://api.github.com/repos/10Web/archive/git/blobs/05714e45f4424acb4da185fb3b001b34384e4c50",
          "download_url": "https://raw.githubusercontent.com/10Web/archive/master/.gitignore",
          "type": "file",
        }
      */
      // 对文件名进行模糊筛选
      list = list.filter(i => {
        return i.name.indexOf(name) >= 0;
      });
      const total = list.length;
      // 切割
      list = _.slice(list, offset, offset + limit);
      for (let item of list) {
        try {
          const file = (yield request.get(`${baseUrl}/${item.name}`)).body;
          item.content = new Buffer(file.content, 'base64').toString();
        } catch (e) {
          log.error(e.stach || e.message || e);
        }
      }

      // 存入缓存
      log.info('save cache');
      cache[name + offset + limit] = {
        time: new Date(),
        data: {
          list: list,
          total: total
        }
      };

      return {
        list: list,
        total: total
      };
    });
  }

  /**
   * 获取某一个文件的内容
   * @param {String} filename 传入filename获取内容
   */
  find(filename) {
    const baseUrl = this.baseUrl;

    // 检查缓存
    if (findCache[filename]) {
      const file = findCache[filename];
      if (Number(file.time - new Date()) <= 60 * 1000) {
        return file.data;
      }
    }

    return co(function* () {
      const file = (yield request.get(`${baseUrl}/${filename}`)).body;
      const content = new Buffer(file.content, 'base64').toString();
      file.content = content;

      // 存入缓存
      findCache[filename] = {
        time: new Date(),
        data: file
      };

      return file;
    });
  }
}

module.exports = GitArchive;
