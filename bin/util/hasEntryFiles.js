/**
 * Created by Nonjene on 2017/3/2.
 */
const config = require("../config");
const path = require("path");
const fs = require("fs");

/**
 * 验证该target/subPages. opt:选项
 * @param {string} target 
 * @param {string} subPages 
 * @param {string} opt 
 */
module.exports = function(target, subPages = config.commSingleProjSubPage, opt='') {
    const type = (v) => !!~opt.indexOf(v);

    const DIR_SRC = type('abs') ? '' : path.resolve(`${process.cwd()}/src/`);

    if (!Array.isArray(subPages)) {
      subPages = [subPages.toString()];
    }

    return subPages.filter(subpage => {
      let dir = path.join(DIR_SRC, target, subpage);
      if(fs.existsSync(dir) && fs.statSync(dir).isDirectory()){
        // 只检查文件夹名称
        if(!type('hard')) return true;

        const files = fs.readdirSync(dir);
        // files 中包含 entryInclude 的所有值
        return config.entryInclude.every(item=>!!~files.indexOf(item))
      }else{
        return false;
      }
    });
};
