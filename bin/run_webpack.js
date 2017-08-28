const chalk = require("chalk");

const webpack = require("webpack");
const config = require("./webpack.config");

const compiler = webpack(config);

module.exports = {
    watch() {
        compiler.watch(
            {
                // watch options:
                aggregateTimeout: 200, // wait so long for more changes
                poll: true // use polling instead of native watchers
                // pass a number to set the polling interval
            },
            function(err, stats) {
                if (err) {
                    return console.log(chalk.red(err));
                }
            }
        );
    },
    build() {
        compiler.run(function(err, stats) {
            if (err) {
                return console.log(chalk.red(err));
            }
        });
    }
};
