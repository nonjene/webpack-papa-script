const chalk = require('chalk');

const webpack = require('webpack');
const config = require('../webpack.config');

const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) {
    return console.log(chalk.red(err));
  }
  console.log(chalk.cyan('webpack:build'));
  console.log(
    stats.toString({
      chunks: false, // Makes the build much quieter
      colors: true
    })
  );
});
