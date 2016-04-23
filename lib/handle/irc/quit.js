'use strict';

module.exports = function topic(message, args) {
  if (this.opt.debug) {
    util.log('QUIT: ' + message.prefix + ' ' + args.join(' '));
  }

  if (this.nick == message.nick) {
      // TODO handle?
  } else {
    // handle other people quitting
    const channels = [];

    // TODO better way of finding what channels a user is in?
    _.each(this.chans, (channelName) => {
        const channel = this.chans[channelName];
        delete channel.users[message.nick];
        channels.push(channelName);
    });

    // who, reason, channels
    this.emit('quit', message.nick, args[0], channels, message);
  }
};
