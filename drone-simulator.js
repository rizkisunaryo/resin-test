'use strict';

var openSocket = require('socket.io-client');
var socket = openSocket('http://localhost:3010');
socket.emit('myPing', 'sample message');
socket.on('connect_error', error => console.log(error));
socket.on('error', error => console.log(error));
