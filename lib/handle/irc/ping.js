'use strict';

module.exports = function ping(message, args) {
  this.send('PONG', args[0]);
  this.emit('ping', args[0]);
};
