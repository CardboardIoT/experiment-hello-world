# Install

Quick instructions on setting up a Pi with Jessie and node.js.

These instructions assume a Raspberry Pi 2 Model B.

## Flash an SD card with Jessie

Follow the instructions here:


## Passwordless login

1. ssh into Pi
2. mkdir .ssh
3. exit
4. scp ~/.ssh/path-to-my-key.pub pi@<ip>:~/.ssh/authorized_keys
5. ssh into pi (without password this time)


## Expand filesystem
1. sudo raspi-config
2. Expand Filesystem
3. Finish
4. Reboot

## Disable GUI login
1. sudo raspi-config
2. Select boot options
3. Choose Console, auto-login
4. Reboot

Alternatively, could also just do:
 ln -sf /usr/lib/systemd/system/graphical.target /etc/systemd/system/default.target

## Install older node.js

v4.x doesn't work with loads of nodejs native modules, meaning modules that interface with Pi hardware.

1. wget http://node-arm.herokuapp.com/node_archive_armhf.deb
2. sudo dpkg -i node_archive_armhf.deb
3. node -v
	> v0.12.6

## Setup i2c

1. sudo raspi-config
2. Advanced Options
3. I2C
4. Yes to enable
5. Yes to load by default
6. Ok, Finish
7. Reboot

Helpful tools for debugging i2c:

8. sudo apt-get install -y python-smbus i2c-tools
9. sudo reboot
10. Check `lsmod | grep i2c_` for `i2c_dev` ?
