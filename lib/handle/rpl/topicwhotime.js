'use strict';

module.exports = function rpl_topicwhotime(message, args) {
  const channel = this.chanData(args[1]);
  if (channel) {
      channel.topicBy = args[2];
      // channel, topic, nick
      this.emit('topic', args[1], channel.topic, channel.topicBy, message);
  }
}
