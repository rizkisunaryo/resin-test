'use strict';

const {verifyToken} = require('../utils/Token');
const {PATH_DRONE} = require('../constants/Path');

const server = require('http').createServer();

const droneIo = require('socket.io')(server, {path: PATH_DRONE});
droneIo.on('connection', socket => {
  const drone = verifyToken(socket.handshake.query.token);
  if (!drone || !drone.id) {
    socket.disconnect(true);
    return;
  }
  console.log('a drone connected: ', drone.id);

  socket.on('myPing', msg => {
    console.log(msg);
    socket.emit('myPong', 'from ws: ' + msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3010);
