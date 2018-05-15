/**
 * Created by Nonjene on 2017/2/13.
 */
const path = require('path');

const ftp = require('./ftp');
const fileManager = require('./file_manager');

const { getConf, ftp:FtpConf } = require('./config');

const { getAllProjName} = require('./util/getAllProjName');

const testPromise = function () {
    return new Promise((resolve,reject)=>{
        resolve();
        setTimeout(()=> reject(),1000);
    })
};
const hasDuan = require('./util/hasDuan');


const test = function () {
    testPromise().then(()=>console.log('done!')).catch(err=>console.log('fail!'))
};

module.exports = {
    test,
    upload(){
        ftp.signin(FtpConf)
            .then(() => new Promise(
                resolve => ftp.upload(undefined, [
                    {
                        fileName: 'vendors.js',
                        localFullPath: '/build/vendors.js',
                        remoteFullPath: '/test/vendors.js',
                    }
                ], () => resolve('ok!'))
                )
            )
            .then(() => ftp.end())
            .catch(e => console.error(e))
    },
    getUploadFiles(){
        fileManager.getAssetsFiles('huodong1', ['m'], allFilesInfo =>
            console.dir(allFilesInfo)
        )
    },
    getAllProjName(scope){
        console.dir(getAllProjName(scope));
    },
    path(){
        console.log(path.sep)
    },
    hasDuan(){
        console.log(hasDuan('xxxx'))
    }
};