'use strict';

module.exports = function rpl_endofmotd(message, args) {
  this.motd += args[1] + '\n';
  this.emit('motd', this.motd);
}
