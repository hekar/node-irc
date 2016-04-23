'use strict';

module.exports = function privmsg(message, args) {
  const from = message.nick;
  const to = args[0];
  const text = args[1] || '';
  if (text[0] === '\u0001' && text.lastIndexOf('\u0001') > 0) {
      this._handleCTCP(from, to, text, 'privmsg', message);
  } else {
    this.emit('message', from, to, text, message);

    if (this.supported.channel.types.indexOf(to.charAt(0)) !== -1) {
        this.emit('message#', from, to, text, message);
        this.emit('message' + to, from, text, message);
        if (to != to.toLowerCase()) {
            this.emit('message' + to.toLowerCase(), from, text, message);
        }
    }

    if (to.toUpperCase() === this.nick.toUpperCase()) {
      this.emit('pm', from, text, message);
    }

    if (this.opt.debug && to == this.nick) {
      util.log('GOT MESSAGE from ' + from + ': ' + text);
    }
  }
};
