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
  describe('#process cwd',function(){
    it('should in the "/test/seed/"',function(){
      process.cwd().should.match(/test\/seed/)
    })
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
      getAllProjName = require('../bin/util/getAllProjName');
    });
    it('get all.', function() {
      const list = getAllProjName().split(',');
      list.should.be.an.instanceOf(Array);
      list.should.containEql('_template_def').and.containEql('scope/proj2');
    });
    it('get scope.', function() {
      const list = getAllProjName('scope').split(',');
      list.should.be.an.instanceOf(Array);
      list.should.have.length(2);
      list.should.containEql('scope/proj1').and.containEql('scope/proj2');
    });
  });
  describe('#hasDuan()', function() {

  });
});
