'use strict';

module.exports = function rplWelcome(message, args) {
  // Set nick to whatever the server decided it really is
  // (normally this is because you chose something too long and
  // the server has shortened it
  this.nick = args[0];
  // Note our hostmask to use it in splitting long messages.
  // We don't send our hostmask when issuing PRIVMSGs or NOTICEs,
  // of course, but rather the servers on the other side will
  // include it in messages and will truncate what we send if
  // the string is too long. Therefore, we need to be considerate
  // neighbors and truncate our messages accordingly.
  var welcomeStringWords = args[1].split(/\s+/);
  this.hostMask = welcomeStringWords[welcomeStringWords.length - 1];
  this._updateMaxLineLength();
  this.emit('registered', message);
  this.whois(this.nick, function(args) {
      this.nick = args.nick;
      this.hostMask = args.user + '@' + args.host;
      this._updateMaxLineLength();
  });
};
