const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
const port = 3001;
const devices = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post("/logger", (req, res) => {
  const log = req.body;
  const { type, device } = req.query;
  io.emit("log",log);
  io.to(device).emit(type, log);
  res.send("ok");
})

app.post("/network", (req, res) => {
  const { device } = req.query;
  if (!devices.includes(device)) {
    devices.push(device);
    io.emit("device", device);
  }
  const networkData = req.body;
  io.to(device).emit("network", networkData);
  res.send("ok");
})

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on("join", (channel) => {
    socket.join(channel);
  });
  socket.on("log", (msg) => {
   console.log(msg);
  })

});

server.listen(port, () => {
  console.log('listening on *:3001');
});
