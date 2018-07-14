'use strict';

const droneNumber = process.env.DRONE_NUMBER ?
  Number(process.env.DRONE_NUMBER) : 10;
if (droneNumber > 20) {
  console.error('please do not set drones more than 20!');
  process.exit();
}

const {PATH_DRONE} = require('../constants/Path');

const jwt = require('jsonwebtoken');
const openSocket = require('socket.io-client');

let socket = [];
for (let i = 0; i < droneNumber; i++) {
  socket.push(openSocket('http://localhost:3010',
    {
      path: PATH_DRONE,
      query: {token: jwt.sign({id: `drone${i}`}, process.env.RESIN_TOKEN_KEY)},
    }
  ));
}

let dronePos = [];

const getNextPos = (i, latOrLong) => {
  return dronePos[i] && dronePos[i][latOrLong] ?
    dronePos[i][latOrLong] + (Math.floor(Math.random() * 20) - 10) / 3000 :
    0.0001;
};

const move = i => {
  dronePos[i] = {
    lat: getNextPos(i, 'lat'),
    long: getNextPos(i, 'long'),
  };
  socket[i].emit('drone-coordinate', dronePos[i].lat, dronePos[i].long);

  setTimeout(() => {
    move(i);
  }, 1000);
};

for (let i = 0; i < droneNumber; i++) {
  move(i);
}
