'use strict';

module.exports = function rpl_motdstart(message, args) {
  this.motd = args[1] + '\n';
}
