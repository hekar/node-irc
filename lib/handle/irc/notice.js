'use strict';

module.exports = function notice(message, args) {
  let from = message.nick;
  let to = args[0];
  if (!to) {
      to = null;
  }

  let text = args[1] || '';
  if (text[0] === '\u0001' && text.lastIndexOf('\u0001') > 0) {
      this._handleCTCP(from, to, text, 'notice', message);
  } else {
    this.emit('notice', from, to, text, message);

    if (this.opt.debug && to == this.nick)
        util.log('GOT NOTICE from ' + (from ? '"' + from + '"' : 'the server') + ': "' + text + '"');
  }
};
