/**
 * Created by Nonjene on 2017/3/2.
 */
const config = require("../config");
const path = require("path");
const fs = require("fs");

module.exports = function(target, duans = config.commSingleProjSubPage) {
    const DIR_SRC = path.resolve(`${process.cwd()}/src/`);
    if (!Array.isArray(duans)) {
        duans = [duans.toString()];
    }

    return duans.filter(duan => {
        let dir = path.join(DIR_SRC, target, duan);
        return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    });
};
