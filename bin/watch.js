/**
 * Created by Nonjene on 2017/2/10.
 */

const { exec } = require("child_process");
const { combineWatch, getConf } = require('./config');
const serve = require('./serve');

const chalk = require('chalk');

const logInfo = require('./util/logInfo');
const hasDuan = require('./util/hasDuan');

const watchOne = function (which = 0) {

    return new Promise((resolve, reject) => {
        const Tar = getConf('target')[which];
        console.log(`${chalk.blue('监听代码修改：')}${Tar} 的 ${getConf('duan').join(',')} 端...`);

        if (hasDuan(Tar).length < 1) {
            return reject(chalk.red(`没有找到：${Tar}，或里面没有m或pc文件夹，已略过，请检查拼写`) + '🤦')
        }

        const watch = exec(combineWatch(), (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
        });


        watch.stdout.on('data', data => {
            console.log(`${data}`);

            //build成功后有time的打印。resolve只会触发一次
            if(data.indexOf('Time:')>-1){
                resolve();
            }
        });

        watch.on( 'exit', code =>
            console.log('child process exited with code ' + code)
        );
    })

};


const watch = function () {
    logInfo();

    return new Promise((resolve, reject) => {
        if(getConf('target').length>1){
            console.log(chalk.red('只能监听你输入的第一个活动'));
        }
        // watch 只能watch一个活动
        watchOne(0)
            .then(() => {
                serve.start();
            })
            .catch(err=>{
                serve.stop();
                reject(err);
            });
    })
};


module.exports = { watch };