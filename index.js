const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const {
  createRoom,
  getRoom,
  addPlayer,
  processGuess,
  checkRoom,
  setRoomFull,
  getCurrent
} = require("./game");

const router = require("./router");

const PORT = 8000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

io.on("connection", client => {
  client.on("createRoom", (_, callback) => {
    const room = createRoom(client.id);
    callback(room);
  });

  client.on("checkRoom", (roomId, callback) => {
    const error = checkRoom(roomId);
    callback(error);
  });

  client.on("join", ({ number, roomId }, callback) => {
    client.join(roomId);
    const room = getRoom(roomId);
    const error = addPlayer(room, client.id, number);

    if (error) {
      callback(error);
    } else if (room.players.length === 2) {
      setRoomFull(room);
      const currentPlayer = getCurrent(room);
      io.to(roomId).emit("ready", { current: currentPlayer.id });
    }
  });

  client.on("sendGuess", ({ roomId, id, guess }, callback) => {
    const { cows, bulls } = processGuess(roomId, id, guess);
    io.to(roomId).emit("guessResult", { cows, bulls, guess, id });
    callback();
    if (bulls === 4) {
      io.to(roomId).emit("gameover");
    } else {
      client.broadcast.to(roomId).emit("changeTurn", {});
    }
  });

  client.on("sendData", ({ number, guessList, roomId }, callback) => {
    console.log("Receive final data");
    console.log(number, guessList);
    client.broadcast.to(roomId).emit("opponentData", { number, guessList });
    callback();
  });

  client.on("disconnect", () => {
    console.log("disconnect received");
    console.log("client left");
  });
});

server.listen(process.env.PORT || PORT, () =>
  console.log(`Server has started.`)
);
