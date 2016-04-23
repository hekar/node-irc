'use strict';
/*
    irc.js - Node JS IRC client library

    (C) Copyright Martyn Smith 2010

    This library is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this library.  If not, see <http://www.gnu.org/licenses/>.
*/

const _ = require('lodash');
const net = require('net');
const tls = require('tls');
const util = require('util');
const processMessage = require('./process_message');
const EventEmitter = require('events').EventEmitter;
const colors = require('./colors');
const parseMessage = require('./parse_message');
const CyclingPingTimer = require('./cycling_ping_timer.js');

const lineDelimiter = new RegExp('\r\n|\r|\n');

class Client extends EventEmitter {
  constructor(server, nick, opt) {
    super();

    this.conn = null;
    this.prefixForMode = {};
    this.modeForPrefix = {};
    this.chans = {};
    this._whoisData = {};
    this.pingCounter = 0;

    this.opt = {
      server: server,
      nick: nick,
      password: null,
      userName: 'nodebot',
      realName: 'nodeJS IRC client',
      port: 6667,
      localAddress: null,
      debug: false,
      showErrors: false,
      autoRejoin: false,
      channels: [],
      retryCount: null,
      retryDelay: 2000,
      secure: false,
      selfSigned: false,
      certExpired: false,
      floodProtection: false,
      floodProtectionDelay: 1000,
      sasl: false,
      stripColors: false,
      channelPrefixes: '&#',
      messageSplit: 512,
      encoding: false,
      webirc: {
        pass: '',
        ip: '',
        host: ''
      },
      millisecondsOfSilenceBeforePingSent: 15 * 1000,
      millisecondsBeforePingTimeout: 8 * 1000
    };

    // Features supported by the server
    // (initial values are RFC 1459 defaults. Zeros signify
    // no default or unlimited value)
    this.supported = {
      channel: {
        idlength: [],
        length: 200,
        limit: [],
        modes: {
          a: '',
          b: '',
          c: '',
          d: ''
        },
        types: this.opt.channelPrefixes
      },
      kicklength: 0,
      maxlist: [],
      maxtargets: [],
      modes: 3,
      nicklength: 9,
      topiclength: 0,
      usermodes: ''
    };

    if (typeof arguments[2] == 'object') {
      var keys = Object.keys(this.opt);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (arguments[2][k] !== undefined)
          this.opt[k] = arguments[2][k];
      }
    }

    if (this.opt.floodProtection) {
      this.activateFloodProtection();
    }

    this.hostMask = '';

    this.addListener('raw', processMessage.bind(this));

    this.addListener('kick', (channel, who, by, reason) => {
      if (this.opt.autoRejoin) {
        this.send.apply(this, ['JOIN'].concat(channel.split(' ')));
      }
    });

    this.addListener('motd', (motd) => {
      this.opt.channels.forEach((channel) => {
        this.send.apply(this, ['JOIN'].concat(channel.split(' ')));
      });
    });

    EventEmitter.call(this);
  }

  connectionTimedOut(conn) {
    // Only care about a timeout event if it came from the connection
    // that is most current.
    if (conn === this.conn) {
      this.end();
    }
  }

  connectionWantsPing(conn) {
    var self = this;
    if (conn !== self.conn) {
      // Only care about a wantPing event if it came from the connection
      // that is most current.
      return;
    }
    self.send('PING', (this.pingCounter++).toString());
  }

  chanData(name, create) {
    var key = name.toLowerCase();
    if (create) {
      this.chans[key] = this.chans[key] || {
        key: key,
        serverName: name,
        users: {},
        modeParams: {},
        mode: ''
      };
    }

    return this.chans[key];
  }

  _connectionHandler() {
    const opt = this.opt;
    const useWebIrc = opt.webirc.ip &&
      opt.webirc.pass &&
      opt.webirc.host;

    if (useWebIrc) {
      this.send('WEBIRC', opt.webirc.pass, opt.userName, opt.webirc.host, opt.webirc.ip);
    }

    if (opt.sasl) {
      // see http://ircv3.atheme.org/extensions/sasl-3.1
      this.send('CAP REQ', 'sasl');
    } else if (opt.password) {
      this.send('PASS', opt.password);
    }

    if (opt.debug) {
      util.log('Sending irc NICK/USER');
    }

    this.send('NICK', opt.nick);
    this.nick = opt.nick;
    this._updateMaxLineLength();
    this.send('USER', opt.userName, 8, '*', opt.realName);

    this.conn.cyclingPingTimer.start();

    this.emit('connect');
  }

  connect(retryCount, callback) {
    if (typeof (retryCount) === 'function') {
      callback = retryCount;
      retryCount = undefined;
    }

    retryCount = retryCount || 0;
    if (typeof (callback) === 'function') {
      this.once('registered', callback);
    }

    const self = this;
    self.chans = {};

    // socket opts
    const connectionOpts = {
      host: self.opt.server,
      port: self.opt.port
    };

    // local address to bind to
    if (self.opt.localAddress) {
      connectionOpts.localAddress = self.opt.localAddress;
    }

    // try to connect to the server
    if (self.opt.secure) {
      connectionOpts.rejectUnauthorized = !self.opt.selfSigned;

      if (typeof self.opt.secure == 'object') {
        // copy "secure" opts to options passed to connect()
        for (var f in self.opt.secure) {
          connectionOpts[f] = self.opt.secure[f];
        }
      }

      self.conn = tls.connect(connectionOpts, function() {
        // callback called only after successful socket connection
        self.conn.connected = true;
        if (self.conn.authorized ||
          (self.opt.selfSigned &&
            (self.conn.authorizationError === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
              self.conn.authorizationError === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
              self.conn.authorizationError === 'SELF_SIGNED_CERT_IN_CHAIN')) ||
          (self.opt.certExpired &&
            self.conn.authorizationError === 'CERT_HAS_EXPIRED')) {
          // authorization successful

          if (!self.opt.encoding) {
            self.conn.setEncoding('utf-8');
          }

          if (self.opt.certExpired &&
            self.conn.authorizationError === 'CERT_HAS_EXPIRED') {
            util.log('Connecting to server with expired certificate');
          }

          self._connectionHandler();
        } else {
          // authorization failed
          util.log(self.conn.authorizationError);
        }
      });
    } else {
      self.conn = net.createConnection(connectionOpts, self._connectionHandler.bind(self));
    }
    self.conn.requestedDisconnect = false;
    self.conn.setTimeout(0);

    // Each connection gets its own CyclingPingTimer. The connection forwards the timer's 'timeout' and 'wantPing' events
    // to the client object via calling the connectionTimedOut() and connectionWantsPing() functions.
    //
    // Since the client's "current connection" value changes over time because of retry functionality,
    // the client should ignore timeout/wantPing events that come from old connections.
    self.conn.cyclingPingTimer = new CyclingPingTimer(self);
    self.conn.cyclingPingTimer.on('pingTimeout', function() {
      self.connectionTimedOut(conn);
    });
    self.conn.cyclingPingTimer.on('wantPing', function() {
      self.connectionWantsPing(conn);
    });

    if (!self.opt.encoding) {
      self.conn.setEncoding('utf8');
    }

    var buffer = new Buffer('');

    function handleData(chunk) {
      self.conn.cyclingPingTimer.notifyOfActivity();

      if (typeof (chunk) === 'string') {
        buffer += chunk;
      } else {
        buffer = Buffer.concat([buffer, chunk]);
      }

      var lines = self.convertEncoding(buffer).toString().split(lineDelimiter);

      if (lines.pop()) {
        // if buffer is not ended with \r\n, there's more chunks.
        return;
      } else {
        // else, initialize the buffer.
        buffer = new Buffer('');
      }

      lines.forEach(function iterator(line) {
        if (line.length) {
          var message = parseMessage(line, self.opt.stripColors);

          try {
            self.emit('raw', message);
          } catch (err) {
            if (!self.conn.requestedDisconnect) {
              throw err;
            }
          }
        }
      });
    }

    self.conn.addListener('data', handleData);
    self.conn.addListener('end', function() {
      if (self.opt.debug)
        util.log('Connection got "end" event');
    });
    self.conn.addListener('close', function() {
      if (self.opt.debug)
        util.log('Connection got "close" event');

      if (self.conn && self.conn.requestedDisconnect)
        return;
      if (self.opt.debug)
        util.log('Disconnected: reconnecting');
      if (self.opt.retryCount !== null && retryCount >= self.opt.retryCount) {
        if (self.opt.debug) {
          util.log('Maximum retry count (' + self.opt.retryCount + ') reached. Aborting');
        }
        self.emit('abort', self.opt.retryCount);
        return;
      }

      if (self.opt.debug) {
        util.log('Waiting ' + self.opt.retryDelay + 'ms before retrying');
      }
      setTimeout(function() {
        self.connect(retryCount + 1);
      }, self.opt.retryDelay);
    });
    self.conn.addListener('error', function(exception) {
      self.emit('netError', exception);
      if (self.opt.debug) {
        util.log('Network error: ' + exception);
      }
    });
  }

  end() {
    if (this.conn) {
      this.conn.cyclingPingTimer.stop();
      this.conn.destroy();
    }
    this.conn = null;
  }

  disconnect(message, callback) {
    if (typeof (message) === 'function') {
      callback = message;
      message = undefined;
    }
    message = message || 'node-irc says goodbye';
    var self = this;
    if (self.conn.readyState == 'open') {
      var sendFunction;
      if (self.opt.floodProtection) {
        sendFunction = self._sendImmediate;
        self._clearCmdQueue();
      } else {
        sendFunction = self.send;
      }
      sendFunction.call(self, 'QUIT', message);
    }
    self.conn.requestedDisconnect = true;
    if (typeof (callback) === 'function') {
      self.conn.once('end', callback);
    }
    self.conn.end();
  }

  send(command) {
    var args = Array.prototype.slice.call(arguments);

    // Note that the command arg is included in the args array as the first element

    if (args[args.length - 1].match(/\s/) || args[args.length - 1].match(/^:/) || args[args.length - 1] === '') {
      args[args.length - 1] = ':' + args[args.length - 1];
    }

    if (this.opt.debug)
      util.log('SEND: ' + args.join(' '));

    if (!this.conn.requestedDisconnect) {
      console.log('args joined', args.join(' ') + '\r\n');
      this.conn.write(args.join(' ') + '\r\n');
    }
  }

  activateFloodProtection(interval) {

    var cmdQueue = [],
      safeInterval = interval || this.opt.floodProtectionDelay,
      self = this,
      origSend = this.send,
      dequeue;

    // Wrapper for the original function. Just put everything to on central
    // queue.
    this.send = function() {
      cmdQueue.push(arguments);
    };

    this._sendImmediate = function() {
      origSend.apply(self, arguments);
    };

    this._clearCmdQueue = function() {
      cmdQueue = [];
    };

    dequeue = function() {
      var args = cmdQueue.shift();
      if (args) {
        origSend.apply(self, args);
      }
    };

    // Slowly unpack the queue without flooding.
    setInterval(dequeue, safeInterval);
    dequeue();
  }

  join(channel, callback) {
    channel = channel.substr(1);
    var channelName = channel.split(' ')[0];
    this.once('join' + channelName, function() {
      // if join is successful, add this channel to opts.channels
      // so that it will be re-joined upon reconnect (as channels
      // specified in options are)
      if (this.opt.channels.indexOf(channel) == -1) {
        this.opt.channels.push(channel);
      }

      if (typeof (callback) == 'function') {
        return callback.apply(this, arguments);
      }
    });
    const cmd = ['JOIN'].concat(channel.split(' '));
    console.log(cmd);
    for (i = 0; i < channel.length; i++) {
      console.log(channel.charCodeAt(i));
    }
    this.send.apply(this, cmd);
  }

  part(channel, message, callback) {
    if (typeof (message) === 'function') {
      callback = message;
      message = undefined;
    }
    if (typeof (callback) == 'function') {
      this.once('part' + channel, callback);
    }

    // remove this channel from this.opt.channels so we won't rejoin
    // upon reconnect
    if (this.opt.channels.indexOf(channel) != -1) {
      this.opt.channels.splice(this.opt.channels.indexOf(channel), 1);
    }

    if (message) {
      this.send('PART', channel, message);
    } else {
      this.send('PART', channel);
    }
  }

  action(channel, text) {
    var self = this;
    if (typeof text !== 'undefined') {
      text.toString().split(/\r?\n/).filter(function(line) {
        return line.length > 0;
      }).forEach(function(line) {
        self.say(channel, '\u0001ACTION ' + line + '\u0001');
      });
    }
  }

  _splitLongLines(words, maxLength, destination) {
    maxLength = maxLength || 450; // If maxLength hasn't been initialized yet, prefer an arbitrarily low line length over crashing.
    if (words.length == 0) {
      return destination;
    }
    if (words.length <= maxLength) {
      destination.push(words);
      return destination;
    }
    var c = words[maxLength];
    var cutPos;
    var wsLength = 1;
    if (c.match(/\s/)) {
      cutPos = maxLength;
    } else {
      var offset = 1;
      while ((maxLength - offset) > 0) {
        var c = words[maxLength - offset];
        if (c.match(/\s/)) {
          cutPos = maxLength - offset;
          break;
        }
        offset++;
      }
      if (maxLength - offset <= 0) {
        cutPos = maxLength;
        wsLength = 0;
      }
    }
    var part = words.substring(0, cutPos);
    destination.push(part);
    return this._splitLongLines(words.substring(cutPos + wsLength, words.length), maxLength, destination);
  }

  say(target, text) {
    this._speak('PRIVMSG', target, text);
  }

  notice(target, text) {
    this._speak('NOTICE', target, text);
  }

  _speak(kind, target, text) {
    var self = this;
    var maxLength = this.maxLineLength - target.length;
    if (typeof text !== 'undefined') {
      text.toString().split(/\r?\n/).filter(function(line) {
        return line.length > 0;
      }).forEach(function(line) {
        var linesToSend = self._splitLongLines(line, maxLength, []);
        linesToSend.forEach(function(toSend) {
          self.send(kind, target, toSend);
          if (kind == 'PRIVMSG') {
            self.emit('selfMessage', target, toSend);
          }
        });
      });
    }
  }

  whois(nick, callback) {
    if (typeof callback === 'function') {
      var callbackWrapper = function(info) {
        if (info.nick.toLowerCase() == nick.toLowerCase()) {
          this.removeListener('whois', callbackWrapper);
          return callback.apply(this, arguments);
        }
      };
      this.addListener('whois', callbackWrapper);
    }
    this.send('WHOIS', nick);
  }

  list() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('LIST');
    this.send.apply(this, args);
  }

  _addWhoisData(nick, key, value, onlyIfExists) {
    if (onlyIfExists && !this._whoisData[nick]) return;
    this._whoisData[nick] = this._whoisData[nick] || {
      nick: nick
    };
    this._whoisData[nick][key] = value;
  }

  _clearWhoisData(nick) {
    // Ensure that at least the nick exists before trying to return
    this._addWhoisData(nick, 'nick', nick);
    var data = this._whoisData[nick];
    delete this._whoisData[nick];
    return data;
  }

  _handleCTCP(from, to, text, type, message) {
    text = text.slice(1);
    text = text.slice(0, text.indexOf('\u0001'));
    var parts = text.split(' ');
    this.emit('ctcp', from, to, text, type, message);
    this.emit('ctcp-' + type, from, to, text, message);
    if (type === 'privmsg' && text === 'VERSION')
      this.emit('ctcp-version', from, to, message);
    if (parts[0] === 'ACTION' && parts.length > 1)
      this.emit('action', from, to, parts.slice(1).join(' '), message);
    if (parts[0] === 'PING' && type === 'privmsg' && parts.length > 1)
      this.ctcp(from, 'notice', text);
  }

  ctcp(to, type, text) {
    return this[type === 'privmsg' ? 'say' : 'notice'](to, '\u0001' + text + '\u0001');
  }

  convertEncoding(str) {
    var self = this,
      out = str;

    if (self.opt.encoding) {
      try {
        var charsetDetector = require('node-icu-charset-detector');
        var Iconv = require('iconv').Iconv;
        var charset = charsetDetector.detectCharset(str);
        var converter = new Iconv(charset.toString(), self.opt.encoding);

        out = converter.convert(str);
      } catch (err) {
        if (self.opt.debug) {
          util.log('\u001b[01;31mERROR: ' + err + '\u001b[0m');
          util.inspect({
            str: str,
            charset: charset
          });
        }
      }
    }

    return out;
  }

  // blatantly stolen from irssi's splitlong.pl. Thanks, Bjoern Krombholz!
  _updateMaxLineLength() {
    // 497 = 510 - (":" + "!" + " PRIVMSG " + " :").length;
    // target is determined in _speak() and subtracted there
    this.maxLineLength = 497 - this.nick.length - this.hostMask.length;
  }
}

module.exports = {
  Client,
  colors
};
