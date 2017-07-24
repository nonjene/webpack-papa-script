/**
 * Created by chenzhian on 8/4/2016.
 */
const fs = require('fs');
const path = require('path');

const mkdir = function (dirpath, callback) {
    fs.exists(dirpath, exists => {
        if (exists) {
            callback && callback(dirpath);
        } else {
            mkdir(path.dirname(dirpath), function () {
                fs.mkdir(dirpath, callback);
            });
        }
    });
};

module.exports = function(dirpath){
    return new Promise(resolve=> mkdir(dirpath,resolve));
};