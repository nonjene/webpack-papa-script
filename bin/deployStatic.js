/**
 * Created by Nonjene on 2017/3/9.
 */
const chalk = require('chalk');
const fs = require('fs');

const path = require('path');
const copydir = require('copy-dir');
const config = require('./config');
const ftp = require('./ftp');
const { asyncEach } = require('./util/asyncEach');
const concatFile = require('./util/concatFile');
const logger = require('./util/logger');

const OutputDir = Object.keys(config.deployEnvType).map(
  name => config.deployEnvType[name]
);
const commFileName = config.staticFileName; //'common.js'
const commFileSubPath = config.staticFileSubPath; //'static'

const getCommConcatFullPath = () =>
  path.resolve(path.join(process.cwd(), `resource/bundle/${commFileName}`));
const doConcat = function() {
  return concatFile(
    config
      .getConf('staticFileConcatOrder')
      .map(fileName => path.join(process.cwd(), `resource/js/${fileName}`)),
    getCommConcatFullPath()
  );
};

const deployStaticAll = function(isUpload, done, uploadDone) {
  const concatFileList = config.getConf('staticFileConcatOrder');
  if(!Array.isArray(concatFileList) || concatFileList.length===0){
    logger.log(chalk.yellow(`没有设置需要合并的文件。请将需要合并的文件名定义在 okpapa.config.js 的 staticFileConcatOrder。`));
  }else{
    doConcat()
    .then(() => logger.log(chalk.cyan(`${commFileName} 压缩成功。`)))
    .catch(e => {
      /* istanbul ignore next */
      logger.log(chalk.red(e));
    });
  }
  
  /* istanbul ignore if */
  if(!fs.existsSync(path.resolve('resource/bundle'))){
    return logger.log(chalk.yellow(`没有任何资源需要复制。(不存在 ${path.resolve('resource/bundle')}。)`));
  }
  asyncEach(
    OutputDir,
    (dir, next) => {
      copydir(
        path.resolve('resource/bundle'),
        path.resolve(path.join(dir, commFileSubPath)),
        err => {
          if (err) {
            /* istanbul ignore next */
            throw new Error(`复制${commFileSubPath}错误`);
          } else {
            return next();
          }
        }
      );
    },
    () => {
      logger.log(chalk.cyan('静态资源已复制'));
      isUpload &&
        ftp
          .uploadStatic(commFileSubPath, {
            desc: '上传到测试服务器',
            isLog: false
          })
          .then(uploadDone);
      done && done();
    }
  );
};

const deployStaticEnvTest = function(done) {
  /* istanbul ignore if */
  if(!fs.existsSync(path.resolve('resource/bundle'))) return;
  copydir(
    path.resolve('resource/bundle'),
    path.resolve(path.join(config.deployEnvType[config.developEnvType.deploy], commFileSubPath)),
    err => {
      /* istanbul ignore if */
      if (err) {
        throw new Error(`复制${commFileSubPath}错误`);
      }
      done && done();
    }
  );
};

module.exports = {
  deployStaticAll,
  deployStaticEnvTest,
  getCommConcatFullPath
};
