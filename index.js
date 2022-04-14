const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const io = new Server(server, { cors: { origin: "*", credentials: true } });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
const port = 3002;
let devices = [];
const clients = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

instrument(io, {
  auth: false
});

io.on('connection', (socket) => {
  const { type } = socket.handshake.query;
  const device = {...socket.handshake.query, id: socket.id };
  switch (type) {
    case "client":
        //console.log("Bir cihaz bağlandı - Client");
        socket.join("clients");
      break;
    case "app":
      const { model, brand, userAgent, date } = socket.handshake.query;
      socket.join("devices");
      //console.log("Bir cihaz bağlandı - Smart TV APP")
      //console.log("Marka : "+brand);
      //console.log("Model : "+model);
      //console.log("userAgent : "+userAgent);
      devices.push({ ...device, id: socket.id });
      io.to("clients").emit("devices", devices);
      break
  }
  socket.on("identify", (msg) => {
    //console.log("tetiklendi!");
    //console.log(devices);
    //console.log(socket.id);
    io.emit("identify", devices.map((device) => device.id));
  });
  socket.on("log", (msg) => {
    io.to(socket.id).emit("log", msg);
    console.log("socket id : "+socket.id);
  });
  socket.on("network", (payload) => {
    io.to(socket.id).emit("network", payload);
  });
  socket.on("key", (payload) => {
    const { key, socketId } = payload;
    console.log(key);
    io.to(socketId).emit("key", key);
  })
  socket.on("socket", (socketId) => {
    let rooms = io.sockets.adapter.sids[socket.id];
    if (rooms) {
      rooms.map((room) => {
        socket.leave(room);
      });
    }
    socket.join("clients");
    socket.join(socketId);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
    let index = devices.findIndex((device) => device.id === socket.id);
    if (index) {
      devices = devices.splice(index, 1);
      io.to("clients").emit("devices", devices);
    }
  });

});

server.listen(port, () => {
  console.log('listening on *:'+port);
});
