const chalk = require('chalk');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

module.exports = function() {
  const config = require('../webpack.config');

  const devServerOptions = Object.assign({}, config.devServer, {
    stats: { colors: true, children: false }
  });

  return new Promise((resolve, reject) => {
    WebpackDevServer.addDevServerEntrypoints(config, devServerOptions);
    const compiler = webpack(config);
    const server = new WebpackDevServer(compiler, devServerOptions);

    server.listen(devServerOptions.port, 'localhost', err => {
      if (err) {
        return reject(err);
      }

      resolve({
        msg: 'Starting server on http://localhost:' + devServerOptions.port,
        watching: server
      });
    });

    //server.close()


    /* compiler.watch(
      {
        // watch options:
        aggregateTimeout: 300, // wait so long for more changes
        poll: true // use polling instead of native watchers
        // pass a number to set the polling interval
      },
      function(err, stats) {
        if (err) {
          return reject(err);
        }
        resolve({
          msg: stats.toString({
            children: false,
            colors: true
          }),
          watching: this
        });
      }
    ); */
  });
};
