const request = require('superagent');
const co = require('co');
const _ = require('lodash');

const baseUrl = 'https://yuque.com/api/v2';
class Yuque {
  /**
   * @param {String} id repo 的 id, 参考：https://yuque.com/yuque/developer/doc
   */
  constructor(id) {
    this.id = id;
  }

  list(
    offset = 0,
    limit = 20,
    name = '',
  ) {
    const self = this;
    return co(function* () {
      const result = yield request.get(`${baseUrl}/repos/${self.id}/docs`);
      let list = _.get(result, 'body.data');
      if (!list) {
        throw Error('NO_LIST_FOUND');
      }
      // 过滤标题
      list = list.filter(i => {
        return i.title.indexOf(name) >= 0;
      });
      const total = list.length;
      // 切割
      list = _.slice(list, offset, offset + limit);
      return {
        list, total
      };
    });
  }

  find(id) {
    const self = this;
    return co(function* () {
      const result = yield request.get(`${baseUrl}/repos/${self.id}/docs/${id}`);
      let data = _.get(result, 'body.data');
      return data;
    });
  }
}

module.exports = Yuque;

