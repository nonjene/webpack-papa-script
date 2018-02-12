const should = require('should');
const path = require('path');
const fs = require('fs');
const shelljs = require('shelljs');

describe('build', function() {
  const dir = process.cwd();
  const pathConfig = path.join(__dirname, '../bin/config.js');
  let config;
  let frontendConf;
  

  const resetConfig = () => {
    if (require.cache[pathConfig]) {
      delete require.cache[pathConfig];
    }
    config = require('../bin/config');
  };

  before(function() {
    process.chdir(path.join(__dirname, './seed'));
    frontendConf = require('../bin/frontend_conf');
  });
  after(function() {
    process.chdir(dir);
  });

  describe('#config setting', function() {
    before(() => resetConfig());

    it('set target.', function() {
      config.setTarget('scope/proj1');
      config.getTarget().should.eql(['scope/proj1']);
    });
    it('getEnvDesc() echo right desc.', function() {
      //frontendConf.setFrontEndConf('pre', target);
      config.setConf('proSpecific', 'pro');
      (config.getEnvDesc().indexOf('生产环境') > -1).should.be.true();
    });
    it('getFrontendEnvDesc() echo right desc.', function() {
      config.setConf('fronendEnv', 'pre');
      config.getFrontendEnvDesc().should.containEql('预发环境');
    });

    it('combine build command.', function() {
      config.setConf('fronendEnv', 'produce');
      config.setTarget('scope/proj1');

      config
        .combineBuild(0)
        .should.containEql(
          'export NODE_ENV=production&&export PRO_SPECIFIC=pro&&export BUILD_TARGET=scope/proj1&&export DUAN=pc,m&&node'
        );
      config.combineBuild(0).should.containEql('bin/run_build/build');
    });
  });

  describe('#run build', function() {
    let runBuild;
    before(function() {
      resetConfig();
      runBuild = require('../bin/build').build;
    });

    describe('##build test', function(){
      let relDir, config_v;
      before(function() {
        relDir = path.join(process.cwd(), 'build/activity/proj1');
        config_v = path.join(process.cwd(), 'src/proj1/config_v.js');
        try{ 
          shelljs.rm('-rf', relDir);
          shelljs.rm('-rf', config_v);
         }catch(e){}

      });
      after(function(){
        try{ 
          shelljs.rm('-rf', relDir);
          //shelljs.rm('-rf', config_v);
         }catch(e){}
      });
      it('release a test project', function(done) {
        config.setTarget('proj1');
        config.setConf('proSpecific', 'test');
        
        frontendConf.setFrontEndConf('test', config.getTarget());
        frontendConf.promiseSetDone
          .then(function(){
            return runBuild({noLog:true})
          })
          .then(() => {
            fs.existsSync(relDir).should.be.true();
            fs.existsSync(config_v).should.be.true();
            done();
          })
          .catch(e => {
            should.throws(()=>{
              throw new Error('should not throw error:' + e);
            })
          });
      });
    });

    describe('##release production', function(){
      let relDir, config_v;
      before(function() {
        relDir = path.join(process.cwd(), 'dist/pro/proj1');
        config_v = path.join(process.cwd(), 'src/proj1/config_v.js');
        try{ 
          shelljs.rm('-rf', relDir);
          shelljs.rm('-rf', config_v);
         }catch(e){}

      });
      after(function(){
        try{ 
          shelljs.rm('-rf', relDir);
          //shelljs.rm('-rf', config_v);
         }catch(e){}
      });
      it('release a pro project', function(done) {
        config.setTarget('proj1');
        config.setConf('proSpecific', 'pro');
        
        frontendConf.setFrontEndConf('pro', config.getTarget());
        frontendConf.promiseSetDone
          .then(function(){
            return runBuild({noLog:true})
          })
          .then(() => {
            fs.existsSync(relDir).should.be.true();
            fs.existsSync(config_v).should.be.true();
            done();
          })
          .catch(e => {
            should.throws(()=>{
              throw new Error('should not throw error:' + e);
            })
          });
      });
    });

    it('upload files of a test project to ftp.', function() {});

    it('deploy static.', function() {});
  });
});
