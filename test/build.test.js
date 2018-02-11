const should = require('should');
const path = require('path');

describe('build', function() {
  const dir = process.cwd();
  let config;
  before(function() {
    process.chdir(path.join(__dirname, './seed'));

    const pathConfig = path.join(__dirname, '../bin/config.js');
    if (require.cache[pathConfig]) {
      delete require.cache[pathConfig];
    }
    config = require('../bin/config');
  });
  after(function() {
    process.chdir(dir);
  });

  describe('#config setting', function() {
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

  describe('#run build', function(){
    it('release a test project', function() {
      
    });
    it('release a pre project', function() {});
    it('release a pro project', function() {});

    it('upload files of a test project to ftp.', function() {});

    it('deploy static.', function() {});
  })
});
