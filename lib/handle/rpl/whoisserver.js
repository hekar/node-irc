'use strict';

module.exports = function whoIsServer(message, args) {
  this._addWhoisData(args[1], 'server', args[2]);
  this._addWhoisData(args[1], 'serverinfo', args[3]);
};
