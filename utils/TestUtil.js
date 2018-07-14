'use strict';

function DoneOnce(done) {
  var called = false;

  this.trigger = function(error = undefined) {
    if (called) {
      console.warn('done has already been called');

      return;
    }

    done(error);
    called = true;
  };
};

function DoneAll(done, shouldDoneNumber) {
  var doneNumber = 0;

  this.trigger = function() {
    doneNumber++;
    if (doneNumber === shouldDoneNumber) {
      done();
    } else if (doneNumber > shouldDoneNumber) {
      console.warn('done has already been called');
      return;
    }
  };

  this.isDone = function() {
    return doneNumber >= shouldDoneNumber;
  };
};

module.exports = {DoneAll, DoneOnce};
