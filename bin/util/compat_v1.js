/**
 * Created by Nonjene on 2017/7/13.
 */

const fs = require("fs");
const chalk = require("chalk");

const injectCommon = (file, commonFileInject, comFilePath) => {
  const code = fs.readFileSync(file, "utf8");

  // 删除common.js的引用
  const reg = new RegExp(`<script[^<]*${comFilePath.replace(/([\.|\?])/g, "\\$1")}[^<]*</script>`, "gi");

  fs.writeFileSync(
    file,
    code.replace(reg, "").replace(/<\/body>/, commonFileInject + "</body>"),
    "utf8"
  );
  console.log(chalk.cyan(`note: 已把${file}加入common.js的引用`));
};

module.exports = {
  injectCommon
};
