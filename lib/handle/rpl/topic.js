'use strict';

module.exports = function topic(message, args) {
  const channel = this.chanData(args[1]);
  if (channel) {
    channel.topic = args[2];
  }
};
