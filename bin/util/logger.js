
const { isMochaTest } = require('../config');
const chalk = require('chalk');
module.exports = {
  log(){
    if(isMochaTest()) return;
    /* istanbul ignore next */
    console.log.apply(console, arguments);
  },
  /* istanbul ignore next */
  cyan(t){
    this.log(chalk.cyan(t));
  },
  /* istanbul ignore next */
  red(t){
    this.log(chalk.red(t));
  }
};