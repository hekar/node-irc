const irc = require('../lib/irc');
const test = require('tape');

const testHelpers = require('./helpers');

test('sent messages ending with double CRLF', function(t) {
  const mock = testHelpers.MockIrcd(); // eslint-disable-line new-cap
  const client = new irc.Client('localhost', 'testbot', {
    debug: true
  });

  const expected = testHelpers.getFixtures('double-CRLF');

  t.plan(expected.sent.length + expected.received.length);

  mock.server.on('connection', function() {
    mock.send(expected.received[0][0]);
  });

  client.on('registered', function() {
    t.equal(mock.outgoing[0], expected.received[0][0], expected.received[0][1]);
    client.disconnect();
  });

  mock.on('end', function() {
    const msgs = mock.getIncomingMsgs();

    for (let i = 0; i < msgs.length; i++) {
      t.equal(msgs[i], expected.sent[i][0], expected.sent[i][1]);
    }
    mock.close();
  });
});
