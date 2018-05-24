/**
 * Created by Nonjene on 2017/2/10.
 */

const path = require('path');
const fs = require('fs');
const projConfPath = `${process.cwd()}/okpapa.config.js`;
const projConf = (fs.existsSync(projConfPath) && require(projConfPath)) || {};

const StaticConfig = Object.assign(
  {
    ftp: {
      host: '192.168.1.1',
      port: '',
      user: 'user',
      password: 'ps'
    },
    remoteBasePath: '', //ftp的基目录，用于打印地址时方便排除。m.okpapa.com
    remotePath: '/activity/{$target}/',
    localAssetPath: 'build/activity',
    domainName: 'http://m.okpapa.com',
    cdnDomain: 'https://images.okpapa.com',
    //代理
    proxy:[
      {
        filterPathname: /^\/(?!activity\/)/,  // 代理pathname非以activity开头的所有请求
        target: 'http://localhost:80',
      },
    ],
    //开发环境端口
    servePort: 3005,
     //选定需要合并的非模块的文件，必须在 resource/js 里
    staticFileConcatOrder: [],
    staticFileSubPath:'static',
    staticFileName:'common.js',

    webpackConfig: {},

    // 编译一个单独的页面时，目录里面必须包含其中一个文件夹的定义
    commSingleProjSubPage:['m', 'pc'],
    // 获取所有项目时，排除以下这些文件夹里面的内容
    projRecongizeExclude:[ 'm', 'pc', 'modules', 'module', 'static','components', 'component'],
    //本地开发环境
    developEnvType: {
      deploy: 'test',
      fetch: 'test'
    },
    //正式上线的环境
    productEnvType: {
      deploy: 'pro',
      fetch: 'produce'
    },
    deployEnvType: {
      pre: 'dist/pre',
      pro: 'dist/pro',
      test: 'build/activity'
    },
    //默认的环境对应的接口模式
    deployEnvMapFetch: {
      pre: 'pre',
      pro: 'produce',
      test: 'test'
    },
    releaseEnvDesc: {
      pre: '预发环境😛',
      pro: '生产环境😝',
      test: '开发环境🤔'
    },
    fetchEnvDesc: {
      pre: '预发环境🥑',
      test: '测试环境🥝',
      produce: '生产环境🍓'
    },
    frontendConfCode:`try{
      Object.assign(window.publicConfig, {
        mode:"{$mode}",
        debug:{$debug}
      });
      Object.freeze(window.publicConfig);
    }catch(e){}`,
  },
  projConf
);

// 之前写的有些代码用了 getConf() 来获取 StaticConfig，所以要合并进来
const config = Object.assign(
  {
    target: ['target_not_setted'],
    env: 'production',
    fronendEnv: null,
    deployType: null,
    duan: StaticConfig.commSingleProjSubPage
  },
  StaticConfig
);

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
      if(typeof duan === 'string'){
        config.duan = duan.split(',');
      }else{
        config.duan = duan;
      }
      
    },
    getConf(prop) {
      return prop ? config[prop] : config;
    },
    setConf(prop, val) {
      config[prop] = val;
    },
    getEnvDesc() {
      return config.releaseEnvDesc[config.deployType || StaticConfig.developEnvType.deploy] || '黑洞👽';
    },
    getFrontendEnvDesc() {
      return config.fetchEnvDesc[config.fronendEnv] || '异次元空间🌚';
    },
    getOutputDir(type) {
      const outputDir = config.deployEnvType[type];

      /* istanbul ignore if */
      if (!outputDir) throw new Error(`没有在配置文件中找到对应的"${type}".`);
      return outputDir;
    },
    getProDeployName() {
      return StaticConfig.productEnvType.deploy;
    },
    getDevDeployName() {
      return StaticConfig.developEnvType.deploy;
    },
    getProFetchName() {
      return StaticConfig.productEnvType.fetch;
    },
    getDevFetchName() {
      return StaticConfig.developEnvType.fetch;
    },
    deployMapFetchName(deployName) {
      return StaticConfig.deployEnvMapFetch[deployName];
    },
    isMochaTest(){
      return !!process.env._mocha_test;
    }
  },
  StaticConfig
);
