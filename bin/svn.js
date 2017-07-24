/**
 * Created by Nonjene on 2017/3/15.
 */
const { exec }                  = require("child_process");
const { combineBuild, getConf } = require('./config');

const chalk = require('chalk');


const commit = (which)=>{
    return new Promise((resolve, reject) => {
        console.log(chalk.blue('上传svn：') + getConf('target')[which]);

        exec(combineBuild(which), function (err, stdout, stderr) {
            if (err) reject(err);

            console.log(stdout);
            resolve();
        });

    })


};


// 遍历dist活动每个文件，try add and commit