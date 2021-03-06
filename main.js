var five = require('johnny-five'),
    RaspiIO = require('raspi-io'),
    Promise = require('es6-promise').Promise,
    EventEmitter = require('events').EventEmitter,
    config = require('config'),
    mqtt = require('./lib/mqtt');

var components = {
  led: [],
  button: []
};

init();

function init() {
  var events = new EventEmitter();

  process.on('SIGINT', shutdown.bind(null, events));

  Promise
    .all([createBoard(events), connectMqtt(events)])
    // Pass event bus as first parameter
    .then(bindActions.bind(null, events), console.error.bind(console))
    .catch(console.error.bind(console));
}

/*
  Setup JohnnyFive and configure components
*/
function createBoard(events) {
  return new Promise(function (resolve, reject) {
    var board;

    board = new five.Board({
      io: new RaspiIO(),
      repl: false
    });

    board.on('ready', function() {
      var led, button;

      led = new five.Led(0);
      led.off();

      // Turn LED off on app exit
      events.on('app:exit', function () {
        led.off();
      });

      // Store LED at id 0
      components.led[0] = led;

      // Button
      button = new five.Button({
        pin: 3,
        isPullup: true
      });

      button.on("hold", function handleButtonHold() {
        events.emit('button:hold', button);
      });

      button.on("press", function() {
        events.emit('button:press', button);
      });

      button.on("release", function() {
        events.emit('button:release', button);
      });
      components.button[0] = button;

      // Pass control to next promise
      resolve(components);
    });
  });
}

/*
  Connect to the MQTT broker
*/
function connectMqtt(events) {
  return new Promise(function (resolve, reject) {
    var client = mqtt.connect(),
        subscriptionTopic = mqtt.topicForParams({
          action: 'command',
          type: '#',
          device: config.get('id')
        });

    client.on('connect', function () {
      console.log('MQTT: connected');
      client.subscribe(subscriptionTopic);
      console.log('MQTT: subscribed to: ', subscriptionTopic);
      resolve(client);
    });

    events.on('mqtt:send', function (topic, payload) {
      var msg = JSON.stringify(payload);
      console.log('MQTT: publish', topic, msg);
      client.publish(topic, msg);
    });

    client.on('message', function (topic, message) {
      var data;
      try {
        data = JSON.parse(message);
        console.log('Data: ', data);
        events.emit('mqtt:message', data);
      } catch(err) {
        console.error('Error parsing message as JSON');
        console.error(' Topic:', topic);
        console.error(' Original message:');
        console.error(' ', message.toString())
      }
    });
  });
}

function bindActions(events) {
  events.on('mqtt:message', handleMessage);
  var buttonEmitTopic = mqtt.topicForParams({
    device: config.get('id'),
    type: 'button',
    action: 'event'
  });
  events.on('button:press', function () {
    console.log('button press');
    events.emit('mqtt:send', buttonEmitTopic,
      { type: 'button', id: '0', data: { state: 'press' } }
    );
  });
  events.on('button:hold', function () {
    console.log('button hold');
    events.emit('mqtt:send', buttonEmitTopic,
      { type: 'button', id: '0', data: { state: 'hold' } }
    );
  });
  events.on('button:release', function () {
    console.log('button release');
    events.emit('mqtt:send', buttonEmitTopic,
      { type: 'button', id: '0', data: { state: 'release' } }
    );
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

function shutdown(events) {
  console.log( "Exiting" );
  events.emit('app:exit');
  process.exit();
}
