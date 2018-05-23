const chalk = require('chalk');

const webpack = require('webpack');

module.exports = function() {
  //note: 这里在测试跑很慢，但实际使用不会
  const config = require('../webpack.config');

  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      resolve(
        stats.toString({
          // Add children information
          children: false,
          /* // Add chunk information (setting this to `false` allows for a less verbose output)
          chunks: false,

          // Add built modules information to chunk information
          chunkModules: false,

          // Add the origins of chunks and chunk merging info
          chunkOrigins: false, */

          // Sort the chunks by a field
          // You can reverse the sort with `!field`. Default is `id`.
          chunksSort: 'field',

          // `webpack --colors` equivalent
          colors: true
        })
      );
    });
  });
};
