/**
 * Created by chenzhian on 8/1/2016.
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const func = module.exports = {
    init(saveAs, donecb){
        const output = fs.createWriteStream(saveAs);

        const archive = archiver('zip');

        output.on('close', function () {
            console.log('zip done!');
            return donecb && donecb();
        });

        archive.on('error', function (err) {
            throw err;
        });
        archive.pipe(output);
        return archive;
    },
    //6.3.0还不支持{aFiles, saveAs,...opt}解构
    files({aFiles, saveAs,prefix}, cb) {
        const archive = this.init(saveAs, cb);
        aFiles
            .reduce((archive, file)=> {
                if (!file) return archive;

                return archive.append(fs.createReadStream(file),{
                    name: path.basename(file),
                    prefix
                })
            }, archive)
            .finalize();

    },
    filesDuplex({aFilesInfo, saveAs}, cb) {
        const archive = this.init(saveAs, cb);
        aFilesInfo
            .reduce((archive, fileInfo)=> {
                if (!fileInfo) return archive;

                return archive.append(fs.createReadStream(fileInfo.localFullPath),{
                    name: path.basename(fileInfo.localFullPath),
                    prefix:fileInfo.prefix
                })
            }, archive)
            .finalize();

    },
    /**
     * directory没法重命名文件夹名
     * @param localDir
     * @param saveAs
     * @param cb
     */
    dir(localDir, saveAs, cb){

        this.init(saveAs, cb)
            .directory(localDir, {
                prefix:'lalal/'
            })
            .finalize();
    }
};
//func.files(['./tpl.js','./zip.js'],'./t.zip')
//func.dir('../util','./t.zip')