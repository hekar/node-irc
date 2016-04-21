'use strict';

module.exports = function rpl_whoisoperator(message, args) {
  this._addWhoisData(args[1], 'operator', args[2]);
}
