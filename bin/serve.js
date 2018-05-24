/**
 * Created by Nonjene on 2017/2/10.
 */


const { exec } = require("child_process");
const opn = require('opn');
const { getConf } = require('./config');
const path = require('path');
const logger = require('./util/logger');

let serve;

const serveOpen = function () {
    const DefProxyPort = getConf('proxyPort'),
          DefServePort = getConf('servePort');

    return new Promise((resovle, reject) => {
        if (serve) return reject('只能执行一次server start.');
        logger.log('serve:'+DefProxyPort);
        serve = exec(`node ${path.join(__dirname, '../server')} S ${DefServePort}  P ${DefProxyPort}`, function (err, stdout, stderr) {
            if (err) {
                reject(err);
            }
        });
        serve.stdout.on('data', (data) => {
          logger.log(`${data}`);
            if (data.indexOf('server started') > -1) {
                resovle();
            }
        });

        serve.on('exit', function (code) {
          logger.log('server stop, code ' + code);
        });
    })


};
const stop = function () {
    if (!serve) return;
    serve.kill();

    setTimeout(() => serve = null, 0);

};

const start = function ({isOpen=true}={}) {
    const DefServePort = getConf('servePort');
    return serveOpen()
        .then(() => {
            let addr = 'http://localhost:'+ DefServePort +'/activity/';
            addr += getConf('target')[0]+'/'+ getConf('duan')[0]+'/';

            isOpen && opn(addr, { wait: false });
        })
        .catch(err => console.error(err));
};

module.exports = {
    start,
    stop
};
