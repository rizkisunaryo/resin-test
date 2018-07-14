'use strict';

const {DRONE_NOT_MOVING_TIMEOUT_SECOND} = require('../../constants/Drone');
const {PATH_DASHBOARD, PATH_DRONE} = require('../../constants/Path');
const {DoneAll, DoneOnce} = require('../../utils/TestUtil');

const assert = require('assert');
const jwt = require('jsonwebtoken');
const openSocket = require('socket.io-client');

const wsUri = 'http://localhost:3010';
const generateToken = id => jwt.sign({id}, process.env.RESIN_TOKEN_KEY);

describe('./executables/ws.js', () => {
  it('should be connected', done => {
    const myDone = new DoneOnce(done);
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

  it(`if the dashboard is opened after drones sent the coordinates,
    then dashboard should still receive
    all drones current coordinates`, () => {

    setTimeout(() => {
      // just create dashboard socket
      // because we are using drone sockets from tests above
      const dashboardSocket = openSocket(wsUri, {path: PATH_DASHBOARD});
      dashboardSocket.on('all-drone-coordinates', dronesObj => {
        assert.deepStrictEqual(dronesObj.drone3.lat, 0.001);
        assert.deepStrictEqual(dronesObj.drone3.long, 0.002);
        assert.deepStrictEqual(dronesObj.drone4.lat, 0.001);
        assert.deepStrictEqual(dronesObj.drone4.long, 0.002);
        assert.deepStrictEqual(dronesObj.drone5.lat, 0.003);
        assert.deepStrictEqual(dronesObj.drone5.long, 0.004);

        dashboardSocket.disconnect();
      });
    }, 500);
  });

  it('should detect not moving drone', done => {
    const doneOnce = new DoneOnce(done);
    const dashboardSocket = openSocket(wsUri, {path: PATH_DASHBOARD});
    dashboardSocket.on('not-moving-drones', droneIds => {
      if (['drone3', 'drone4', 'drone5']
        .some(droneId => droneIds.indexOf(droneId) > -1)) {
        doneOnce.trigger();
        dashboardSocket.disconnect();
      }
    });
  }).timeout((DRONE_NOT_MOVING_TIMEOUT_SECOND + 3) * 1000);

  it(`if dashboard connects,
    it should receive all not moving drones data`, done => {
    const doneOnce = new DoneOnce(done);
    setTimeout(() => {
      const dashboardSocket = openSocket(wsUri, {path: PATH_DASHBOARD});
      dashboardSocket.on('not-moving-drones', droneIds => {
        if (['drone3', 'drone4', 'drone5']
          .some(droneId => droneIds.indexOf(droneId) > -1)) {
          doneOnce.trigger();
          dashboardSocket.disconnect();
        }
      });
    }, (DRONE_NOT_MOVING_TIMEOUT_SECOND + 3) * 1000);
  }).timeout((DRONE_NOT_MOVING_TIMEOUT_SECOND + 4) * 1000);

});
