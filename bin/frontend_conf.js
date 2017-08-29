/**
 * Created by Nonjene on 2017/3/5.
 */

const TPL = (props = {}) => `try{
    window.publicConfig.mode = "${props.mode}";
    window.publicConfig.debug = ${props.debug};
    Object.freeze(window.publicConfig);
}catch(e){}`;


const fs = require("fs");
const path = require("path");
const { setConf } = require("./config");

const change = function(props, target) {
    return new Promise((resolve, reject) => {
        const dir = `${process.cwd()}/src/${target}`;
        if(!fs.existsSync(dir)) return reject(`指定的文件夹不存在：${target}`);

        fs.writeFile(path.join(dir, 'config_v.js'), TPL(props), err => {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = {
    promiseSetDone: {
        then(cb) {
            console.log("Haven't set frontend config, use last setting.");
            return cb && cb("nothing");
        }
    },
    setFrontEndConf(...arg) {
        let [mode = "produce", debug = true, target] = arg;
        if (arg.length === 2) {
            target = debug;
            debug = true;
        }
        if (arg.length === 1) {
            throw new Error("构建错误：设置setFrontEndConf没有接收到target，请联系负责人。");
        }

        if (mode === "produce") debug = false;
        this.promiseSetDone = change(
            {
                mode,
                debug
            },
            target
        );
        setConf("fronendEnv", mode);
        return this.promiseSetDone;
    }
};
