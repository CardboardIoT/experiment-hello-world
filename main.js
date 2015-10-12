var five = require('johnny-five'),
    RaspiIO = require('raspi-io'),
    Promise = require('es6-promise').Promise,
    mqtt = require('./lib/mqtt');

var components = {
  led: [],
  button: []
};

init();

function init() {
  createBoard()
    .then(connectMqtt);
}


/*
  Setup JohnnyFive and configure components
*/
function createBoard() {
  return new Promise(function (resolve, reject) {
    var board = new five.Board({
      io: new RaspiIO(),
      repl: false
    });

    board.on('ready', function() {
      var led, button;

      led = new five.Led(0);
      led.off();

      // Store LED at id 0
      components.led[0] = led;

      // Button
      button = new five.Button({
        pin: 3,
        isPullup: true
      });

      button.on("hold", function() {
        console.log( "Button held" );
      });

      button.on("press", function() {
        console.log( "Button pressed" );
        led.on();
      });

      button.on("release", function() {
        console.log( "Button released" );
        led.off();
      });
      components.button[0] = button;

      // Pass control to next promise
      resolve();
    });
  });
}

/*
  Connect to the MQTT broker
*/
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
