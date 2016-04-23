'use strict';

module.exports = function rpl_namreply(message, args) {
  this._addWhoisData(args[1], 'away', args[2], true);
};
