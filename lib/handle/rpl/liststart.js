'use strict';

/* eslint-disable no-unused-vars */
module.exports = function listStart(message, args) {
  this.channellist = [];
  this.emit('channellist_start');
};
