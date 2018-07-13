'use strict';

const server = require('http').createServer();

const io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('myPing', msg => console.log(msg));
});

server.listen(3010);
