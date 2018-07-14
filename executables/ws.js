'use strict';

const {verifyToken} = require('../utils/Token');
const {PATH_DASHBOARD, PATH_DRONE} = require('../constants/Path');

const server = require('http').createServer();

const droneIo = require('socket.io')(server, {path: PATH_DRONE});
const dashboardIo = require('socket.io')(server, {path: PATH_DASHBOARD});

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
    dashboardIo.emit('dashboard-coordinate', drone.id, lat, long);
  });
});

server.listen(3010);
