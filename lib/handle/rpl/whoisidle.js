'use strict';

module.exports = function rpl_namreply(message, args) {
  this._addWhoisData(args[1], 'idle', args[2]);
};
