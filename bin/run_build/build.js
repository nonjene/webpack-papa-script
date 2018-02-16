const chalk = require('chalk');

const webpack = require('webpack');

module.exports = function() {
  const config = require('../webpack.config');

  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      resolve(
        stats.toString({
          chunks: false, // Makes the build much quieter
          colors: true
        })
      );
    });
  });
};
