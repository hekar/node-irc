'use strict';

module.exports = function whoIsChannels(message, args) {
  this._addWhoisData(args[1], 'channels',
    args[2].trim().split(/\s+/));
};
