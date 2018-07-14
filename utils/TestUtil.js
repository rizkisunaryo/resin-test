'use strict';

function Done(done) {
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

module.exports = {Done};
