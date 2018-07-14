'use strict';

const {verifyToken} = require('../utils/Token');
const {DRONE_NOT_MOVING_TIMEOUT_SECOND} = require('../constants/Drone');
const {PATH_DASHBOARD, PATH_DRONE} = require('../constants/Path');

const lodashGet = require('lodash').get;
const server = require('http').createServer();

const droneIo = require('socket.io')(server, {path: PATH_DRONE});
const dashboardIo = require('socket.io')(server, {path: PATH_DASHBOARD});


var dronesObj = {};
// prevLat and prevLong is to calculate the drone speed
const getPrevLat = id => lodashGet(dronesObj, `['${id}'].lat`, undefined);
const getPrevLong = id => lodashGet(dronesObj, `['${id}'].long`, undefined);
const setDrone = (id, lat, long) => {
  const prevLat = getPrevLat(id);
  const prevLong = getPrevLong(id);

  // if previous position of the drone is differenct than current position,
  // then reset notMovingTimeout
  let notMovingTimeout = lodashGet(dronesObj, `['${id}'].notMovingTimeout`, 0);
  if (lat !== prevLat && long !== prevLat) {
    notMovingTimeout = 0;
  }

  dronesObj[id] = {
    lat,
    long,
    prevLat,
    prevLong,
    notMovingTimeout,
  };
};

// variable to hold the drone IDs that timeout
var notMovingDroneIds = [];

droneIo.on('connection', socket => {
  // verfy the token of the drone
  const drone = verifyToken(socket.handshake.query.token);
  if (!drone || !drone.id) {
    // if token is invalid, or no drone id, then disconnect
    socket.disconnect(true);
    return;
  }
  console.log('a drone connected: ', drone.id);

  // for testing purpose
  socket.on('myPing', msg => {
    console.log(msg);
    socket.emit('myPong', 'from ws: ' + msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected: ', drone.id);
  });

  // if drone sends the coordinate,
  // then send it to the dashboard along with drone id
  socket.on('drone-coordinate', (lat, long) => {
    dashboardIo.emit(
      'dashboard-coordinate',
      drone.id,
      lat,
      long,
      getPrevLat(drone.id),
      getPrevLong(drone.id)
    );
    setDrone(drone.id, lat, long);
  });
});

dashboardIo.on('connection', socket => {
  // when new dashboard open,
  // send all drones current data
  socket.emit('all-drone-coordinates', dronesObj);

  // and if there are some drones that timeout
  // then send the data to dashboard
  if (notMovingDroneIds.length > 0) {
    socket.emit('not-moving-drones', notMovingDroneIds);
  }
});

// a timeout, to increase drone notMovingTimeout
function increaseDroneTimeout() {
  const timeoutInterval = 2500;

  setTimeout(() => {
    notMovingDroneIds = [];
    for (let droneId in dronesObj) {
      dronesObj[droneId].notMovingTimeout += timeoutInterval;
      // if drone notMovingTimeout is more than 10 seconds,
      // then push the drone id to notMovingDroneIds
      if (dronesObj[droneId].notMovingTimeout >
        DRONE_NOT_MOVING_TIMEOUT_SECOND) {
        notMovingDroneIds.push(droneId);
      }
    }

    // if there are some drones that timeout
    // then send the data to dashboard
    if (notMovingDroneIds.length > 0) {
      dashboardIo.emit('not-moving-drones', notMovingDroneIds);
    }

    increaseDroneTimeout();
  }, timeoutInterval);
}
increaseDroneTimeout();

server.listen(3010);
