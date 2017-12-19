const { exec } = require('child_process');
const path = require('path');



process.chdir('./seed');
exec(
  `node ${path.join(__dirname, '../index.js')} r _template_def --test`,
  function(err, stdout, stderr) {
    console.log(stdout);
  }
);
