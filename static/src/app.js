var client, config;

document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log('init');
  fetch('/config.json')
    .then(function (res) { return res.json(); })
    .then(function (c) {
      config = c; // Assign to global for now
    })
    .then(createClient)
    .then(subscribeToTopics)
    .then(connectUi)
    .catch(console.error.bind(console));
}

function createClient() {
  console.log('Create client with config', config);
  return new Promise(function (resolve, reject) {
    client = new Paho.MQTT.Client(
        config.broker.hostname, config.broker.wsPort, 'ws' + Math.random()
      ),
    auth = config.broker.auth ? config.broker.auth.split(':') : [],
    user = auth[0],
    pass = auth[1],
    opts = {
      useSSL: true,
      onSuccess: resolve.bind(null, client)
    };

    if (user && pass) {
      opts.userName = user;
      opts.password = pass;
    }

    client.connect(opts);
  });
}

function subscribeToTopics(client) {
  var subscriptionTopic = topicForParams({
        device: config.id,
        action: 'event',
        type: '#'
      });
  console.log('Subscribe to: ', subscriptionTopic);
  client.subscribe(subscriptionTopic);
  return client;
}

function connectUi(client) {
  console.log('connectUi');
  var on = document.querySelector('#on'),
      off = document.querySelector('#off'),
      button = document.querySelector('#button');

  on.addEventListener('click', function () {
    turnOn();
    on.blur();
  });

  off.addEventListener('click', function () {
    turnOff();
    off.blur();
  });

  client.onMessageArrived = function (message) {
    var topic = message.destinationName,
        json  = JSON.parse(message.payloadString);

    if (json.type === 'button' && json.data && json.data.state) {
      button.innerHTML = json.data.state;
    }
  };
}

function turnOn() {
  msg(true);
}

function turnOff() {
  msg(false);
}

function msg(state) {
  var payload = JSON.stringify({ type: 'led', id: "0", data: { on: state } })
  var message = new Paho.MQTT.Message(payload);
  message.destinationName = topicForParams({
    device: config.id,
    action: 'command',
    type: 'led'
  });
  client.send(message);
}

function topicForParams(p) {
  return [ 'ciot/kit0', p.device, p.action, p.type ].join('/')
}
