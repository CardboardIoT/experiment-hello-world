var mqtt = require('mqtt'),
    fs = require('fs'),
    url = require('url'),
    config = require('config');

module.exports.connect = function () {
  var caCert,
      mqttBroker = url.format( config.get('broker') ),
      instance;

  if (config.get('broker.caFile')) {
    caCert = fs.readFileSync('./certs/' + config.get('broker.caFile'));
  }

  console.log('Connecting to: ', mqttBroker);

  instance = mqtt.connect(mqttBroker, { ca: caCert });

  return instance;
}
