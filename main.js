var five = require('johnny-five'),
    raspi = require('raspi-io'),
    Promise = require('es6-promise').Promise,
    mqtt = require('./lib/mqtt');

var components = {
  led: []
};

init();

function init() {
  createBoard()
    .then(connectMqtt);
}

function createBoard() {
  return new Promise(function (resolve, reject) {
    var board = new five.Board({
      io: new raspi(),
      repl: false
    });

    board.on('ready', function() {
      // Connected to pin 7
      components.led[0] = new five.Led(0);
      // Put into known state
      components.led[0].off();

      // Pass control to next promise
      resolve();
    });
  });
}

function connectMqtt() {
  return new Promise(function (resolve, reject) {
    var client = mqtt.connect();

    client.on('connect', function () {
      console.log('MQTT: connected');
      client.subscribe('ciot/test');
      console.log('MQTT: subscribed');
      resolve();
    });

    client.on('message', function (topic, message) {
      var data;
      try {
        data = JSON.parse(message);
        console.log('Data: ', data);
        handleMessage(data);
      } catch(err) {
        console.error('Error parsing message as JSON');
        console.error(' Topic:', topic);
        console.error(' Original message:');
        console.error(' ', message.toString())
      }
    });
  });
}

function handleMessage(msg) {
  if (msg.type === 'led' && msg.id) {
    var led = components.led[msg.id];
    if (led && msg.data && msg.data.on != null) {
      led[ msg.data.on ? 'on' : 'off' ]();
    } else {
      console.log('No component found or no data');
    }
  } else {
    console.log('Not type led or no id');
  }
}

process.on('SIGINT', shutdown);

function shutdown() {
  console.log( "Exiting" );
  components.led[0].off();
  process.exit();
}
