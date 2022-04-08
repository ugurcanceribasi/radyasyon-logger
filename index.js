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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post("/logger", (req, res) => {
  const logs = req.body;
  io.emit("log", logs);
  res.end("ok");
})

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
