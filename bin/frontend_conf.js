/**
 * Created by Nonjene on 2017/3/5.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { asyncEach } = require('./util/asyncEach');
const T = require('./util/tpl');

/**
 * 把所有config_v.js 修改。
 * @param {*object} props mode, debug option
 * @param {*array} targets 文件夹
 */
const change = function(props, targets) {
  return new Promise((resolve, reject) => {
    asyncEach(
      targets,
      (target, next) =>
        writeConf(props, target)
          .then(next)
          .catch(reject),
      resolve
    );
  });
};

const writeConf = function(props, target) {
  return new Promise((resolve, reject) => {
    const dir = `${process.cwd()}/src/${target}`;
    /* istanbul ignore if */
    if (!fs.existsSync(dir)) return reject(`指定的文件夹不存在：${target}, ${dir}`);

    fs.writeFile(path.join(dir, 'config_v.js'), T(config.frontendConfCode, props), err => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = {
  promiseSetDone: {
    then (cb) {
      /* istanbul ignore next */
      console.log("Haven't set frontend config, use last setting.");
      /* istanbul ignore next */
      return cb && cb('nothing');
    }
  },
  setFrontEndConf(...arg) {
    const proName = config.getProFetchName();
    let [mode = proName, debug = true, target] = arg;
    if (arg.length === 2) {
      target = debug;
      debug = true;
    }
    /* istanbul ignore if */
    if (arg.length === 1) {
      throw new Error('构建错误：设置setFrontEndConf没有接收到target。');
    }

    if (mode === proName) debug = false;

    this.promiseSetDone = change({ mode, debug }, target);

    config.setConf('fronendEnv', mode);
    return this.promiseSetDone;
  }
};
