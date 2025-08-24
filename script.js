// ✅ 1. Firebase Setup
const firebaseConfig = {
  apiKey: "AIzaSyDjs3RT__GZC3KRj_qcRM2vxSlCFa69p9E",
  authDomain: "tictactoe-d049b.firebaseapp.com",
  projectId: "tictactoe-d049b",
  storageBucket: "tictactoe-d049b.firebasestorage.app",
  messagingSenderId: "580620501784",
  appId: "1:580620501784:web:cb0ba4b49e6e7bda5b946d",
  measurementId: "G-63LBEJLE3F"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ 2. Global State
let roomId = null;
let mySymbol = null;
let myName = null;

// ✅ 3. Create Room
async function createRoom() {
  roomId = document.getElementById("roomCode").value || Math.random().toString(36).substring(2, 8);
  myName = document.getElementById("playerName").value || "Player X";
  console.log(myName);
  mySymbol = "X";
  await db.collection("rooms").doc(roomId).set({
    board: Array(9).fill(""),
    turn: "X",
    players: {
      X: myName,
      O: null
    },
    winner: null
  });
  startGame();
}

// ✅ 4. Join Room
async function joinRoom() {
  roomId = document.getElementById("roomCode").value;
  myName = document.getElementById("playerName").value || "Player O";
  if (!roomId) return alert("Enter a room code!");
  const roomRef = db.collection("rooms").doc(roomId);
  const doc = await roomRef.get();
  if (!doc.exists) return alert("Room not found!");
  
  mySymbol = "O";
  await roomRef.update({
    "players.O": myName
  });
  startGame();
}

// ✅ Restart Game
async function restartGame() {
  const roomRef = db.collection("rooms").doc(roomId);
  await roomRef.update({
    board: Array(9).fill(""),
    turn: "X",
    winner: null
  });
  document.getElementById("restartBtn").classList.add("hidden");
}

// ✅ 5. Game Setup
function startGame() {
  document.getElementById("room-section").classList.add("hidden");
  document.getElementById("game-board").classList.remove("hidden");

  db.collection("rooms").doc(roomId).onSnapshot(doc => {
    if (!doc.exists) return;
    const data = doc.data();
    renderBoard(data.board);
    updateStatus(data.turn, data.winner, data.players);
  });

  document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("click", () => makeMove(cell.dataset.index));
  });
}

// ✅ Update Status
function updateStatus(turn, winner, players) {
  const status = document.getElementById("status");
  if (winner) {
    status.textContent = winner === "Draw" ? "It's a Draw!" : `${players[winner]} (${winner}) Wins!`;
    document.getElementById("restartBtn").classList.remove("hidden");
  } else {
    status.textContent = `Turn: ${players[turn] || turn} (${turn})`;
  }
}


 

// ✅ 6. Make Move
async function makeMove(index) {
  const roomRef = db.collection("rooms").doc(roomId);
  const doc = await roomRef.get();
  if (!doc.exists) return;

  const data = doc.data();
  if (data.winner) return;
  if (data.turn !== mySymbol) return;
  if (data.board[index] !== "") return;

  let newBoard = [...data.board];
  newBoard[index] = mySymbol;
  const winner = checkWinner(newBoard);

  await roomRef.update({
    board: newBoard,
    turn: mySymbol === "X" ? "O" : "X",
    winner: winner
  });
}

// ✅ 7. Render Board
function renderBoard(board) {
  document.querySelectorAll(".cell").forEach((cell, i) => {
    cell.textContent = board[i];
  });
}

// ✅ 9. Winner Check
function checkWinner(board) {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b,c] of combos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.includes("") ? null : "Draw";
}



