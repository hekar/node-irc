'use strict';

module.exports = function kick(message, args) {
  // channel, who, by, reason
  this.emit('kick', args[0], args[1], message.nick, args[2], message);
  this.emit('kick' + args[0], args[1], message.nick, args[2], message);
  if (args[0] != args[0].toLowerCase()) {
      this.emit('kick' + args[0].toLowerCase(),
                args[1], message.nick, args[2], message);
  }

  if (this.nick == args[1]) {
      const channel = this.chanData(args[0]);
      delete this.chans[channel.key];
  } else {
      const channel = this.chanData(args[0]);
      if (channel && channel.users) {
          delete channel.users[args[1]];
      }
  }
};
