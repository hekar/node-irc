'use strict';

module.exports = function topic(message, args) {
  // channel, topic, nick
  this.emit('topic', args[0], args[1], message.nick, message);

  const channel = this.chanData(args[0]);
  if (channel) {
      channel.topic = args[1];
      channel.topicBy = message.nick;
  }
}
