'use strict';


/**
 * cap - SASL
 */
module.exports = function cap(message, args) {
  if (args[0] === '*' &&
    args[1] === 'ACK' &&
    args[2] === 'sasl ' // there's a space after sasl
  ) {
     this.send('AUTHENTICATE', 'PLAIN');
  }
}
