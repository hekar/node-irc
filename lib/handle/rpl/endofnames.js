'use strict';

module.exports = function rpl_namreply(message, args) {
  const channel = this.chanData(args[1]);
  if (channel) {
      this.emit('names', args[1], channel.users);
      this.emit('names' + args[1], channel.users);
      this.send('MODE', args[1]);
  }
}
