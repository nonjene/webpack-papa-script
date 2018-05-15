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

const OutputDir = ['dist/pre', 'dist/pro', 'build/activity'];

const doConcat = function() {
  return concatFile(
    config
      .getConf('staticFileConcatOrder')
      .map(fileName => path.join(process.cwd(), `resource/js/${fileName}`)),
    path.resolve(path.join(process.cwd(), 'resource/bundle/common.js'))
  );
};

const deployStaticAll = function(isUpload, isLog=true, done) {
  doConcat()
    .then(() => isLog && console.log(chalk.cyan('common.js 压缩成功。')))
    .catch(e => isLog && console.log(chalk.red(e)));

  asyncEach(
    OutputDir,
    (dir, next) => {
      copydir(
        path.resolve('resource/bundle'),
        path.resolve(path.join(dir, 'static')),
        err => {
          if (err) {
            throw new Error('复制static错误');
          } else {
            return next();
          }
        }
      );
    },
    () => {
      isLog && console.log(chalk.cyan('静态资源已复制'));
      isUpload && ftp.uploadStatic('static', { desc: '上传到测试服务器', isLog: false });
      done && done();
    }
  );
};

const deployStaticEnvTest = function() {
  copydir(
    path.resolve('resource/bundle'),
    path.resolve(path.join(OutputDir[2], 'static')),
    err => {
      if (err) {
        throw new Error('复制static错误');
      }
    }
  );
};

module.exports = {
  deployStaticAll,
  deployStaticEnvTest
};
