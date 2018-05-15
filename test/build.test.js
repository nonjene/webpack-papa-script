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
      config.setConf('proSpecific', 'pro');
      (config.getEnvDesc().indexOf('生产环境') > -1).should.be.true();
    });
    it('getFrontendEnvDesc() echo right desc.', function() {
      config.setConf('fronendEnv', 'pre');
      config.getFrontendEnvDesc().should.containEql('预发环境');
    });

  });

  describe('#run build', function() {
    let runBuild;
    let relDir, config_v;
    beforeEach(function() {
      config_v = path.join(process.cwd(), 'src/proj1/config_v.js');
      try {
        shelljs.rm('-rf', config_v);
      } catch (e) {}

      resetConfig();
      frontendConf = require('../bin/frontend_conf');
      runBuild = require('../bin/build').build;
    });
    afterEach(function() {
      try {
        delete require.cache[require.resolve('../bin/frontend_conf')];
        delete require.cache[require.resolve('../bin/build')];
      } catch (e) {}
    });

    it('release a test project', function(done) {
      relDir = path.join(process.cwd(), 'build/activity/proj1');
      try {
        shelljs.rm('-rf', relDir);
      } catch (e) {}
      ////////////////

      config.setTarget('proj1');
      config.setConf('proSpecific', 'test');

      frontendConf.setFrontEndConf('test', config.getTarget());
      frontendConf.promiseSetDone
        .then(function() {
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

    it('release as production', function(done) {
      relDir = path.join(process.cwd(), 'dist/pro/proj1');
      try {
        shelljs.rm('-rf', relDir);
      } catch (e) {}
      ////////////////

      config.setTarget('proj1');
      config.setConf('proSpecific', 'pro');

      frontendConf.setFrontEndConf('produce', config.getTarget());
      frontendConf.promiseSetDone
        .then(function() {
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

    // it('upload files of a test project to ftp.', function() {});

    // it('deploy static.', function() {});
  });
});
