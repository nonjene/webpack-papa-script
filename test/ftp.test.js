const should = require('should');
const path = require('path');
const fs = require('fs');
const shelljs = require('shelljs');



describe('#ftp', function() {
  const dir = process.cwd();
  const pathConfig = path.join(__dirname, '../bin/config.js');
  const pathFtp = path.join(__dirname, '../bin/ftp.js');
  let config, ftp;

  const resetConfig = () => {
    if (require.cache[pathConfig]) {
      delete require.cache[pathConfig];
    }
    if (require.cache[pathFtp]) {
      delete require.cache[pathFtp];
    }
    config = require('../bin/config');
    ftp = require('../bin/ftp');
  };

  before(() => {
    // 所有test文件都会先读取完describe ，所以必须把环境写在before，不能放在describe上。
    process.chdir(path.join(__dirname, './seed'));
    process.env._mocha_test = true;
  });
  after(() => {
    process.chdir(dir);
  });

  describe('upload a project to ftp', function() {
    let relDir;
    before(()=>{
      resetConfig();
      config.setTarget('proj1');
      relDir = path.join(process.cwd(), 'build/activity/proj1');
      
    });
    after(()=>resetConfig());

    it('has test project to run test.',()=>{
      fs.existsSync(relDir).should.be.true();
    });

    it('upload without error.', (done)=> {
      ftp
        .uploadToServer({ desc: '', isLog: false })
        .then(remoteLink => {
          done();
        })
        .catch(e => {
          'upload to ftp'.should.be.exactly('not throw error.');
        });
    });
    
    
  });

  describe('upload static files', function(){
    before(()=> resetConfig());
    after(()=>resetConfig());

    it('upload to ftp.', function(done) {
      const { deployStaticAll } = require('../bin/deployStatic');
      try {
        deployStaticAll(true, false, null, ()=>done());
      } catch (e) {
        'deploy static and upload to ftp'.should.be.exactly('not throw error.');
      }
    });
  });
});
