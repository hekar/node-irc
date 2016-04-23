#!/usr/bin/env node

var irc = require('../');
/*
* To set the key/cert explicitly, you could do the following
var fs = require('fs');

var options = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('certificate.crt')
};
*/

// Or to just use defaults
var options = true;

var bot = new irc.Client('chat.us.freenode.net', 'nodebot', {
	port: 6697,
    debug: true,
	secure: options,
    channels: ['#botwar']
});

bot.addListener('error', function(message) {
    console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});

bot.addListener('message#blah', function(from, message) {
    console.log('<%s> %s', from, message);
});

bot.addListener('message', function(from, to, message) {
    console.log('%s => %s: %s', from, to, message);

    if (to.match(/^[#&]/)) {
        // channel message
        if (message.match(/hello/i)) {
            bot.say(to, 'Hello there ' + from);
        }
        if (message.match(/dance/)) {
            setTimeout(function() { bot.say(to, '\u0001ACTION dances: :D\\-<\u0001'); }, 1000);
            setTimeout(function() { bot.say(to, '\u0001ACTION dances: :D|-<\u0001'); }, 2000);
            setTimeout(function() { bot.say(to, '\u0001ACTION dances: :D/-<\u0001'); }, 3000);
            setTimeout(function() { bot.say(to, '\u0001ACTION dances: :D|-<\u0001'); }, 4000);
        }
    }
    else {
        // private message
        console.log('private message');
    }
});
bot.addListener('pm', function(nick, message) {
    console.log('Got private message from %s: %s', nick, message);
});
bot.addListener('join', function(channel, who) {
    console.log('%s has joined %s', who, channel);
});
bot.addListener('part', function(channel, who, reason) {
    console.log('%s has left %s: %s', who, channel, reason);
});
bot.addListener('kick', function(channel, who, by, reason) {
    console.log('%s was kicked from %s by %s: %s', who, channel, by, reason);
});
