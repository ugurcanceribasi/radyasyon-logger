const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const io = new Server(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
const port = 3001;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post("/logger", (req, res) => {
  const log = req.body;
  const { type } = req.query;
  io.emit(type, log);
  res.send("ok");
})

app.post("/network", (req, res) => {
  const networkData = req.body;
  io.emit("network", networkData);
  res.send("ok");
})

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(port, () => {
  console.log('listening on *:3001');
});
