'use strict';

const _ = require('lodash');
const util = require('util');

const handlers = {};

function handle(type, handler) {
  /* eslint-disable no-shadow */
  function setHandler(type, handler) {
    if (type in handlers) {
      throw new Error(`Handler for ${type} already added`);
    }

    handlers[type] = handler;
  }
  /* eslint-enable no-shadow */

  if (_.isArray(type)) {
    return type.map((t) => setHandler(t, handler));
  } else {
    return setHandler(type, handler);
  }
}

function process(message) {
  const args = message.args;

  if (message.command in handlers) {
    handlers[message.command].call(this, message, args);
  } else {
    if (message.commandType === 'error') {
      this.emit('error', message);
      if (this.opt.showErrors) {
        util.log('\u001b[01;31mERROR: ' + util.inspect(message) + '\u001b[0m');
      }
    } else {
      if (this.opt.debug) {
        util.log('\u001b[01;31mUnhandled message: ' + util.inspect(message) + '\u001b[0m');
      }
    }
  }
}

handle('rpl_welcome', require('./handle/rpl/welcome'));
handle('rpl_myinfo', require('./handle/rpl/myinfo'));
handle('rpl_isupport', require('./handle/rpl/isupport'));
handle([
  'rpl_motdstart',
  'rpl_motd'
], require('./handle/rpl/motdstart'));
handle([
  'rpl_endofmotd',
  'err_nomotd'
], require('./handle/rpl/endofmotd'));
handle('rpl_namreply', require('./handle/rpl/namreply'));
handle('rpl_endofnames', require('./handle/rpl/endofnames'));
handle('rpl_topic', require('./handle/rpl/topic'));
handle('rpl_away', require('./handle/rpl/away'));
handle('rpl_whoisuser', require('./handle/rpl/whoisuser'));
handle('rpl_whoisidle', require('./handle/rpl/whoisidle'));
handle('rpl_whoischannels', require('./handle/rpl/whoischannels'));
handle('rpl_whoisserver', require('./handle/rpl/whoisserver'));
handle('rpl_whoisoperator', require('./handle/rpl/whoisoperator'));
handle([
  'rpl_whoisaccount',
  '330'
], require('./handle/rpl/whoisaccount'));
handle('rpl_endofwhois', require('./handle/rpl/endofwhois'));
handle('rpl_whoreply', require('./handle/rpl/whoreply'));
handle('rpl_liststart', require('./handle/rpl/liststart'));
handle('rpl_list', require('./handle/rpl/list'));
handle('rpl_listend', require('./handle/rpl/listend'));
handle('rpl_topicwhotime', require('./handle/rpl/topicwhotime'));
handle('rpl_channelmodeis', require('./handle/rpl/channelmodeis'));
handle('rpl_creationtime', require('./handle/rpl/creationtime'));
handle('rpl_youreoper', () => this.emit('opered'));

handle('JOIN', require('./handle/irc/join'));
handle('PING', require('./handle/irc/ping'));
handle('PONG', require('./handle/irc/pong'));
handle('NOTICE', require('./handle/irc/notice'));
handle('MODE', require('./handle/irc/mode'));
handle('NICK', require('./handle/irc/nick'));
handle('TOPIC', require('./handle/irc/topic'));
handle('PART', require('./handle/irc/part'));
handle('KICK', require('./handle/irc/kick'));
handle('KILL', require('./handle/irc/kill'));
handle('PRIVMSG', require('./handle/irc/privmsg'));
handle('INVITE', require('./handle/irc/invite'));
handle('QUIT', require('./handle/irc/quit'));
handle('CAP', require('./handle/irc/cap'));
handle('AUTHENTICATE', require('./handle/irc/authenticate'));
handle('903', () => this.send('CAP', 'END'));

handle('err_nicknameinuse', require('./handle/err/nicknameinuse'));
handle('err_umodeunknownflag', require('./handle/err/umodeunknownflag'));
handle('err_erroneusnickname', require('./handle/err/erroneusnickname'));
handle('err_nooperhost', require('./handle/err/nooperhost'));

/**
 * Unhandled message types
 */
handle([
  'rpl_yourhost',
  'rpl_created',
  'rpl_luserclient',
  'rpl_luserop',
  'rpl_luserchannels',
  'rpl_luserme',
  'rpl_localusers',
  'rpl_globalusers',
  'rpl_statsconn',
  'rpl_luserunknown',
  '396',
  '042'
], _.noop);

module.exports = process;
