'use strict';

module.exports = function motdStart(message, args) {
  this.motd = args[1] + '\n';
};
