const rooms = [];

const generateRoom = socketId => {
  return socketId
    .match(/.{4}/g)
    .map(group =>
      group.split("").reduce((accum, char) => accum + char.charCodeAt(0), 0)
    )
    .map(n => String.fromCharCode((n % 25) + 65))
    .join("");
};

const createRoom = socketId => {
  const roomId = generateRoom(socketId);
  const room = {
    id: roomId,
    players: [],
    status: "open"
  };
  rooms.push(room);
  return room;
};

const getRoomIndex = roomId => {
  return rooms.findIndex(room => room.id === roomId);
};

const getRoom = roomId => {
  return rooms.find(room => room.id === roomId);
};

const checkRoom = roomId => {
  const room = getRoom(roomId);

  if (!room) {
    return { error: "Room doesn't exists" };
  } else if (room.status === "full") {
    return { error: "Room is full" };
  }
};

const addPlayer = (room, id, number) => {
  const players = room.players.length;

  switch (players) {
    case 0:
      room.players.push({ id, number, current: true });
      break;
    case 1:
      room.players.push({ id, number, current: false });
      break;
    default:
      return { error: "Room full" };
  }
};

const getRooms = () => {
  return rooms;
};

const setRoomFull = room => {
  room.status = "full";
};

const getCurrent = room => {
  return room.players.find(player => player.current);
};

const getOppnentNumber = (room, id) => {
  const { number } = room.players.find(player => player.id !== id);
  return number;
};

const processGuess = (roomId, id, guess) => {
  const room = getRoom(roomId);
  const number = getOppnentNumber(room, id);
  console.log("my guess", guess);
  console.log("opponent", number);
  let cows = 0;
  let bulls = 0;
  guess.split("").forEach((char, index) => {
    if (char === number.split("")[index]) {
      bulls += 1;
    } else if (number.split("").includes(char)) {
      cows += 1;
    }
  });
  return { cows, bulls };
};

module.exports = {
  generateRoom,
  createRoom,
  getRoom,
  addPlayer,
  getRooms,
  processGuess,
  checkRoom,
  setRoomFull,
  getRoomIndex,
  getCurrent
};
