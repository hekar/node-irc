'use strict';

const util = require('util');

module.exports = function(message, args) {
  if (this.opt.debug) {
    util.log('MODE: ' + args[0] + ' sets mode: ' + args[1]);
  }

  const channel = this.chanData(args[0]);
  if (!channel) {
    return;
  }

  const modeList = args[1].split('');
  const modeArgs = args.slice(2);

  let adding = true;
  modeList.forEach(function(mode) {
    if (mode === '+') {
      adding = true;
      return;
    } else if (mode === '-') {
      adding = false;
      return;
    }

    const eventName = (adding ? '+' : '-') + 'mode';
    const supported = this.supported.channel.modes;
    let modeArg;

    const chanModes = function(mode, param) { // eslint-disable-line
      const arr = param && Array.isArray(param);
      if (adding) {
        if (channel.mode.indexOf(mode) === -1) {
          channel.mode += mode;
        }

        if (!param) {
          channel.modeParams[mode] = [];
        } else if (arr) {
          channel.modeParams[mode] = channel.modeParams[mode] ?
            channel.modeParams[mode].concat(param) : param;
        } else {
          channel.modeParams[mode] = [param];
        }
      } else {
        if (arr) {
          channel.modeParams[mode] = channel.modeParams[mode]
            .filter(function(v) {
              return v !== param[0];
            });
        }
        if (!arr || channel.modeParams[mode].length === 0) {
          channel.mode = channel.mode.replace(mode, '');
          delete channel.modeParams[mode];
        }
      }
    };

    if (mode in this.prefixForMode) {
      modeArg = modeArgs.shift();
      if (channel.users.hasOwnProperty(modeArg)) {
        if (adding) {
          if (channel.users[modeArg].indexOf(this.prefixForMode[mode]) === -1) {
            channel.users[modeArg] += this.prefixForMode[mode];
          }
        } else {
          channel.users[modeArg] = channel.users[modeArg].replace(this.prefixForMode[mode], '');
        }
      }
      this.emit(eventName, args[0], message.nick, mode, modeArg, message);
    } else if (supported.a.indexOf(mode) !== -1) {
      modeArg = modeArgs.shift();
      chanModes(mode, [modeArg]);
      this.emit(eventName, args[0], message.nick, mode, modeArg, message);
    } else if (supported.b.indexOf(mode) !== -1) {
      modeArg = modeArgs.shift();
      chanModes(mode, modeArg);
      this.emit(eventName, args[0], message.nick, mode, modeArg, message);
    } else if (supported.c.indexOf(mode) !== -1) {
      if (adding) {
        modeArg = modeArgs.shift();
      } else {
        modeArg = null;
      }
      chanModes(mode, modeArg);
      this.emit(eventName, args[0], message.nick, mode, modeArg, message);
    } else if (supported.d.indexOf(mode) !== -1) {
      chanModes(mode);
      this.emit(eventName, args[0], message.nick, mode, null, message);
    }
  });
};
