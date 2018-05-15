/**
 * Created by Nonjene on 2017/2/10.
 */

const path = require('path');
const fs = require('fs');
const projConfPath = `${process.cwd()}/okpapa.config.js`;
const projConf =
  (fs.existsSync(projConfPath) && require(projConfPath)) ||
  {};

const StaticConfig = Object.assign(
  {
    ftp: {
      host: '192.168.1.1',
      port: '',
      user: 'user',
      password: 'ps'
    },
    remoteBasePath: '', //ftp的基目录，用于打印地址时方便排除。m.okpapa.com
    remotePath: '/activity/{$target}',
    localAssetPath: 'build/activity/{$target}',
    domainName: 'http://m.okpapa.com',
    cdnDomain: 'https://images.okpapa.com',
    proxyPort: 80,
    servePort: 3005,
    staticFileConcatOrder: [], //选定需要合并的文件，必须在 resource/js 里
    seedUrl:'https://github.com/nonjene/ok-papa-seed.git',
    webpackConfig:{},
    commonVersion:'',
    releaseEnvDesc:{
      pre:'预发环境😛',
      pro:'生产环境😝',
      test:'开发环境🤔',
    },
    requestEnvDesc:{
      pre:'预发环境🥑',
      test:'测试环境🥝',
      produce:'生产环境🍓',
    },
  },
  projConf
);

// 之前写的有些代码用了 getConf() 来获取 StaticConfig，所以要合并进来
let config = Object.assign(
  {
    target: ['target_not_setted'],
    env: 'production',
    fronendEnv: null,
    proSpecific: null,
    duan: ['pc', 'm']
  },
  StaticConfig
);

let EXPORT = 'export';
if (path.sep.indexOf('\\') > -1) {
  EXPORT = 'SET'; //windows
}

const getTargetCommander = (which = 0) => {
  return `${EXPORT} BUILD_TARGET=` + config.target[which];
};
const getEnvCommander = () => {
  let com = `${EXPORT} NODE_ENV=` + config.env;
  //指定预发还是生产
  if (config.proSpecific) {
    com += `&&${EXPORT} PRO_SPECIFIC=${config.proSpecific}`;
  }
  return com;
};
const getDuanCommander = () => {
  return config.duan ? `${EXPORT} DUAN=` + config.duan.join(',') : '';
};

module.exports = Object.assign(
  {
    setTarget(name = '') {
      //console.log(name)
      config.target = name.split(',');
    },
    getTarget() {
      return config.target;
    },
    setBuildAllScope(name = '') {
      config.buildAllScope = name.split(',');
    },
    setEnv(env) {
      config.env = env;
    },
    setDuan(duan) {
      config.duan = duan.split(',');
    },
    getConf(prop) {
      return prop ? config[prop] : config;
    },
    setConf(prop, val) {
      config[prop] = val;
    },
    getEnvDesc() {
      if (config.proSpecific) {
        return config.releaseEnvDesc[config.proSpecific] || '黑洞';
      } else {
        return config.releaseEnvDesc.test || '开发环境🤔';
      }
    },
    getFrontendEnvDesc() {
      return config.requestEnvDesc[config.fronendEnv] || '异次元空间🌚';
    },
    getTargetCommander,
    getEnvCommander,
    getDuanCommander
  },
  StaticConfig
);
