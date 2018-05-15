const chalk = require('chalk');

const webpack = require('webpack');

module.exports = function () {
  const config = require('../webpack.config');

  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.watch(
      {
        // watch options:
        aggregateTimeout: 300, // wait so long for more changes
        poll: true // use polling instead of native watchers
        // pass a number to set the polling interval
      },
      (err, stats) => {
        if (err) {
          return reject(err);
        }
        resolve(
          stats.toString({
            chunks: false, // Makes the build much quieter
            colors: true
          })
        );
      }
    );
  })

}