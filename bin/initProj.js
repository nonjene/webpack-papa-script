const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = function(name, source) {
  const gitName = path.parse(source).name;

  return new Promise((resolve, reject) =>
    exec(`git clone ${source}`, err => {
      if (err) return reject(err);
      fs.rename(
        `${process.cwd()}/${gitName}`,
        `${process.cwd()}/${name}`,
        err => {
          if (err) return reject(`${name}已存在。请重新命名。`);
          resolve();
        }
      );
    })
  );
};
