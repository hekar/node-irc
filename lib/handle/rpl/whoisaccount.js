'use strict';

module.exports = function rpl_whoisaccount(message, args) {
  this._addWhoisData(args[1], 'account', args[2]);
  this._addWhoisData(args[1], 'accountinfo', args[3]);
}
