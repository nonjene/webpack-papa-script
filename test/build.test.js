const should = require('should');
const path = require('path');
const fs = require('fs');
const shelljs = require('shelljs');

describe('build', function () {
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

  before(function () {
    process.chdir(path.join(__dirname, './seed'));
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
      config.setConf('proSpecific', 'pro');
      (config.getEnvDesc().indexOf('生产环境') > -1).should.be.true();
    });
    it('getFrontendEnvDesc() echo right desc.', function () {
      config.setConf('fronendEnv', 'pre');
      config.getFrontendEnvDesc().should.containEql('预发环境');
    });

  });

  describe('#run build', function () {
    let runBuild, runWatch;
    let relDir, config_v;
    beforeEach(function () {
      config_v = path.join(process.cwd(), 'src/proj1/config_v.js');
      try {
        shelljs.rm('-rf', config_v);
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
      relDir = path.join(process.cwd(), 'build/activity/proj1');
      try {
        shelljs.rm('-rf', relDir);
      } catch (e) { }
      ////////////////

      config.setTarget('proj1');
      config.setConf('proSpecific', 'test');

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
      relDir = path.join(process.cwd(), 'dist/pro/proj1');
      try {
        shelljs.rm('-rf', relDir);
      } catch (e) { }
      ////////////////

      config.setTarget('proj1');
      config.setConf('proSpecific', 'pro');

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

    it('run webpack dev watch', function (done) {

      config.setTarget('proj1');
      config.setConf('proSpecific', 'test');
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
      relDir = path.join(process.cwd(), 'build/activity/proj1');
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
      const { deployStaticAll, deployStaticEnvTest } = require('../bin/deployStatic');
      try{
        deployStaticAll(true, false,()=>done());
      
      }catch(e){
        ('deploy static').should.be.exactly('not throw error.');
      }
    });
  });
});
