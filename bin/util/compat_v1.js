/**
 * Created by Nonjene on 2017/7/13.
 */

const fs = require("fs");
const chalk = require("chalk");

/**
 * 
 * @param {string} code              js file
 * @param {string} commonFileInject  <script/>
 * @param {string} comFilePath       需要去掉的js的引用路径
 */
const replace = (code, commonFileInject, comFilePath) => {
  // 删除common.js的引用
  const match = new RegExp(
    `<script[^<]*${comFilePath.replace(/([\.|\?])/g, "\\$1")}[^<]*</script>`,
    "gi"
  );
  return code
    .replace(match, "")
    .replace(/<\/body>/, `${commonFileInject}</body>`);
};

const injectCommon = (file, commonFileInject, comFilePath) => {
  const code = fs.readFileSync(file, "utf8");

  fs.writeFileSync(file, replace(code, commonFileInject, comFilePath), "utf8");

  console.log(chalk.cyan(`note: 已把${file}加入common.js的引用`));
};

module.exports = {
  replace,
  injectCommon
};
