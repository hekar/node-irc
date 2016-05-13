'use strict';

module.exports = function endOfMotd(message, args) {
  this.motd += args[1] + '\n';
  this.emit('motd', this.motd);
};
