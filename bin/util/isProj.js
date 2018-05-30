/**
 * Created by Nonjene on 2017/3/2.
 */
const path = require('path');
const fs = require('fs');

const { projContainsOneOf: aRefer } = require('../config');

/**
 * 辨别一个文件夹是否为一个项目根目录。
 * @param {string} target  a folder or subpath
 * @param {string} DIR_SRC base path.  value: undefined: auto use cwd+./src; "abs": ignore this param; 
 */
module.exports = function(target, DIR_SRC) {
  if (!aRefer || !aRefer.length) throw new Error('isProj() needs aRefer!');
  DIR_SRC = DIR_SRC || path.join(process.cwd(), '/src');

  const dir = DIR_SRC === 'abs' ? target : path.join(DIR_SRC, target);
  return (
    fs.existsSync(dir) &&
    fs.statSync(dir).isDirectory() &&
    fs.readdirSync(dir).some(subDir => !!~aRefer.indexOf(subDir))
  );
};
