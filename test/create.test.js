const should = require('should');
const path = require('path');
const shell = require('shelljs');

describe('create', function() {
  const dir = process.cwd();
  let create;
  before(function() {
    process.chdir(path.join(__dirname, './seed'));
    create = require('../bin/create').create;
    try{
      shell.rm('-rf', path.join(__dirname, './seed/src/mocha_test'));
    }catch(e){}
  });
  after(function() {
    try{
      shell.rm('-rf', path.join(__dirname, './seed/src/mocha_test'));
    }catch(e){}

    process.chdir(dir);
  });

  it('create one.', function(done) {
    create('mocha_test', 'def').then(()=> done()).catch(()=>{
      ('interrupted').should.be.exactly('not happens');
    });
  });

  it('interrupted when create a existed project.', function(done) {
    create('mocha_test', 'def').then(()=> {
      ('interrupted').should.be.exactly('happens');
    }).catch(()=> done());
  });
});
