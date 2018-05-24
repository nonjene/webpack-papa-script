const should = require('should');
const path = require('path');
const fs = require('fs');
const shelljs = require('shelljs');

describe('#supporter', function() {
  const dir = process.cwd();
  const pathConfig = path.join(__dirname, '../bin/config.js');
  let config;

  const resetConfig = () => {
    if (require.cache[pathConfig]) {
      delete require.cache[pathConfig];
    }
    config = require('../bin/config');
  };

  before(() => {
    // 所有test文件都会先读取完describe ，所以必须把环境写在before，不能放在describe上。
    process.chdir(path.join(__dirname, './seed'));
    process.env._mocha_test = true;
  });
  after(() => {
    process.chdir(dir);
  });

  describe('local server', function() {
    it('start server', function(done) {
      const { start, stop } = require('../bin/serve');
      start({ isOpen: false })
        .then(() => {
          stop();
          done();
        })
        .catch(e => {
          'server.js'.should.be.exactly('not throw error.');
        });
    });  
  });
});
