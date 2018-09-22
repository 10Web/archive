'use strict';

module.exports = {
  /* honeybee config occupied */
  root: undefined,
  serverRoot: undefined,
  serverEnv: undefined,
  /* honeybee config end */
  debug: true,
  prefix: true,
  staticPath: undefined,
  logs: {
    sys: {
      level: 'INFO'
    }
  },
  middleware: {
    cookieSession: {
      config: {
        secret: 'defalutSecret!PLEASE!REPLACE!'
      }
    }
  },
  extension: {
  },
  own: 'your-repositry-owner',
  repo: 'your-repositry-url'
};
