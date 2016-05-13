'use strict';

const util = require('util');

module.exports = function nick(message, args) {
  if (message.nick === this.nick) {
    // the user just changed their own nick
    this.nick = args[0];
    this._updateMaxLineLength();
  }

  if (this.opt.debug) {
    util.log('NICK: ' + message.nick + ' changes nick to ' + args[0]);
  }

  const channels = [];

  // TODO better way of finding what channels a user is in?
  this.chans.forEach((channelName) => {
    const channel = this.chans[channelName];
    channel.users[args[0]] = channel.users[message.nick];
    delete channel.users[message.nick];
    channels.push(channelName);
  });

  // old nick, new nick, channels
  this.emit('nick', message.nick, args[0], channels, message);
};
