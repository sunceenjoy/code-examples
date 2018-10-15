// Import socket.io with a connection to a channel (i.e. tops)
const socket = require('socket.io-client')('https://ws-api.iextrading.com/1.0/tops')
require ('colors')
const _ = require('lodash');
var readline = require('readline');

function stale() {
  readline.cursorTo(process.stdout, 40);
  process.stdout.write("++++".bold.red)
}
// Listen to the channel's messages
socket.on('message', message => {
  message = JSON.parse(message)
  readline.clearLine(process.stdout, 0);  // clear current text
  readline.cursorTo(process.stdout, 0);  // move cursor to the beginning of line
  process.stdout.write(message.symbol+':bidPrice:'+ message.bidPrice+',askPrice'+message.askPrice);
  readline.cursorTo(process.stdout, 40);
  process.stdout.write("----".yellow);
  _.debounce(stale, 1000)();
})

// Connect to the channel
socket.on('connect', () => {

  // Subscribe to topics (i.e. appl,fb,aig+)
  socket.emit('subscribe', 'sco')

})

// Disconnect from the channel
socket.on('disconnect', () => console.log('Disconnected.'))