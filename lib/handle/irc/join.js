'use strict';

module.exports = function join(message, args) {
  // channel, who
  if (this.nick === message.nick) {
    this.chanData(args[0], true);
  } else {
    const channel = this.chanData(args[0]);
    console.log('char code', Array.prototype.map.call(channel, (c, idx) => channel.charCodeAt(idx)));
    if (channel && channel.users) {
      channel.users[message.nick] = '';
    }
  }
  this.emit('join', args[0], message.nick, message);
  this.emit('join' + args[0], message.nick, message);
  if (args[0] !== args[0].toLowerCase()) {
    this.emit('join' + args[0].toLowerCase(), message.nick, message);
  }
};
