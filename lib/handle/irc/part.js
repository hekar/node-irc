'use strict';

module.exports = function part(message, args) {
  // channel, who, reason
  this.emit('part', args[0], message.nick, args[1], message);
  this.emit('part' + args[0], message.nick, args[1], message);
  if (args[0] != args[0].toLowerCase()) {
      this.emit('part' + args[0].toLowerCase(), message.nick, args[1], message);
  }

  if (this.nick == message.nick) {
      const channel = this.chanData(args[0]);
      delete this.chans[channel.key];
  } else {
      const channel = this.chanData(args[0]);
      if (channel && channel.users) {
          delete channel.users[message.nick];
      }
  }
};
