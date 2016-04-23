'use strict';

module.exports = function rpl_liststart(message, args) {
  this.channellist = [];
  this.emit('channellist_start');
};
