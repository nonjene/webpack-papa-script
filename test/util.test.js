const should = require("should");

const { asyncEach } = require("../bin/util/asyncEach");

describe("util", function() {
  describe("#asyncEach()", function() {
    it("should return property value", function(done) {
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
    it("should concatenate value", function(done) {
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
    it("flatten array", function(done) {
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
    it("filter", function(done) {
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
});
