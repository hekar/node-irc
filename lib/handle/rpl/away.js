'use strict';

module.exports = function away(message, args) {
  this._addWhoisData(args[1], 'away', args[2], true);
};
