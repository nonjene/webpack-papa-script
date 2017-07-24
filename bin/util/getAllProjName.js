/**
 * Created by Nonjene on 2017/2/10.
 */
const fs = require("fs");
const path = require("path");

const ExcludeDir = ['modules', 'static', 'm', 'pc'];

const DIR_SRC = path.resolve(__dirname, '../../src/');


let ls = function (baseDir = DIR_SRC) {
    let needGoDeep = [];
    let matchDirs = fs
        .readdirSync(baseDir)
        .filter(dir => {
            let fullPath = path.join(baseDir, dir);

            if (fs.statSync(fullPath).isDirectory() && ExcludeDir.every(exDir => exDir != dir)) {
                if (fs.readdirSync(fullPath).some(subDir => subDir == 'm' || subDir == 'pc')) {
                    return true;
                } else {
                    needGoDeep.push(fullPath);
                    return false;
                }
            } else {
                return false;
            }

        });


    return {
        matchDirs,
        needGoDeep
    }
};

let getAll = function (scope) {
    let list = [];

    function doit(dir) {

        let lsRes = ls(dir);

        list = [...list, ...lsRes.matchDirs.map(matchDir => path.join(dir, matchDir).replace(DIR_SRC + '/', ''))];

        if (lsRes.needGoDeep.length > 0) {
            lsRes.needGoDeep.map(dir => {
                return doit(dir)
            });
        }
    }

    if (Array.isArray(scope)) {
        scope = scope.map(_scope => path.join(DIR_SRC, _scope))
    }
    else if(typeof scope === 'string'){
        scope = [path.join(DIR_SRC, scope)]
    }
    else{
        scope = [DIR_SRC]
    }

    scope.forEach(_scope => doit(_scope));

    return list.join(',');
};

module.exports = getAll;