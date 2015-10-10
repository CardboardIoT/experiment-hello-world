var five = require('johnny-five'),
    raspi = require('raspi-io'),
    mqtt = require('mqtt'),
    fs = require('fs');

var caCert = fs.readFileSync('./certs/mosquitto.org.crt'),
    mqttBroker = 'mqtts://test.mosquitto.org';

var components = {
  led: []
};

var board = new five.Board({
  io: new raspi(),
  repl: false
});

board.on('ready', function() {
  // Create a standard `led` component instance
  // Connected to pin 7
  components.led[0] = new five.Led(7);

  // "blink" the led in 500ms
  // on-off phase periods
  // led.blink(500);
});

var client  = mqtt.connect(mqttBroker, { ca: caCert });

client.on('connect', function () {
  console.log('MQTT: connected');
  client.subscribe('ciot/test');
  console.log('MQTT: subscribed');
});

client.on('message', function (topic, message) {
  var data;
  // message is Buffer
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
