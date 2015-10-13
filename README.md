Device
==

Converts MQTT messages to electronics actions on a Raspberry Pi.

## Requirements

- Tested on node.js v0.12.7 (newer v4.x versions won't work)

## Install

This depends on some Raspberry Pi-specifc libraries.

1. Clone/copy this repository onto the Pi
2. cd <repo-dir>
3. `npm install`
4. `cp config/local.json.example config/local.json`
5. Give your device a name by changing `id` in `config/local.json`

## Run

    npm start

Connects to an MQTT broker (defined in config/default.json) and subscribes to the `ciot/test` topic. Tries to action any messages it gets.

## Wire it up

You need a button and an LED. Wire up as follows (Frizting diagram to follow).

Use the [Raspberry Pinout guide](http://pi.gadgetoid.com/pinout/wiringpi) to figure out which pins.

|| Wiring Pi Pin || Component    ||
|  Ground         | Button & LED short leg / flat side  |
|  0              | LED long led / non-flat side |
|  3              | Button        |

## Does it work?

Every device has an `id` in `config/local.json`.

Use the `bin/led` utility to turn an LED on/off.

    bin/led --device anne --id 0 on
    bin/led --device anne --id 0 off

## Web UI

There's a very basic web UI that will:
- turn the LED on/off
- see the current state of the button

To run the UI:

   npm run static

Visit http://localhost:3000/ in your browser to see the UI. The UI can be hosted anywhere. It uses the WebSocket bridge functionality of recent MQTT servers to communicate.

## Supported messages

All messages must have an `id` string which indicated which component to target. Currently this is always '0'.

|| Type || Data                    ||
|  led  |  { "on": <true|false> }   |

## Run on startup

If using Raspbian Jessie (the latest version):

    sudo mv hello-world.service /etc/systemd/system/hello-world.service

Restart your Pi and the service should auto-run.
