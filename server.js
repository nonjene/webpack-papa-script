/**
 * Created by Nonjene on 2017/3/6.
 */

const serve = require('koa-static');
const Koa = require('koa');
const server = new Koa();
const conditional = require('koa-conditional-get');

const proxy = require('koa-proxy');


const program = require("commander");

let proxyPort = '80',
    servePort  = '3005';

program
    .option('S, --serve-port <port>', '端口', port => servePort = port)
    .option('P, --proxy-port <port>', '端口', port => proxyPort = port)
    .parse(process.argv);


server.use(proxy({
    host: 'http://localhost:' + proxyPort,      //代理地址
    match: /^\/(?!activity\/)/       // 非活动页面
}));
server.use(conditional());
server.use(serve(__dirname + '/build/', {
    maxage: 31536000000
}));


server.listen(servePort);

console.log('server started.');