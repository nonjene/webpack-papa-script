/**
 * Created by Nonjene on 16/9/15.
 */

const chalk = require('chalk');

// 哪个活动文件夹,只能指定单个
const { NODE_ENV, deployType, BUILD_TARGET } = process.env;
const deployConfig = require('./config');
const compatV1 = require('./util/compat_v1');
const {getAllProjName,getAllSubPageName} = require('./util/getAllProjName');

const IsPro = deployType === deployConfig.getProDeployName();

if (!BUILD_TARGET) throw new Error('没有找到活动名。请联系工具维护人员');

// 编译pc端还是移动端还是两端都编译
const DUAN = process.env.DUAN ? process.env.DUAN.split(',') : ['pc', 'm'];

const fs = require('fs');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const DIR_SRC = path.resolve(`${process.cwd()}/src/`) + '/';



let aDirName = [];
let entry = {};
let htmlDeclare = [];

let Folder = DIR_SRC + BUILD_TARGET + '/';

// watch的情况，没有deployType
let outputDir = deployConfig.getOutputDir(deployType || deployConfig.getDevDeployName());

const hasDuan = require('./util/hasDuan');

const getHtml = function (Path) {
  return fs.readFileSync(Path, 'utf8');
};

const getTargetConf = function (dir = Folder) {
  const defConf = {
    htmlFile: 'index.html',
    title: '标题'
  };
  const file = path.join(dir, 'config.json');

  if (!fs.existsSync(file)) {
    chalk.yellow(`${BUILD_TARGET}的config.json不存在, 将作为旧版形式编译。`);
    return {};
    // 假如没有config, 视为解决旧的方案
  }

  return Object.assign(defConf, JSON.parse(fs.readFileSync(file, 'utf8')));
};

const setEntry = function (subpath, duan) {
  const dir = path.join(subpath, duan);
  const Path = path.join(Folder, dir);

  if (hasDuan(BUILD_TARGET, dir).length < 1) {
    return !process.env._mocha_test && console.log(chalk.yellow(`${BUILD_TARGET}的${dir}端不存在, 已略过`) + '🌚');
  }

  aDirName.push(Path);
  entry[dir] = Path + '/index.js';

  // 设置html文件
  //console.log(Path);
  let targetConf = getTargetConf(path.join(Folder, subpath));// conf在m或pc的上层
  const { htmlFile } = targetConf;
  delete targetConf.htmlFile;

  const cdnPrefix = IsPro ? deployConfig.cdnDomain : '';
  const comFilePath = '/activity/static/common.js';
  const linkParam = `?v=${deployConfig.commonVersion}`;
  // 这个别改，改了你就要重写compat_v1.js的匹配规则，否则会重复添加。
  const commonFileInject = `<script type="text/javascript" src="${cdnPrefix}${comFilePath}${linkParam}"></script>`;

  //兼容旧版
  if (!Object.keys(targetConf).length) {
    //插入script common.js去html
    if (deployConfig.staticFileConcatOrder.length > 0) {
      compatV1.injectCommon(
        Path + '/index.html',
        commonFileInject,
        comFilePath
      );
    }

    htmlDeclare.push(
      new HtmlWebpackPlugin({
        filename: dir + '/index.html',
        template: Path + '/index.html',
        chunks: [dir, 'vendors'],
        inject: 'body'
      })
    );
  } else {
    let opt = {
      filename: dir + '/index.html',
      // 优先选取config.json的templateName_m/pc，没有则用默认的
      template: path.resolve(
        process.cwd(),
        `resource/html/${targetConf[`templateName_${duan}`] || `index_${duan}.handlebars`}`
      ),
      chunks: [dir, 'vendors'],
      inject: 'body',
      tpl: Object.assign(
        {
          // 在模版插入common.js
          moreScript:
            deployConfig.staticFileConcatOrder.length > 0
              ? commonFileInject
              : ''
        },
        targetConf
      ),
      cache: false //强制提取html编译，因为模版永远不变，tpl.main动态

      //hash: true
    };
    // 活动的业务内容的html
    Object.defineProperty(opt.tpl, 'main', {
      get: function () {
        return getHtml(path.join(Path, htmlFile));
      },
      set: function () { }
    });

    htmlDeclare.push(new HtmlWebpackPlugin(opt));
  }
};
//path.resolve(__dirname, '../resource/bundle/common.js')

if (fs.statSync(Folder).isDirectory()) {
  if (fs.readdirSync(Folder).some(subDir => subDir === 'proj.json')) {
    // 一个项目包含多个页面
    getAllSubPageName(BUILD_TARGET, DUAN).forEach(({subpath, duan}) => setEntry(subpath, duan));



  } else {
    // 一个页面作为一个项目
    DUAN.forEach(duan => setEntry('', duan));

  }


  /**
   * @自定义公共模块抽到这里
   * 把config_v.js陪到vendors
   */
  entry.vendors = [`${Folder}/config_v.js`];
} else {
  throw new Error(Folder + '文件夹不存在');
}

module.exports = {
  module: BUILD_TARGET,
  entry,
  htmlDeclare,
  outputDir,
  deployType,
  BUILD_TARGET,
  DUAN,
  helperDirs: [Folder+"hbHelper"]
};
