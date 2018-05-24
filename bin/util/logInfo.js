/**
 * Created by Nonjene on 2017/3/8.
 */

const logger = require('./logger');

const chalk = require('chalk');
/* istanbul ignore next */
module.exports = ()=>{
  logger.log(chalk.cyan('发布到： ') + getEnvDesc());
  logger.log(chalk.cyan('api环境：') + getFrontendEnvDesc());
  logger.log(chalk.cyan('活动：   ') + getConf('target').join('、'));
  logger.log(chalk.cyan('页面：   ') + getConf('duan').join('、'));
};