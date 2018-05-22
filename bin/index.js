#!/usr/bin/env node
const program = require("commander");
const fs = require("fs");

const { build, watch } = require('./build');
const { create } = require('./create');
//const initProj = require('./initProj');
const ftp = require('./ftp');
const test = require('./test');
const serve = require('./serve');
const { getAllProjName } = require('./util/getAllProjName');

const chalk = require('chalk');
const opn = require('opn');


const config = require('./config');
const frontendConf = require('./frontend_conf');
const { deployStaticAll, deployStaticEnvTest } = require('./deployStatic');


program
  .option('s, --serve', '开启服务')

  .option('w, --watch <活动名>', '开发一个活动，监听代码实时刷新，并开启服务', name => config.setTarget(name))
  .option('r, --release <活动名>', '发布某个活动的代码。默认生产环境', name => config.setTarget(name))
  .option('pre, --pre', '代码发布到预发环境(只配合r命令)', () => config.setEnv('production'))
  .option('test, --test', '代码发布到测试环境(只配合r命令)', () => config.setEnv('production'))

  .option('duan <pc或m>', 'pc端or移动端，或者commSingleProjSubPage配置的文件夹名。', name => config.setDuan(name))

  .option('ra, --release-all', '发布所有活动。')

  .option('u, --upload [活动名]', '上传测试服务器', name => config.setTarget(name))
  .option('open', '打开测试服务器链接')
  .option('scope, --scope <文件夹范围>', '发布所有活动的文件夹范围', name => config.setBuildAllScope(name))

  .option('p, --production', '设置为：非开发模式。默认release自带此属性', () => config.setEnv('production'))
  .option('d, --development', '设置为：不压缩且包含inline-source-map。默认watch自带此属性', () => config.setEnv('development'))


  .option('mode <环境>', '设置前端API接口的环境, 只有在测试环境时生效，预发和生产环境无效。', mode => fFrontEndConf(mode))
  .option('M, hard-mode <环境>', '强制更改前端API接口', mode => fFrontEndConf(mode, 'hard'))

  .option('c, --create <活动名>', '新建一个活动', name => setTimeout(() => createAHuodong(name), 0))
  .option('t --template <模版名>', '新建一个活动时，选一个模版', (name, meno) => meno = name)

  .option('P, --proxy-port <端口>', '定义本地测试的平台页面服务端口，默认80', name => config.setConf('proxyPort', name))
  .option('deploy-static', '把/resource/static的文件复制到3个环境')
  
  .parse(process.argv);

// 配置写入process.env的形式

//console.log(chalk.yellow('提示: 假如遇到不清楚的代码报错, 请联系构建工具维护者') );
let _tmp = {};

if (program.serve) {
  serve.start();
}
if (program.release) {
  // release模式自动切换到生产环境
  setReleaseConfig();

  frontendConf.promiseSetDone
    .then(() => build())
    .then(() => program.upload && upload())
    .catch(e => console.log(chalk.red(e)));
}

if (program.releaseAll) {
  config.setTarget(getAllProjName(config.getConf('buildAllScope')));
  setReleaseConfig();

  frontendConf.promiseSetDone
    .then(() => build())
    .then(() => program.upload && upload())
    .catch(e => console.log(chalk.red(e)));
}

// 没有查能不能知道只有一个upload参数，先这么写了。
if (
  !program.release &&
  !program.releaseAll &&
  !program.deployStatic &&
  program.upload
) {
  upload();
}

if (program.watch) {
  //预设api接口为测试环境
  if (!program.mode) {
    frontendConf.setFrontEndConf(config.getDevFetchName(), config.getTarget());
  }
  !program.production && config.setEnv('development');
  frontendConf.promiseSetDone
    .then(() => watch())
    .catch(e => console.log(chalk.red(e)));

  // 复制common.js 到build/
  deployStaticEnvTest();
}


// 生成common.js
if (program.deployStatic) {
  deployStaticAll(!!program.upload)
}


function upload() {
  ftp
    .uploadToServer({ desc: '活动：' + config.getTarget(), isLog: false })
    .then(remoteLink => {
      if (program.open) opn(remoteLink, { wait: false });
    })
    .catch(e => console.error(e));
}

function fFrontEndConf(mode, isHard) {
  //不让在非测试环境改
  if (program.release && !program[config.getDevDeployName()] && !isHard) {
    return console.log(chalk.red('不允许在非测试环境改 ( ._.)'));
    /*if (!isHard) {

        }*/
  }

  return frontendConf.setFrontEndConf(mode, config.getTarget());
}

function createAHuodong(name) {
  create(name, program.template)
    .then(() => console.log(chalk.cyan("活动" + name + "添加成功")))
    .catch(err => console.error(chalk.red(err)));
}

function setReleaseConfig() {
  const target = config.getTarget();

  const developEnvType = config.getDevDeployName();
        productEnvType = config.getProDeployName();

  // 匹配配置文件的环境定义deployEnvType，假如没有匹配到的定义，则使用线上环境
  const envType = Object.keys(config.getConf('deployEnvType'))
                        .filter(name => program.hasOwnProperty(name))
                        [0] || productEnvType;

  
  //指定是发布到哪个环境
  config.setConf('deployType', envType);

  //前端接口请求环境定义, hardMode只能在非线上环境修改。
  if(!program.hardMode || envType === productEnvType){
    frontendConf.setFrontEndConf(config.deployMapFetchName(envType), target);
  }
  
  //非开发环境
  if (envType !== developEnvType) { 
    config.setDuan(config.commSingleProjSubPage);
  }
}