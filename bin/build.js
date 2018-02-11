/**
 * Created by chenzhian on 2016/7/21.
 */
const { exec } = require("child_process");
const { combineBuild, getConf } = require('./config');

const chalk = require('chalk');

const logInfo = require('./util/logInfo');
const hasDuan = require('./util/hasDuan');

const buildOne = function (which = 0, isNoLog = false) {
    //export NODE_ENV=production
    //export NODE_ENV=development

    // && export BUILD_TARGET=huodong1
    return new Promise((resolve, reject) => {
        const Tar = getConf('target')[which];
        !isNoLog && console.log(`${chalk.blue('正在编译活动：')}${Tar} 的 ${getConf('duan').join(',')} 端...`);

        if(hasDuan(Tar).length<1){
            return reject(chalk.red(`没有找到：${Tar}，或里面没有m或pc文件夹，已略过，请检查拼写`) + '🤦')
        }
        exec(combineBuild(which), function (err, stdout, stderr) {
            if (err) reject(err);

            !isNoLog && console.log(stdout);
            resolve();
        });

    })

};

const build = function ({isNoLog}) {
    !isNoLog && logInfo();

    return new Promise((resolve, reject) => {
        const List = getConf('target');

        let run = i => {
            if (i > List.length - 1) {
                return resolve();
            }
            buildOne(i, isNoLog)
                .then(() => run(i + 1))
                .catch(reject);

        };
        run(0)
    })
};


module.exports = { build };