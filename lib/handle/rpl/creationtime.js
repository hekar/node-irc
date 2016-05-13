'use strict';

module.exports = function creationTime(message, args) {
  const channel = this.chanData(args[1]);
  if (channel) {
      channel.created = args[2];
  }
};
