var socket_io = require("socket.io");
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on("connection", function (socket) {
  console.log("A user connected");
  socket.emit("hello", "test");
});

// io.sockets.emit("hello", "test");

module.exports = socketApi;
