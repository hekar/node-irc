'use strict';

module.exports = function join(message, args) {
  const self = this;
  args.forEach(function(arg) {
    var match;
    match = arg.match(/([A-Z]+)=(.*)/);
    if (match) {
        var param = match[1];
        var value = match[2];
        switch (param) {
            case 'CHANLIMIT':
                value.split(',').forEach(function(val) {
                    val = val.split(':');
                    self.supported.channel.limit[val[0]] = parseInt(val[1]);
                });
                break;
            case 'CHANMODES':
                value = value.split(',');
                var type = ['a', 'b', 'c', 'd'];
                for (var i = 0; i < type.length; i++) {
                    self.supported.channel.modes[type[i]] += value[i];
                }
                break;
            case 'CHANTYPES':
                self.supported.channel.types = value;
                break;
            case 'CHANNELLEN':
                self.supported.channel.length = parseInt(value);
                break;
            case 'IDCHAN':
                value.split(',').forEach(function(val) {
                    val = val.split(':');
                    self.supported.channel.idlength[val[0]] = val[1];
                });
                break;
            case 'KICKLEN':
                self.supported.kicklength = value;
                break;
            case 'MAXLIST':
                value.split(',').forEach(function(val) {
                    val = val.split(':');
                    self.supported.maxlist[val[0]] = parseInt(val[1]);
                });
                break;
            case 'NICKLEN':
                self.supported.nicklength = parseInt(value);
                break;
            case 'PREFIX':
                match = value.match(/\((.*?)\)(.*)/);
                if (match) {
                    match[1] = match[1].split('');
                    match[2] = match[2].split('');
                    while (match[1].length) {
                        self.modeForPrefix[match[2][0]] = match[1][0];
                        self.supported.channel.modes.b += match[1][0];
                        self.prefixForMode[match[1].shift()] = match[2].shift();
                    }
                }
                break;
            case 'STATUSMSG':
                break;
            case 'TARGMAX':
                value.split(',').forEach(function(val) {
                    val = val.split(':');
                    val[1] = (!val[1]) ? 0 : parseInt(val[1]);
                    self.supported.maxtargets[val[0]] = val[1];
                });
                break;
            case 'TOPICLEN':
                self.supported.topiclength = parseInt(value);
                break;
        }
    }
  });
};
