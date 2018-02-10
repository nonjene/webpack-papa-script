/**
 * Created by Nonjene on 2017/3/6.
 */

const getAllProjName = require("./util/getAllProjName");

const copydir = require("copy-dir");

const path = require("path");
const fs = require("fs");

const chalk = require("chalk");

const copy = function(name, templateName = "def", resolve, reject) {
    const tplPath = path.resolve(`${process.cwd()}/src/_template_${templateName}`);

    if (!fs.existsSync(tplPath)) return reject(`模版: "${templateName}"不存在，请检查。`);

    copydir(tplPath, path.resolve(`${process.cwd()}/src/${name}`), err => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
};

const create = function(name, templateName) {
    return new Promise((resolve, reject) => {
        let allExist = getAllProjName().split(",");

        if (allExist.some(proj => name === proj)) {
            return reject(name + "活动已存在，请检查。");
        }

        copy(name, templateName, resolve, reject);
    });
};

module.exports = { create };
