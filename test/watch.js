const { exec } = require('child_process');
const path = require('path');

// 需要进入 test/seed/ 环境运行

exec(
  `node ${path.join(__dirname, '../index.js')} w _template_def`,
  (err, stdout, stderr) => {
    if (err) {
      
    }
  }
).stdout.on('data', data => {
    console.log(data);
});
