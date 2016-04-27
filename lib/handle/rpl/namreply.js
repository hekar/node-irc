'use strict';

module.exports = function rpl_namreply(message, args) {
  const channel = this.chanData(args[2]);
  const users = args[3].trim().split(/ +/);
  if (channel) {
    users.forEach((user) => {
      const match = user.match(/^(.)(.*)$/);
      if (match) {
        if (match[1] in this.modeForPrefix) {
          channel.users[match[2]] = match[1];
        } else {
          channel.users[match[1] + match[2]] = '';
        }
      }
    });
  }
};
