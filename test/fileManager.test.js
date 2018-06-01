const should = require('should');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');



describe('#fileManger', function() {
  const dir = process.cwd();
  let config, fileManager, frontendConf, runBuild, getAllProjName,getAllSubPageName;

  const resetConfig = () => {
    try{
      delete require.cache[require.resolve('../bin/config')];
      delete require.cache[require.resolve('../bin/util/getAllProjName')];
      delete require.cache[require.resolve('../bin/file_manager')];
      delete require.cache[require.resolve('../bin/frontend_conf')];
      delete require.cache[require.resolve('../bin/build')];
    }catch(e){}
    config = require('../bin/config');
    fileManager = require('../bin/file_manager');
    frontendConf = require('../bin/frontend_conf');
    runBuild = require('../bin/build').build;
    const _scaner = require('../bin/util/getAllProjName');
    getAllProjName = _scaner.getAllProjName;
    getAllSubPageName = _scaner.getAllSubPageName;
  
  };

  before(() => {
    // 所有test文件都会先读取完describe ，所以必须把环境写在before，不能放在describe上。
    process.chdir(path.join(__dirname, './seed'));
    process.env._mocha_test = true;
  });
  after(() => {
    process.chdir(dir);
  });

  describe('getAllProjName.js', function(){
    after(()=>resetConfig());
    describe('getAllSubPageName()', function(){
      before(()=>{
        resetConfig();
      });
      it('get correct entries', ()=>{
        const entries = getAllSubPageName('proj2');
        entries.should.containDeep([{subpath:'page1/page1-1'},{subpath:'page2/m'}]);
        entries.should.have.length(2);
      });
    });
    describe('getAllProjName()', function(){
      before(()=>{
        resetConfig();
      });
      it('get correct quantity of proj', ()=>{
        const entries = getAllProjName('subFolder');
        entries.should.be.eql('subFolder/proj1,subFolder/proj2');
      });
      it('get correct quantity of the whole "./src", ', ()=>{
        const entries = getAllProjName();
        entries.should.be.eql('_template_def,proj1,proj2,subFolder/proj1,subFolder/proj2');
      });
    });
  });

  describe('get build files', function() {
    
    
    after(()=>resetConfig());

    describe('for simple proj1.', function(){
      let relDir;
      before(()=>{
        resetConfig();
        config.setTarget('proj1');
        relDir = path.join(process.cwd(), 'build/activity/proj1');
      });
      it('has test project to run test.', ()=>{
        fs.existsSync(relDir).should.be.true();
      });
      it('gets correct quantity of files', (done)=>{
        fileManager.getAssetsFiles(config.getTarget(), config.getConf('duan'), (allFilesInfo, remoteLink) =>{
          allFilesInfo.should.have.length(8);
          done();
        })
      });  
    });

    describe('for multi-page proj2, with a flat page.', function(){
      let relDir;
      before(()=>{
        resetConfig();
        relDir = path.join(process.cwd(), 'build/activity/proj2');
        
        if(fs.existsSync(relDir)){
          shell.rm('-rf', relDir);
        }

        // build
        config.setTarget('proj2');
        config.setConf('deployType', 'test');
        frontendConf.setFrontEndConf('test', config.getTarget());
        return new Promise((resolve, reject) => {
          frontendConf.promiseSetDone
            .then(() => runBuild({ noLog: true }))
            .then(() => resolve())
            .catch(e => reject(e));
        });
      });
      it('has test project to run test.',()=>{
        fs.existsSync(relDir).should.be.true();
      });
      it('gets correct quantity of files', (done)=>{
        fileManager.getAssetsFiles(config.getTarget(), config.getConf('duan'), (allFilesInfo, remoteLink) =>{
          allFilesInfo.should.have.length(7);
          done();
        })
      });  
    });


    

  });

  describe('get static files', function(){

  });

});
