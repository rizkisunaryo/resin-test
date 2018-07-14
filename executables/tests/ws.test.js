'use strict';

const {PATH_DRONE} = require('../../constants/Path');
const {Done} = require('../../utils/TestUtil');

const jwt = require('jsonwebtoken');
const openSocket = require('socket.io-client');

const wsUri = 'http://localhost:3010';
const token = jwt.sign({id: 'myId'}, process.env.RESIN_TOKEN_KEY);

describe('./executables/ws.js', () => {
  it('should be connected', done => {
    let myDone = new Done(done);
    const socket = openSocket(wsUri, {
      path: PATH_DRONE,
      query: {token},
    });

    setTimeout(() => socket.emit('myPing'), 500);
    socket.on('myPong', () => {
      myDone.trigger();
      socket.disconnect();
    });

    socket.on('disconnect', () => myDone.trigger(new Error('disconnected')));
  });

  it('should be disconnected due to invalid token', done => {
    let myDone = new Done(done);
    const socket = openSocket('http://localhost:3010', {
      path: PATH_DRONE,
      query: {token: token + 'wrongAdditional'},
    });

    setTimeout(() => socket.emit('myPing'), 500);
    socket.on('myPong', () => {
      myDone.trigger(new Error('still connected'));
      socket.disconnect();
    });

    socket.on('disconnect', () => myDone.trigger());
  });
});
