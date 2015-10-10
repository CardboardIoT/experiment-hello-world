Device
==

Converts MQTT messages to electronics actions on a Raspberry Pi.

## Requirements

- node.js v0.12.x (newer v4 versions won't work)

## Install

This depends on some Raspberry Pi-specifc libraries.

1. Clone this repository
2. cd <repo-dir>
3. `npm install`

## Run

    npm start

Connects to an MQTT broker (test.mosquitto.org) and subscribes to the `ciot/test` topic. Tries to action any messages it gets.

## Does it work?

Use the `bin/led` utility to turn an LED on Pin 7 on/off.

    bin/led --id 0 on
    bin/led --id 0 off

## Supported messages

All messages must have an `id` string which indicated which component to target.

|| Type || Data                    ||
|  led  |  { "on": <true|false> }   |

## Run on startup

If using Raspbian Jessie (the latest version):

    sudo mv ciot-device.service /etc/systemd/system/ciot-device.service 
