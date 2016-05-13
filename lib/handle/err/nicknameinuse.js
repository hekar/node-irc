'use strict';

module.exports = function nicknameInUse() {
  if (typeof this.opt.nickMod === 'undefined') {
    this.opt.nickMod = 0;
  }

  this.opt.nickMod++;
  this.send('NICK', this.opt.nick + this.opt.nickMod);
  this.nick = this.opt.nick + this.opt.nickMod;
  this._updateMaxLineLength();
};
