/**
 * Created by Nonjene on 2017/3/1.
 */

const path = require('path');
const chalk = require('chalk');

const { getConf, ftp: FtpConf } = require('./config');
const fileManager = require('./file_manager');

const Client = require('ftp');
const c = new Client();

module.exports = {
  uploadToServer(opt) {
    let target = getConf('target'),
      duan = getConf('duan');
    if (!target || !duan) throw new Error('没有配置活动');

    let promiseUpload = this.signin(FtpConf).then(
      () =>
        new Promise(resolve =>
          fileManager.getAssetsFiles(target, duan, (allFilesInfo, remoteLink) =>
            this.upload(opt, allFilesInfo, () => resolve(remoteLink))
          )
        )
    );

    promiseUpload.then(() => this.end()).catch(e => console.error(e));

    return promiseUpload;
  },
  uploadStatic(target, opt) {
    let promiseUpload = this.signin(FtpConf).then(
      () =>
        new Promise(resolve =>
          fileManager.getStaticFiles(target, (allFilesInfo, remoteLink) =>
            this.upload(opt, allFilesInfo, () => resolve(remoteLink))
          )
        )
    );

    promiseUpload.then(() => this.end()).catch(e => console.error(e));

    return promiseUpload;
  },
  upload(opt, filesInfo, resolve) {
    fileManager.upLoadFiles(
      opt,
      filesInfo,
      (remoteFullPath, localFullPath, next) => {
        const remoteDir = path.dirname(remoteFullPath);
        this.mkdir(remoteDir)
          .then(() => this.putFile(remoteFullPath, localFullPath))
          .then(() => next())
          .catch(e => {
            console.log(chalk.yellow(e));
            return next(e);
          });
      },
      resolve
    );
  },
  //注意坑 一次运行只能登入一个
  signin(Ftp_config) {
    if (this.promiseSignin) return this.promiseSignin;

    this.promiseSignin = new Promise((resolve, reject) => {
      c.on('ready', resolve);
      c.on('error', reject);
      c.connect(Ftp_config);
    });
    return this.promiseSignin;
  },
  mkdir(ftpDir) {
    return new Promise((resolve, reject) => {
      c.mkdir(ftpDir, true, function(err) {
        /* istanbul ignore if  */
        if (err) return reject('创建目录失败：' + ftpDir);

        resolve();
      });
    });
  },
  //note：api没批量功能
  putFile(remoteFullPath, localFullPath) {
    return new Promise((resolve, reject) => {
      c.put(localFullPath, remoteFullPath, function(err) {
        if (err)
          return reject('上传错误：\n' + localFullPath + ' 无法上传到 ' + remoteFullPath);
        resolve();
      });
    });
  },
  ls() {
    c.list(function(err, list) {
      if (err) throw err;
      console.dir(list);
      c.end();
    });
  },
  end() {
    c.end();
  }
};
