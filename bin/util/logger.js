
const { isMochaTest } = require('../config');
const chalk = require('chalk');
/* istanbul ignore next */
module.exports = {
  log(){
    if(isMochaTest()) return;
    
    console.log.apply(console, arguments);
  },
  cyan(t){
    this.log(chalk.cyan(t));
  },
  red(t){
    this.log(chalk.red(t));
  }
};