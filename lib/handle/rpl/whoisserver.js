'use strict';

module.exports = function rpl_whoisserver(message, args) {
  this._addWhoisData(args[1], 'server', args[2]);
  this._addWhoisData(args[1], 'serverinfo', args[3]);
};
