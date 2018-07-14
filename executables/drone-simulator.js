'use strict';

const {PATH_DRONE} = require('../constants/Path');

const jwt = require('jsonwebtoken');
const openSocket = require('socket.io-client');
const socket = openSocket('http://localhost:3010',
  {
    path: PATH_DRONE,
    query: {token: jwt.sign({id: 'myId'}, process.env.RESIN_TOKEN_KEY)},
  }
);
socket.on('connect', () => console.log('connected'));

socket.emit('myPing', 'sample message');
socket.on('connect_error', error => console.log(error));
socket.on('error', error => console.log(error));
socket.on('disconnect', () => console.log('disconnected'));
