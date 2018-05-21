const should = require('should');
const path = require('path');
const fs = require('fs');
const shelljs = require('shelljs');

describe('build', function () {
  const dir = process.cwd();
  const pathConfig = path.join(__dirname, '../bin/config.js');
  let config;
  let frontendConf;
  let getAllProjName;

  const resetConfig = () => {
    if (require.cache[pathConfig]) {
      delete require.cache[pathConfig];
    }
    getAllProjName = require('../bin/util/getAllProjName').getAllProjName;
    config = require('../bin/config');
  };

  before(function () {
    process.chdir(path.join(__dirname, './seed'));
    process.env._mocha_test = true;
  });
  after(function () {
    process.chdir(dir);
  });

  describe('#config setting', function () {
    before(() => resetConfig());

    it('set target.', function () {
      config.setTarget('scope/proj1');
      config.getTarget().should.eql(['scope/proj1']);
    });
    it('getEnvDesc() echo right desc.', function () {
      config.setConf('deployType', 'pro');
      (config.getEnvDesc().indexOf('生产环境') > -1).should.be.true();
    });
    it('getFrontendEnvDesc() echo right desc.', function () {
      config.setConf('fronendEnv', 'pre');
      config.getFrontendEnvDesc().should.containEql('预发环境');
    });

  });

  describe('#run build', function () {
    let runBuild, runWatch,allProjAddr;
    before(function(){
      allProjAddr = getAllProjName(null, path.join(__dirname, './seed/src')).split(',').map(item=>path.join(__dirname, './seed/src', item));
    })

    beforeEach(function () {
      try {
        // 删除例子里的所有config_v.js文件
        allProjAddr.forEach(projAddr=>{
          shelljs.rm('-rf', path.join(projAddr, 'config_v.js'));
        })
        
      } catch (e) { }

      resetConfig();
      frontendConf = require('../bin/frontend_conf');
      const build = require('../bin/build');
      runBuild = build.build;
      runWatch = build.watch;
    });
    afterEach(function () {
      try {
        delete require.cache[require.resolve('../bin/frontend_conf')];
        delete require.cache[require.resolve('../bin/build')];
      } catch (e) { }
    });

    it('release a test project', function (done) {
      const relDir = path.join(process.cwd(), 'build/activity/proj1');
      const config_v = path.join(process.cwd(), 'src/proj1/config_v.js');
      try {
        shelljs.rm('-rf', relDir);
      } catch (e) { }
      ////////////////

      config.setTarget('proj1');
      config.setConf('deployType', 'test');

      frontendConf.setFrontEndConf('test', config.getTarget());
      frontendConf.promiseSetDone
        .then(function () {
          fs.existsSync(config_v).should.be.true();
          fs
            .readFileSync(config_v, { encoding: 'utf8' })
            .should.containEql('test');

          config.getTarget().should.eql(['proj1']);
          config.getEnvDesc().should.containEql('开发环境');
          config.getFrontendEnvDesc().should.containEql('测试环境');

          return runBuild({ noLog: true });
        })
        .then(() => {
          fs.existsSync(relDir).should.be.true();
          done();
        });
    });
    it('release as production', function (done) {
      const relDir = path.join(process.cwd(), 'dist/pro/proj1');
      const config_v = path.join(process.cwd(), 'src/proj1/config_v.js');
      try {
        shelljs.rm('-rf', relDir);
      } catch (e) { }
      ////////////////

      config.setTarget('proj1');
      config.setConf('deployType', 'pro');

      frontendConf.setFrontEndConf('produce', config.getTarget());
      frontendConf.promiseSetDone
        .then(function () {
          fs.existsSync(config_v).should.be.true();
          fs
            .readFileSync(config_v, { encoding: 'utf8' })
            .should.containEql('produce');

          config.getTarget().should.eql(['proj1']);
          config.getEnvDesc().should.containEql('生产环境');
          config.getFrontendEnvDesc().should.containEql('生产环境');

          return runBuild({ noLog: true });
        })
        .then(() => {
          fs.existsSync(relDir).should.be.true();
          done();
        });
    });
    it('release a project with muti pages.', function (done) {
      const relDir = path.join(process.cwd(), 'dist/pro/proj2');
      const config_v = path.join(process.cwd(), 'src/proj2/config_v.js');
      try {
        shelljs.rm('-rf', relDir);
      } catch (e) { }
      ////////////////

      config.setTarget('proj2');
      config.setConf('deployType', 'pro');

      frontendConf.setFrontEndConf('produce', config.getTarget());
      frontendConf.promiseSetDone
        .then(function () {
          fs.existsSync(config_v).should.be.true();
          fs
            .readFileSync(config_v, { encoding: 'utf8' })
            .should.containEql('produce');

          config.getTarget().should.eql(['proj2']);
          config.getEnvDesc().should.containEql('生产环境');
          config.getFrontendEnvDesc().should.containEql('生产环境');

          return runBuild({ noLog: true });
        })
        .then(() => {
          fs.existsSync(relDir).should.be.true();
          done();
        });
    });
    it('release muti projects', function (done) {
      const relDir = path.join(process.cwd(), 'dist/pro/subFolder');
      const config_v1 = path.join(process.cwd(), 'src/subFolder/proj1/config_v.js');
      const config_v2 = path.join(process.cwd(), 'src/subFolder/proj2/config_v.js');
      try {
        shelljs.rm('-rf', relDir);
      } catch (e) { }
      ////////////////
      config.setBuildAllScope('subFolder');
      config.setTarget(getAllProjName(config.getConf('buildAllScope')));
      config.setConf('deployType', 'pro');

      frontendConf.setFrontEndConf('produce', config.getTarget());
      frontendConf.promiseSetDone
        .then(function () {
          fs.existsSync(config_v1).should.be.true();
          fs.existsSync(config_v2).should.be.true();
          fs.readFileSync(config_v2, { encoding: 'utf8' })
            .should.containEql(fs.readFileSync(config_v2, { encoding: 'utf8' }));

          config.getTarget().should.eql(['subFolder/proj1','subFolder/proj2']);
          config.getEnvDesc().should.containEql('生产环境');
          config.getFrontendEnvDesc().should.containEql('生产环境');

          return runBuild({ noLog: true });
        })
        .then(() => {
          fs.existsSync(relDir).should.be.true();
          done();
        });
    });

    it('run webpack dev watch', function (done) {

      config.setTarget('proj1');
      config.setConf('deployType', 'test');
      //config.setEnv('development');//webpack liveReload会导致测试不结束

      frontendConf.setFrontEndConf('test', config.getTarget());
      frontendConf.promiseSetDone
        .then(function () {
          config.getTarget().should.eql(['proj1']);
          config.getEnvDesc().should.containEql('开发环境');
          config.getFrontendEnvDesc().should.containEql('测试环境');

          return runWatch({ noLog: true, noServ: true });
        })
        .then((watching) => {
          //watching.invalidate();
          watching.close(() => done());

        }).catch((e) => {
          throw new Error(e);
        });
    });

    it('start server', function (done) {
      const { start, stop } = require('../bin/serve');
      start({ isOpen: false, isLog: false }).then(() => {
        stop();
        done();
      }).catch(e => {
        ('server.js').should.be.exactly('not throw error.');
      })
    });
    it('upload files of a test project to ftp.', function (done) {
      const relDir = path.join(process.cwd(), 'build/activity/proj1');
      fs.existsSync(relDir).should.be.true();

      config.setTarget('proj1');
      const ftp = require('../bin/ftp');
      ftp.uploadToServer({ desc:"", isLog: false, isResLog:false })
      .then(remoteLink => {
        done()
      })
      .catch(e => {
        ('upload to ftp').should.be.exactly('not throw error.');
      });
    });
    it('deploy static.', function(done) {
      const { deployStaticAll } = require('../bin/deployStatic');
      try{
        deployStaticAll(true, false,()=>done());
      
      }catch(e){
        ('deploy static').should.be.exactly('not throw error.');
      }
    });
    it('copy all static files to test env.', function(done) {
      const {  deployStaticEnvTest } = require('../bin/deployStatic');
      try{
        deployStaticEnvTest(()=>{
          done();
        });
      
      }catch(e){
        ('copy static to test env').should.be.exactly('not throw error.');
      }
    });
  });
});
