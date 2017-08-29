const { exec } = require('child_process');
const path = require('path');

// 需要进入 test/seed/ 环境运行
exec(
  `node ${path.join(__dirname, '../index.js')} r _template_def --test`,
  function(err, stdout, stderr) {
    console.log(stdout);
  }
);
