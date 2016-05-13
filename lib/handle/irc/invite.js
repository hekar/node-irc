'use strict';

module.exports = function invite(message, args) {
  const from = message.nick;
  const to = args[0]; // eslint-disable-line no-unused-vars
  const channel = args[1];
  this.emit('invite', channel, from, message);
};
