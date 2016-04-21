'use strict';

module.exports = function rpl_whoischannels(message, args) {
  this._addWhoisData(args[1], 'channels',
    args[2].trim().split(/\s+/));
}
