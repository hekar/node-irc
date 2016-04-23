'use strict';

module.exports = function rpl_endofwhois(message, args) {
  this.emit('whois', this._clearWhoisData(args[1]));
};
