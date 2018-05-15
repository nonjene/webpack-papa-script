/**
 * Created by Nonjene on 2017/3/2.
 */
const path = require('path');
const fs = require('fs');

module.exports = function(target, DIR_SRC) {
    DIR_SRC = DIR_SRC || path.join(process.cwd(), '/src');

    const dir = DIR_SRC === 'abs' ? target : path.join(DIR_SRC, target);
    return (
        fs.existsSync(dir) &&
        fs.statSync(dir).isDirectory() &&
        fs.readdirSync(dir).some(subDir => subDir === 'm' || subDir === 'pc' || subDir === 'proj.json')
    );
};
