const should = require('should');
const path = require('path');
const fs = require('fs');
const shelljs = require('shelljs');

describe('build', function() {
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

  before(() => {
    // 所有test文件都会先读取完describe ，所以必须把环境写在before，不能放在describe上。
    process.chdir(path.join(__dirname, './seed'));
    process.env._mocha_test = true;
  });
  after(() => {
    process.chdir(dir);
  });

  describe('#config setting', function() {
    before(() => resetConfig());

    it('set target.', function() {
      config.setTarget('scope/proj1');
      config.getTarget().should.eql(['scope/proj1']);
    });
    it('getEnvDesc() echo correct desc.', function() {
      config.setConf('deployType', 'pro');
      (config.getEnvDesc().indexOf('生产环境') > -1).should.be.true();
    });
    it('getFrontendEnvDesc() echo correct desc.', function() {
      config.setConf('fronendEnv', 'pre');
      config.getFrontendEnvDesc().should.containEql('预发环境');
    });
  });

  describe('#run build', function() {
    let runBuild,
      runWatch,
      allProjAddr,
      frontendConf,
      config_vProj1,
      config_vProj2;
    //获取所有项目名字
    const resetEnv = () => {
      // 删除例子里的所有config_v.js文件
      try {
        allProjAddr.forEach(projAddr => {
          shelljs.rm('-rf', path.join(projAddr, 'config_v.js'));
        });
      } catch (e) {}

      // 重置webpack config.
      resetConfig();
      delete require.cache[require.resolve('../bin/frontend_conf')];
      delete require.cache[require.resolve('../bin/build')];
      frontendConf = require('../bin/frontend_conf');
      const build = require('../bin/build');
      runBuild = build.build;
      runWatch = build.watch;
    };

    const outPutDirGetAndClean = dir => {
      const relDir = path.join(process.cwd(), dir);
      try {
        shelljs.rm('-rf', relDir);
      } catch (e) {}
      return relDir;
    };

    before(function() {
      resetEnv();
      allProjAddr = getAllProjName(null, path.join(__dirname, './seed/src'))
        .split(',')
        .map(item => path.join(__dirname, './seed/src', item));

      config_vProj1 = path.join(process.cwd(), 'src/proj1/config_v.js');
      config_vProj2 = path.join(process.cwd(), 'src/proj2/config_v.js');
    });
    after(() => {
      resetEnv();
    });

    describe('#release a test project.', function() {
      let relDir;

      before(() => {
        resetEnv();
        relDir = outPutDirGetAndClean('build/activity/proj1');

        config.setTarget('proj1');
        config.setConf('deployType', 'test');
        frontendConf.setFrontEndConf('test', config.getTarget());

        return new Promise((resolve, reject) => {
          frontendConf.promiseSetDone
            .then(() => runBuild({ noLog: true }))
            .then(() => resolve())
            .catch(e => reject(e));
        });
      });
      after(() => {});

      it('set config correctly', function() {
        config.getTarget().should.eql(['proj1']);
        config.getEnvDesc().should.containEql('开发环境');
        config.getFrontendEnvDesc().should.containEql('测试环境');
      });
      it('set frontend config_v.', function() {
        fs.existsSync(config_vProj1).should.be.true();
        fs
          .readFileSync(config_vProj1, { encoding: 'utf8' })
          .should.containEql('test');
      });
      it('output file.', function() {
        ////////////////
        fs.existsSync(relDir).should.be.true();
      });
    });

    describe('#release a project with muti pages.', function() {
      let relDir;

      before(() => {
        resetEnv();
        relDir = outPutDirGetAndClean('dist/pro/proj2');

        config.setTarget('proj2');
        config.setConf('deployType', 'pro');

        frontendConf.setFrontEndConf('produce', config.getTarget());
        return new Promise((resolve, reject) => {
          frontendConf.promiseSetDone
            .then(() => runBuild({ noLog: true }))
            .then(() => resolve())
            .catch(e => reject(e));
        });
      });
      it('should config correctly.', () => {
        fs.existsSync(config_vProj2).should.be.true();
        fs
          .readFileSync(config_vProj2, { encoding: 'utf8' })
          .should.containEql('produce');

        config.getTarget().should.eql(['proj2']);
        config.getEnvDesc().should.containEql('生产环境');
        config.getFrontendEnvDesc().should.containEql('生产环境');
      });
      it('output file.', () => {
        fs.existsSync(relDir).should.be.true();
      });
      it('link the correct path of files.', () => {
        fs.existsSync(path.join(relDir, 'img')).should.be.true();
        const file = fs.readdirSync(path.join(relDir, 'img'))[0];
        const namedir = path.join('/activity/proj2/img/', file);
        const namedirJs = path.join('img/', file);
        //console.log(namedir)

        const filesName = fs.readdirSync(path.join(relDir, 'page1/m'));
        //css
        filesName.filter(name => /\.css$/.test(name)).forEach(name => {
          should(
            fs
              .readFileSync(path.join(relDir, 'page1/m', name), 'utf8')
              .match(namedir)
          ).be.ok();
        });
        //js bundle
        filesName.filter(name => /\.js$/.test(name)).forEach(name => {
          should(
            fs
              .readFileSync(path.join(relDir, 'page1/m', name), 'utf8')
              .match(namedirJs)
          ).be.ok();
        });
        // js vendor
        fs
          .readdirSync(path.join(relDir, 'vendors'))
          .filter(name => /^vendors.*\.js$/.test(name))
          .forEach(name => {
            should(
              fs
                .readFileSync(path.join(relDir, 'vendors', name), 'utf8')
                .match('https:/images.okpapa.com/activity/proj2/')
            ).be.ok();
          });
      });
    });

    describe('#release a pro project', function() {
      let relDir, err;

      before(() => {
        resetEnv();
        relDir = outPutDirGetAndClean('dist/pro/proj1');
        config.setTarget('proj1');
        config.setConf('deployType', 'pro');
        frontendConf.setFrontEndConf('produce', config.getTarget());

        return new Promise(resolve => {
          frontendConf.promiseSetDone
            .then(() => runBuild({ noLog: true }))
            .then(() => resolve())
            .catch(e => {
              err = e;
              resolve();
            });
        });
      });

      it('should not throw.', () => {
        (!!err).should.be.false();
      });

      it('config correctly.', () => {
        fs.existsSync(config_vProj1).should.be.true();
        fs
          .readFileSync(config_vProj1, { encoding: 'utf8' })
          .should.containEql('produce');

        config.getTarget().should.eql(['proj1']);
        config.getEnvDesc().should.containEql('生产环境');
        config.getFrontendEnvDesc().should.containEql('生产环境');
      });

      it('output file.', function() {
        fs.existsSync(relDir).should.be.true();
      });

      it('link the correct path of files.', function() {
        // /activity/proj1/img/example_93785.jpg
        fs.existsSync(path.join(relDir, 'img')).should.be.true();
        const file = fs.readdirSync(path.join(relDir, 'img'))[0];
        const namedir = path.join('/activity/proj1/img/', file);
        fs
          .readdirSync(path.join(relDir, 'm'))
          .filter(name => /\.(js|css)$/.test(name))
          .forEach(name => {
            should(
              fs
                .readFileSync(path.join(relDir, 'm', name), 'utf8')
                .match(namedir)
            ).be.ok();
          });
      });
    });

    describe('#release muti projects.', function() {
      let relDir, err, config_v1, config_v2;
      before(() => {
        config_v1 = path.join(process.cwd(), 'src/subFolder/proj1/config_v.js');
        config_v2 = path.join(process.cwd(), 'src/subFolder/proj2/config_v.js');

        resetEnv();
        relDir = outPutDirGetAndClean('dist/pro/subFolder');
        config.setBuildAllScope('subFolder');

        config.setTarget(getAllProjName(config.getConf('buildAllScope')));
        config.setConf('deployType', 'pro');

        frontendConf.setFrontEndConf('produce', config.getTarget());

        return new Promise(resolve => {
          frontendConf.promiseSetDone
            .then(() => runBuild({ noLog: true }))
            .then(() => resolve())
            .catch(e => {
              err = e;
              resolve();
            });
        });
        it('build successfully', () => {
          err.should.not.be.ok();
        });
        it('set config correctly.', () => {
          config.getTarget().should.eql(['subFolder/proj1', 'subFolder/proj2']);
        });
        it('set frontend config_v.', () => {
          fs.existsSync(config_v1).should.be.true();
          fs.existsSync(config_v2).should.be.true();
          fs
            .readFileSync(config_v2, { encoding: 'utf8' })
            .should.containEql(
              fs.readFileSync(config_v2, { encoding: 'utf8' })
            );
        });
        it('output file.', () => {
          fs.existsSync(path.join(relDir, 'proj1')).should.be.true();
          fs.existsSync(path.join(relDir, 'proj2')).should.be.true();
        });
      });
    });

    describe('#run webpack dev watch.', function() {
      let err;
      before(() => {
        resetEnv();
        config.setTarget('proj1');
        config.setConf('deployType', 'test');

        //config.setEnv('development');//webpack liveReload会导致测试不结束

        frontendConf.setFrontEndConf('test', config.getTarget());
        return new Promise(resolve => {
          frontendConf.promiseSetDone
            .then(()=> runWatch({ noLog: true, noServ: true }))
            .then(watching => {
              //watching.invalidate();
              watching.close(() => done());
              resolve();
            })
            .catch(e => {
              err = e;
              resolve();
            });
        });

        it('config correctly.', ()=>{
          config.getTarget().should.eql(['proj1']);
              config.getEnvDesc().should.containEql('开发环境');
              config.getFrontendEnvDesc().should.containEql('测试环境');
        });

        it('do not throw err.', ()=>{
          err.should.not.be.ok();
        });
      });
    });


    describe('deploy static files', function(){
      before(()=> resetConfig());
      after(()=>resetConfig());
  
      it('copy all static files to local dev folder.', function(done) {
        const { deployStaticEnvTest } = require('../bin/deployStatic');
        try {
          deployStaticEnvTest(() => {
            done();
          });
        } catch (e) {
          'copy static to test env'.should.be.exactly('not throw error.');
        }
      });
      it('deploy static to all env.', function(done) {
        const { deployStaticAll } = require('../bin/deployStatic');
        try {
          deployStaticAll(false, () => done());
        } catch (e) {
          'deploy static'.should.be.exactly('not throw error.');
        }
      });
    });

    
    
  });
});
