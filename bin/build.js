/**
 * Created by chenzhian on 2016/7/21.
 */
const path = require('path');
const { combineBuild, getConf, getTarget } = require('./config');

const chalk = require('chalk');

const logInfo = require('./util/logInfo');
const hasDuan = require('./util/hasDuan');
const doBuild = require('./run_build/build');

const _emptyCache = dir => {
  if (require.cache[dir]) {
    delete require.cache[dir];
  }
};

// 给 webpack.config 读取
const setEnv = {
  init(which) {
    this.emptycache();
    this.env();
    this.target(which);
    this.duan();
  },
  env() {
    process.env.NODE_ENV = getConf('env');
    if ( getConf('proSpecific')) {
      process.env.PRO_SPECIFIC = getConf('proSpecific')
    }
  },
  target(which) {
    process.env.BUILD_TARGET = getTarget()[which];
  },
  duan() {
    getConf('duan') && (process.env.DUAN = getConf('duan').join(','));
  },
  emptycache() {
    _emptyCache(require.resolve('./webpack.config.js')); //todo 转移到项目目录
    _emptyCache(require.resolve('./webpack.set.entry.js'));
    //_emptyCache(require.resolve('./run_build/build.js'));
    //_emptyCache(require.resolve('./run_build/watch.js'));
  }
};

const buildOne = function(which = 0, hasLog = true) {
  //export NODE_ENV=production
  //export NODE_ENV=development

  // && export BUILD_TARGET=huodong1
  return new Promise((resolve, reject) => {
    const Tar = getConf('target')[which];
    hasLog &&
      console.log(
        `${chalk.blue('正在编译活动：')}${Tar} 的 ${getConf('duan').join(
          ','
        )} 端...`
      );

    if (hasDuan(Tar).length < 1) {
      return reject(
        chalk.red(
          `没有找到：${Tar}，或里面没有m或pc文件夹，已略过，请检查拼写`
        ) + '🤦'
      );
    }

    try {
      // 清除webpack.config.js的require.cache, 然后设置node.env的config
      setEnv.init(which);
      doBuild(hasLog)
        .then(msg => {
          hasLog && console.log(chalk.cyan('webpack:build'));
          hasLog && console.log(msg);
          // 下一个
          resolve();
        })
        .catch(err => {
          // 单个编译不通过不阻碍下一个编译
          hasLog && console.log(chalk.red(err));
        });
    } catch (err) {
      reject(err);
    }
  });
};

const build = function(conf = {}) {
  const hasLog = !conf.noLog;
  hasLog && logInfo();

  return new Promise((resolve, reject) => {
    const List = getConf('target');

    let run = i => {
      if (i > List.length - 1) {
        return resolve();
      }
      buildOne(i, hasLog)
        .then(() => run(i + 1))
        .catch(reject);
    };
    run(0);
  });
};

module.exports = { build };
