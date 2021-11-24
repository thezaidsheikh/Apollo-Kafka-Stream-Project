'use strict';

module.exports = (function (env) {
  env = env||'development';
    let config = {};
    switch (env) {
      case 'production':
        config = require('../env/production');
        break;
      case 'development':
        config = require('../env/development');
        break;
      default:
        // console.error('NODE_ENV environment variable not set');
        // process.exit(1);
        config = require('../env/development');
    }
    return config;
  })(process.env.NODE_ENV);