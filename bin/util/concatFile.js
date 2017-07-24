/**
 * Created by Nonjene on 2017/7/12.
 */

const UglifyJS = require('uglify-js');
const fs = require('fs');
//const md5File = require('md5-file');

/*function concatCommon(aFileList, sTo) {
    return new Promise((resolve, reject) => {
        concat(aFileList, sTo, function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}*/

const reduceList = aFileList =>
    aFileList.reduce((host, item) => {
        host[item] = fs.readFileSync(item, 'utf8');
        return host;
    }, {});


function compress(aFileList, sTo) {
    const res = UglifyJS.minify(reduceList(aFileList), {
        ie8: true
    });

    if (res.error) return reject(res.error);

    fs.writeFileSync(sTo, res.code, 'utf8');
}

module.exports = function(aFileList, sTo) {
    //await concatCommon(aFileList, sTo);
    return compress(aFileList, sTo);
};
