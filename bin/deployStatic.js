/**
 * Created by Nonjene on 2017/3/9.
 */
const chalk = require('chalk');

const path = require('path');
const copydir = require('copy-dir');
const config = require('./config');
const ftp = require('./ftp');
const { asyncEach } = require('./util/asyncEach');
const concatFile = require('./util/concatFile');

const OutputDir = ['dist/pre', 'dist/pro', 'build/activity'];

const doConcat = function() {
    return concatFile(
        [
            path.resolve('resource/js/reset.js'), // 各种全局的基础功能
            path.resolve('resource/js/responsive.js'), // 自适应
            path.resolve('resource/js/native.js'), //app交互
            //path.resolve('resource/js/config_v.js'), //config的config
            path.resolve('resource/js/config.js'), //api配置等
            path.resolve('resource/js/compat.js'), //处理兼容问题

            path.resolve('resource/js/jquery.slim.js'),
            path.resolve('resource/js/jquery.ua.js'),
            path.resolve('resource/js/loading.js'),
            path.resolve('resource/js/baidu_statistics.js')
        ],
        path.resolve('resource/bundle/common.js')
    );
};

const deployStaticAll = function() {
    doConcat();
    console.log(chalk.cyan('common.js 压缩成功。'));

    asyncEach(
        OutputDir,
        (dir, next) => {
            copydir(
                path.resolve('resource/bundle'),
                path.resolve(path.join(dir, 'static')),
                err => {
                    if (err) {
                        throw new Error('复制static错误');
                    } else {
                        return next();
                    }
                }
            );
        },
        () => {
            console.log(chalk.cyan('静态资源已复制'));
            ftp.uploadStatic('static', { desc: '上传到测试服务器', isLog: false });
        }
    );
};

const deployStaticEnvTest = function(){

    copydir(
        path.resolve('resource/bundle'),
        path.resolve(path.join(OutputDir[2], 'static')),
        err => {
            if (err) {
                throw new Error('复制static错误');
            }
        }
    );
};

module.exports = {
    deployStaticAll,
    deployStaticEnvTest
};
