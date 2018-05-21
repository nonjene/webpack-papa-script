/**
 * Created by Nonjene on 2017/3/9.
 */
const chalk = require('chalk');

const path = require('path');
const copydir = require('copy-dir');
const config = require('./config');
const ftp = require('./ftp');
const { asyncEach } = require('./util/asyncEach');
const concatFile = require('./util/concatFile');

const OutputDir = Object.keys(config.deployEnvType).map(name=>config.deployEnvType[name]);
const commFileName = config.staticFileName; //'common.js'
const commFileSubPath = config.staticFileSubPath;//'static'

const getCommConcatFullPath = ()=> path.resolve(path.join(process.cwd(), `resource/bundle/${commFileName}`));
const doConcat = function() {
  return concatFile(
    config
      .getConf('staticFileConcatOrder')
      .map(fileName => path.join(process.cwd(), `resource/js/${fileName}`)),
      getCommConcatFullPath()
  );
};

const deployStaticAll = function(isUpload, isLog=true, done) {
  doConcat()
    .then(() => isLog && console.log(chalk.cyan(`${commFileName} 压缩成功。`)))
    .catch(e => isLog && console.log(chalk.red(e)));

  asyncEach(
    OutputDir,
    (dir, next) => {
      copydir(
        path.resolve('resource/bundle'),
        path.resolve(path.join(dir, commFileSubPath)),
        err => {
          if (err) {
            throw new Error(`复制${commFileSubPath}错误`);
          } else {
            return next();
          }
        }
      );
    },
    () => {
      isLog && console.log(chalk.cyan('静态资源已复制'));
      isUpload && ftp.uploadStatic(commFileSubPath, { desc: '上传到测试服务器', isLog: false });
      done && done();
    }
  );
};

const deployStaticEnvTest = function(done) {
  copydir(
    path.resolve('resource/bundle'),
    path.resolve(path.join(OutputDir[2], commFileSubPath)),
    err => {
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
  getCommConcatFullPath,
};
