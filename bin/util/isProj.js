/**
 * Created by Nonjene on 2017/3/2.
 */
const path = require('path');
const fs = require('fs');

const { projContainsOneOf: aRefer } = require('../config');
module.exports = function(target, DIR_SRC) {
  if (!aRefer || !aRefer.lenth) throw new Error('isProj() needs aRefer!');
  DIR_SRC = DIR_SRC || path.join(process.cwd(), '/src');

  const dir = DIR_SRC === 'abs' ? target : path.join(DIR_SRC, target);
  return (
    fs.existsSync(dir) &&
    fs.statSync(dir).isDirectory() &&
    fs.readdirSync(dir).some(subDir => !!~aRefer.indexOf(subDir))
  );
};
