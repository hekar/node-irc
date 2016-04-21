'use strict';

const util = require('util');

module.exports = function(message, args) {
  if (this.opt.showErrors) {
    this.emit('error', message);
    if (this.opt.showErrors) {
      util.log('\u001b[01;31mERROR: ' + util.inspect(message) + '\u001b[0m');
    }
  }
};
