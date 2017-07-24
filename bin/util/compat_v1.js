/**
 * Created by Nonjene on 2017/7/13.
 */

const fs = require('fs');
const chalk = require('chalk');


const injectCommon = (file, commonFileInject)=>{
    const code = fs.readFileSync(file, 'utf8');

    if(!new RegExp(commonFileInject,'gi').test(code)){
        fs.writeFileSync(file, code.replace(/<\/body>/, commonFileInject + '<\/body>'), 'utf8');
        console.log(chalk.cyan(`note: 已把${file}加入common.js的引用`));

    }


};

module.exports = {
    injectCommon
};