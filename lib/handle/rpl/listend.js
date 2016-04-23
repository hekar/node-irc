'use strict';

module.exports = function rpl_listend(message, args) {
  this.emit('channellist', this.channellist);
};
