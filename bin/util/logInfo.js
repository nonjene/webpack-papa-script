/**
 * Created by Nonjene on 2017/3/8.
 */

const {  getConf, getEnvDesc, getFrontendEnvDesc } = require('../config');

const chalk = require('chalk');

module.exports = ()=>{
    console.log(chalk.cyan('发布到： ') + getEnvDesc());
    console.log(chalk.cyan('api环境：') + getFrontendEnvDesc());
    console.log(chalk.cyan('活动：   ') + getConf('target').join('、'));
    console.log(chalk.cyan('页面：   ') + getConf('duan').join('、'));
};