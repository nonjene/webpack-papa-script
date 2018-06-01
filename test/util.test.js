const should = require('should');
const path = require('path');

describe('util', function() {
  const dir = process.cwd();
  before(function() {
    process.chdir(path.join(__dirname, './seed'));
  });
  after(function() {
    process.chdir(dir);
  });
  describe('#process cwd', function() {
    it('should in the "/test/seed/"', function() {
      process.cwd().should.match(/test\/seed/);
    });
  });
  describe('#asyncEach()', function() {
    const { asyncEach } = require('../bin/util/asyncEach');
    it('should return property value', function(done) {
      asyncEach(
        [1, 2, 3],
        (item, next) => {
          setTimeout(() => next(item + 1), 5);
        },
        res => {
          res.should.eql([2, 3, 4]);
          done();
        }
      );
    });
    it('should concatenate value', function(done) {
      asyncEach(
        [1, 2, 3],
        (item, next) => {
          setTimeout(() => next([item, item]), 5);
        },
        res => {
          res.should.eql([1, 1, 2, 2, 3, 3]);
          done();
        }
      );
    });
    it('flatten array', function(done) {
      asyncEach(
        [1, 2, 3],
        (item, next) => {
          setTimeout(() => next([item, item]), 5);
        },
        res => {
          res.should.eql([1, 1, 2, 2, 3, 3]);
          done();
        }
      );
    });
    it('filter', function(done) {
      asyncEach(
        [1, 2, 3],
        (item, next) => {
          setTimeout(() => next(), 5);
        },
        res => {
          res.should.eql([]);
          done();
        }
      );
    });
  });

  describe('#compat_v1:replace()', function() {
    const { replace: compatReplace } = require('../bin/util/compat_v1');
    //#region replace
    it('replace <script src="common.js"/> property.', function() {
      const res = compatReplace(
        `
<html>
  <body>
    <div id="container" class="container">test</div>
____<script type="text/javascript" src="/activity/static/common.js?hehe=233"></script>
    <script src="https://cdn.okpapa.com//activity/static/common.js"></script>
__<script src="https://cdn2.okpapa.com//activity/static/common.js?it_is=bug_too"></script></body>
</html>`,
        `<script type="text/javascript" src="https://cdn.okpapa.com//activity/static/common.js?v=666"></script>`,
        '/activity/static/common.js'
      );
      res.should.eql(`
<html>
  <body>
    <div id="container" class="container">test</div>
____
    
__<script type="text/javascript" src="https://cdn.okpapa.com//activity/static/common.js?v=666"></script></body>
</html>`);
    });
    //#endregion
  });
  describe('#getAllProjName()', function() {
    let getAllProjName;
    before(function() {
      getAllProjName = require('../bin/util/getAllProjName').getAllProjName;
    });
    it('get all.', function() {
      const list = getAllProjName().split(',');
      list.should.be.an.instanceOf(Array);
      list.should.containEql('_template_def').and.containEql('subFolder/proj2');
    });
    it('get scope.', function() {
      const list = getAllProjName('subFolder').split(',');
      list.should.be.an.instanceOf(Array);
      list.should.have.length(2);
      list.should.containEql('subFolder/proj1').and.containEql('subFolder/proj2');
    });
  });
  describe('#hasEntryFiles()', function() {
    let hasEntryFiles;
    before(function() {
      hasEntryFiles = require('../bin/util/hasEntryFiles');
    });
    it('_template_def has "m" and "pc".', function() {
      const tar = hasEntryFiles('_template_def');
      tar.should.be.an.instanceOf(Array);
      tar.should.containEql('m').and.containEql('pc');
    });
    it('get the "m" of _template_def', function() {
      let tar = hasEntryFiles('_template_def','m');
      tar.should.be.an.instanceOf(Array);
      tar.should.containEql('m').and.not.containEql('pc');
    });
    it('get the actual dir.', function() {
      const tar = hasEntryFiles('subFolder/proj1',['m','pc']);
      tar.should.be.an.instanceOf(Array);
      tar.should.containEql('m').and.not.containEql('pc');
    });
    it('get nothing.', function() {
      const tar = hasEntryFiles('subFolder/proj1','pc');
      tar.should.be.an.instanceOf(Array);
      tar.should.lengthOf(0);
    });
  });
  describe('#isProj()',function(){
    let isproj;
    before(function() {
      isproj = require('../bin/util/isProj');
    });
    it('has proj "subFolder/proj1"',function(){
      isproj('subFolder/proj1').should.be.true;
    });
    it('has proj "proj2"',function(){
      isproj('proj2').should.be.true;
    });
  });
  describe('#config.js', function(){
    const config = require('../bin/config');
    it('setduan by correct data type', ()=>{
      config.setDuan('m');
      config.getConf('duan').should.be.eql(['m']);
      config.setDuan(['m']);
      config.getConf('duan').should.be.eql(['m']);
    });

    it('get frontend fetch name corrently', ()=>{
      config.getDevFetchName().should.eql('test');
      config.deployMapFetchName('pro').should.eql('produce');
    });
  });
});
