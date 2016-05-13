'use strict';

module.exports = function whoIsOperator(message, args) {
  this._addWhoisData(args[1], 'operator', args[2]);
};
