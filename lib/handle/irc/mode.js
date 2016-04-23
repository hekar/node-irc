'use strict';

module.exports = function mode(message, args) {
  if (this.opt.debug) {
    util.log('MODE: ' + args[0] + ' sets mode: ' + args[1]);
  }

  channel = this.chanData(args[0]);
  if (!channel) {
    return;
  }

  const modeList = args[1].split('');
  const adding = true;
  const modeArgs = args.slice(2);
  modeList.forEach(function(mode) {
      if (mode == '+') {
          adding = true;
          return;
      }
      if (mode == '-') {
          adding = false;
          return;
      }

      var eventName = (adding ? '+' : '-') + 'mode';
      var supported = this.supported.channel.modes;
      var modeArg;
      var chanModes = function(mode, param) {
          var arr = param && Array.isArray(param);
          if (adding) {
              if (channel.mode.indexOf(mode) == -1) {
                  channel.mode += mode;
              }
              if (param === undefined) {
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
                      .filter(function(v) { return v !== param[0]; });
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
                  if (channel.users[modeArg].indexOf(this.prefixForMode[mode]) === -1)
                      channel.users[modeArg] += this.prefixForMode[mode];
              } else channel.users[modeArg] = channel.users[modeArg].replace(this.prefixForMode[mode], '');
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
          if (adding) modeArg = modeArgs.shift();
          else modeArg = undefined;
          chanModes(mode, modeArg);
          this.emit(eventName, args[0], message.nick, mode, modeArg, message);
      } else if (supported.d.indexOf(mode) !== -1) {
          chanModes(mode);
          this.emit(eventName, args[0], message.nick, mode, undefined, message);
      }
  });
};
