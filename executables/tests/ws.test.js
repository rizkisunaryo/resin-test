'use strict';

const {PATH_DASHBOARD, PATH_DRONE} = require('../../constants/Path');
const {DoneAll, DoneOnce} = require('../../utils/TestUtil');

const jwt = require('jsonwebtoken');
const openSocket = require('socket.io-client');

const wsUri = 'http://localhost:3010';
const generateToken = id => jwt.sign({id}, process.env.RESIN_TOKEN_KEY);

describe('./executables/ws.js', () => {
  it('should be connected', done => {
    let myDone = new DoneOnce(done);
    const socket = openSocket(wsUri, {
      path: PATH_DRONE,
      query: {token: generateToken('drone1')},
    });

    setTimeout(() => socket.emit('myPing'), 500);
    socket.on('myPong', () => {
      myDone.trigger();
      socket.disconnect();
    });

    socket.on('disconnect', () => myDone.trigger(new Error('disconnected')));
  });

  it('should be disconnected due to invalid token', done => {
    const myDone = new DoneOnce(done);
    const socket = openSocket(wsUri, {
      path: PATH_DRONE,
      query: {token: generateToken('drone2') + 'wrongAdditional'},
    });

    setTimeout(() => socket.emit('myPing'), 500);
    socket.on('myPong', () => {
      myDone.trigger(new Error('still connected'));
      socket.disconnect();
    });

    socket.on('disconnect', () => myDone.trigger());
  });

  it('should send the data to dashboard', done => {
    const dashboardSocket = openSocket(wsUri, {path: PATH_DASHBOARD});

    const drone3Socket = openSocket(wsUri, {
      path: PATH_DRONE,
      query: {token: generateToken('drone3')},
    });

    drone3Socket.emit('drone-coordinate', 0.001, 0.002);

    dashboardSocket.on('dashboard-coordinate', (droneId, lat, long) => {
      if (droneId === 'drone3' && lat === 0.001 && long === 0.002) {
        done();
        drone3Socket.disconnect();
        dashboardSocket.disconnect();
      }
    });
  });

  it(`drones send the data to backend,
    and the dashboard should receive the data correctly`, done => {
    const dashboardSocket = openSocket(wsUri, {path: PATH_DASHBOARD});

    const drone4Socket = openSocket(wsUri, {
      path: PATH_DRONE,
      query: {token: generateToken('drone4')},
    });
    const drone5Socket = openSocket(wsUri, {
      path: PATH_DRONE,
      query: {token: generateToken('drone5')},
    });

    drone4Socket.emit('drone-coordinate', 0.001, 0.002);
    setTimeout(() =>
      drone5Socket.emit('drone-coordinate', 0.003, 0.004), 500);

    const doneAll = new DoneAll(done, 2);
    dashboardSocket.on('dashboard-coordinate', (droneId, lat, long) => {
      if (droneId === 'drone4' && lat === 0.001 && long === 0.002
        || droneId === 'drone5' && lat === 0.003 && long === 0.004) {
        doneAll.trigger();
      }

      if (doneAll.isDone()) {
        drone4Socket.disconnect();
        drone5Socket.disconnect();
        dashboardSocket.disconnect();
      }
    });
  });

});
