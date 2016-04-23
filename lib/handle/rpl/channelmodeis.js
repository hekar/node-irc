'use strict';

module.exports = function rpl_channelmodeis(message, args) {
  const channel = this.chanData(args[1]);
  if (channel) {
      channel.mode = args[2];
  }
};
