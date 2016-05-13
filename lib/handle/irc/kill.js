'use strict';

module.exports = function kill(message, args) {
  const nick = args[0];
  const channels = [];
  this.chans.forEach((channelName) => {
      const channel = this.chans[channelName];
      channels.push(channelName);
      delete channel.users[nick];
  });
  this.emit('kill', nick, args[1], channels, message);
};
