'use strict';

module.exports = function rpl_endofwhois(message, args) {
  this._addWhoisData(args[5], 'user', args[2]);
  this._addWhoisData(args[5], 'host', args[3]);
  this._addWhoisData(args[5], 'server', args[4]);
  this._addWhoisData(args[5], 'realname', /[0-9]+\s*(.+)/g.exec(args[7])[1]);
  // emit right away because rpl_endofwho doesn't contain nick
  this.emit('whois', this._clearWhoisData(args[5]));
};
