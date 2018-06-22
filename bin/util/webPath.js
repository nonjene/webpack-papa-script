const path = require('path');
//const regSep = new RegExp("[\/|\\\\]",'g');
const winSep = /\\/g;
const webify = dir => dir.replace(winSep, '/');

module.exports = {
  join(...arg) {
    return webify(path.join.apply(path, arg));
  },
  webify,
};
