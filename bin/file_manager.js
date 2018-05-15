/**
 * Created by Nonjene on 2017/3/1.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const T = require('./util/tpl');

const { asyncEach } = require('./util/asyncEach');
const { getAllSubPageName } = require('./util/getAllProjName');

const { localAssetPath, remoteBasePath, remotePath, domainName } = require('./config');

module.exports = {
  getAssetsFiles(target, duans, callback) {
    let allFilesInfo = [];
    let localDir = path.join(localAssetPath, target.toString());
    let remoteDir = T(remotePath, { target });
    let subPaths = ['img', 'files', 'font', 'vendors', ...duans];
    let specFiles = [
      //'vendors.js'//不在这了
    ];
    //path.dirname(basePath) + '/vendors.js',
    subPaths = subPaths.concat(getAllSubPageName(target, duans, localAssetPath).map(({ subpath, duan }) => path.join(subpath, duan)));

    asyncEach(
      subPaths,
      (subPath, next) => {
        let dir = path.join(localDir, subPath);
        if (!fs.existsSync(dir)) {
          return next();
        }
        fs.readdir(dir, (err, files) => {
          if (err) throw err;

          allFilesInfo = [
            ...allFilesInfo,
            ...files.map(file => ({
              fileName: file,
              localFullPath: [localDir, subPath, file].join('/'),
              remoteFullPath: [remoteDir, subPath, file].join('/')
            }))
          ];

          return next();
        });
      },
      () =>
        callback(
          [
            ...allFilesInfo,
            ...specFiles.map(file => ({
              fileName: file,
              localFullPath: [path.dirname(localDir), file].join('/'),
              remoteFullPath: [path.dirname(remoteDir), file].join('/')
            }))
          ],
          // 把链接传出去
          domainName + remoteDir + '/' + duans[0]
        )
    );
  },
  getStaticFiles(target, callback) {
    let allFilesInfo = [];
    let oriLocalDir = path.join(localAssetPath, target);
    let oriRemoteDir = T(remotePath, { target });

    const read = (localDir, remoteDir) => {
      const files = fs.readdirSync(localDir);

      files.reduce((collection, file) => {
        if (fs.statSync(path.join(localDir, file)).isDirectory()) {
          read(path.join(localDir, file), path.join(remoteDir, file));
        } else {
          collection.push({
            fileName: file,
            localFullPath: path.join(localDir, file),
            remoteFullPath: path.join(remoteDir, file)
          });
        }
        return collection;
      }, allFilesInfo);
    };

    read(oriLocalDir, oriRemoteDir);
    callback(allFilesInfo, domainName + oriRemoteDir);
  },
  upLoadFiles(
    { desc = "", isLog = true, isResLog = true } = {},
    filesInfo,
    uploadFunc,
    done
  ) {
    if (!filesInfo.length) {
      console.log(
        "没有找到指定的文件，请确认活动文件夹名是否正确？如“report/2017_1，xunlei”"
      );
      return done && done();
    }
    let log = [];
    asyncEach(
      filesInfo,
      function ({ fileName, localFullPath, remoteFullPath }, next) {
        const RealRemoteFullPath = remoteBasePath + remoteFullPath; //打个布丁

        return uploadFunc(RealRemoteFullPath, localFullPath, err => {
          if (err) {
            isResLog && console.log("🙅 " + chalk.yellow("上传失败：") + fileName);
          } else {
            isResLog && console.log("💁 " + chalk.green("上传成功：") + fileName);
            isLog && log.push(domainName + remoteFullPath);
          }
          return next();
        });
      },
      function () {
        isResLog && console.log(
          "🍺 🍺 🍺 " +
          desc +
          "上传完毕!" +
          (isLog ? "成功上传以下文件：\n" + log.join("\n") : "") +
          "\n"
        );
        return done && done();
      }
    );
  }
};
