/**
 * Created by Nonjene on 2017/3/1.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const T = require('./util/tpl');

const { asyncEach } = require('./util/asyncEach');
const { localAssetPath: localAssetPath_raw, remoteBasePath, remotePath, domainName } = require('./config');

const localAssetPath = path.join(process.cwd(), localAssetPath_raw);

module.exports = {
    getAssetsFiles(target, duans, callback) {
        let allFilesInfo = [];
        let localDir = T(localAssetPath, { target });
        let remoteDir = T(remotePath, { target });
        let subPaths = [
            'img',
            'vendors',
            ...duans
        ];
        let specFiles = [
            //'vendors.js'//不在这了
        ];
        //path.dirname(basePath) + '/vendors.js',

        asyncEach(subPaths,
            (subPath, next) => {
                let dir = path.join(localDir, subPath);
                if(!fs.existsSync(dir)){
                    return next();
                }
                fs.readdir(dir, (err, files) => {
                    if (err) throw err;

                    allFilesInfo = [...allFilesInfo, ...files.map(file => ({
                        fileName: file,
                        localFullPath: [localDir, subPath, file].join('/'),
                        remoteFullPath: [remoteDir, subPath, file].join('/'),

                    }))];

                    return next();
                });

            }, () => callback(
                [
                    ...allFilesInfo,
                    ...specFiles.map(file => ({
                        fileName: file,
                        localFullPath: [path.dirname(localDir), file].join('/'),
                        remoteFullPath: [path.dirname(remoteDir), file].join('/'),
                    }))
                ],
                // 把链接传出去
                domainName + remoteDir + '/' + duans[0]
            )
        );

    },
    getStaticFiles(target,callback){
        let allFilesInfo = [];
        let localDir = T(localAssetPath, { target });
        let remoteDir = T(remotePath, { target });

        fs.readdir(localDir, (err, files) => {
            if (err) throw err;

            allFilesInfo = [...allFilesInfo, ...files.map(file => ({
                fileName: file,
                localFullPath: [localDir, file].join('/'),
                remoteFullPath: [remoteDir, file].join('/'),

            }))];

            return callback(allFilesInfo, domainName + remoteDir);
        });

    },
    upLoadFiles({ desc, isLog }={ desc: '', isLog: true }, filesInfo, uploadFunc, done) {

        if (!filesInfo.length) {
            console.log('没有找到指定的文件，请确认活动文件夹名是否正确？如“report/2017_1，xunlei”');
            return done && done();
        }
        let log = [];
        asyncEach(filesInfo,
            function ({ fileName, localFullPath, remoteFullPath }, next) {
                const RealRemoteFullPath = remoteBasePath + remoteFullPath; //打个布丁

                return uploadFunc(RealRemoteFullPath, localFullPath, err => {
                    if (err) {
                        console.log('🙅 ' + chalk.yellow('上传失败：') + fileName);
                    } else {
                        console.log('💁 ' + chalk.green('上传成功：') + fileName);
                        isLog && log.push(domainName + remoteFullPath);
                    }
                    return next();
                })
            },
            function () {
                console.log('🍺 🍺 🍺 ' + desc + '上传完毕!' + (isLog ? ('成功上传以下文件：\n' + log.join('\n')) : '') + '\n');
                return done && done();
            }
        )
    }
};