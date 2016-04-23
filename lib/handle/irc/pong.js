'use strict';

module.exports = function ping(message, args) {
  this.emit('pong', args[0]);
};
