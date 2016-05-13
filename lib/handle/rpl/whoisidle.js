'use strict';

module.exports = function whoIsIdle(message, args) {
  this._addWhoisData(args[1], 'idle', args[2]);
};
