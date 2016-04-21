'use strict';

module.exports = function rpl_list(message, args) {
  const channel = {
      name: args[1],
      users: args[2],
      topic: args[3]
  };
  this.emit('channellist_item', channel);
  this.channellist.push(channel);
}
