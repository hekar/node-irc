'use strict';

module.exports = function cap(message, args) {
  if (args[0] === '+') {
    this.send('AUTHENTICATE',
      new Buffer(
          this.opt.nick + '\0' +
          this.opt.userName + '\0' +
          this.opt.password
      ).toString('base64'));
  }
};
