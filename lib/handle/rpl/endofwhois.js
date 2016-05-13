'use strict';

module.exports = function endOfWhoIs(message, args) {
  this.emit('whois', this._clearWhoisData(args[1]));
};
