'use strict';

module.exports = function listEnd() {
  this.emit('channellist', this.channellist);
};
