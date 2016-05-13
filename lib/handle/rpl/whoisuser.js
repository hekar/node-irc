'use strict';

module.exports = function whoIsUser(message, args) {
  this._addWhoisData(args[1], 'user', args[2]);
  this._addWhoisData(args[1], 'host', args[3]);
  this._addWhoisData(args[1], 'realname', args[5]);
};
