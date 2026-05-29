// ════════════════════════════════════════════════════════
//  도둑잡기 — Express + Socket.IO 서버
// ════════════════════════════════════════════════════════

const path       = require('path');
// 팀 루트(.env)에서 포트 설정 로드 — 폴더별 포트 분리
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const {
  makeRoomCode,
  initGame,
  discardPair,
  finishDiscard,
  checkHasPair,
  submitRps,
  pickCard,
  advanceTurn,
  endGame,
  getStateForPlayer,
  AVATARS,
  COLORS,
} = require('./gameLogic');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// ── React 빌드 정적 파일 서빙 ─────────────────────────────
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// API 헬스체크
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// React SPA — 모든 나머지 경로는 index.html로
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const rooms = {};

// ── 유틸 ─────────────────────────────────────────────────
function getRoomBySocket(socketId) {
  return Object.values(rooms).find(r =>
    r.players.some(p => p.socketId === socketId)
  );
}

function broadcastLobby(room) {
  io.to(room.code).emit('LOBBY_STATE', {
    code: room.code,
    maxPlayers: room.maxPlayers,
    players: room.players.map(p => ({
      id: p.id, name: p.name, avatar: p.avatar, color: p.color,
    })),
  });
}

function broadcastGame(room) {
  room.players.forEach(p => {
    const state = getStateForPlayer(room.game, p.id);
    io.to(p.socketId).emit('GAME_STATE', state);
  });
}

function endRoom(room) {
  room.phase = 'ended';
  broadcastGame(room);
  io.to(room.code).emit('GAME_ENDED');
}

// ── Socket.IO ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[연결] ${socket.id}`);

  // ── 방 만들기 ──────────────────────────────────────────
  socket.on('CREATE_ROOM', ({ name, maxPlayers }) => {
    const code = makeRoomCode();
    rooms[code] = {
      code,
      maxPlayers: Math.min(Math.max(maxPlayers || 3, 3), 5),
      players: [{
        socketId: socket.id, id: 0,
        name: name || '방장', avatar: AVATARS[0], color: COLORS[0],
      }],
      game: null,
      phase: 'lobby',
      timers: [],
    };
    socket.join(code);
    socket.emit('ROOM_CREATED', { code, playerId: 0 });
    broadcastLobby(rooms[code]);
    console.log(`[방 생성] ${code} by ${name}`);
  });

  // ── 방 참가 ────────────────────────────────────────────
  socket.on('JOIN_ROOM', ({ name, code }) => {
    const room = rooms[code?.toUpperCase()];
    if (!room)                          return socket.emit('JOIN_ERROR', { message: '방을 찾을 수 없습니다.' });
    if (room.phase !== 'lobby')         return socket.emit('JOIN_ERROR', { message: '이미 게임이 시작된 방입니다.' });
    if (room.players.length >= room.maxPlayers) return socket.emit('JOIN_ERROR', { message: '방이 가득 찼습니다.' });

    const newId = room.players.length;
    room.players.push({
      socketId: socket.id, id: newId,
      name: name || `플레이어 ${newId + 1}`,
      avatar: AVATARS[newId], color: COLORS[newId],
    });
    socket.join(code.toUpperCase());
    socket.emit('ROOM_JOINED', { code: room.code, playerId: newId });
    broadcastLobby(room);
    console.log(`[참가] ${name} → 방 ${room.code}`);
  });

  // ── 게임 시작 (방장만) ─────────────────────────────────
  socket.on('START_GAME', () => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;
    if (room.players[0].socketId !== socket.id) return socket.emit('ERROR', { message: '방장만 시작할 수 있습니다.' });
    if (room.players.length < 3) return socket.emit('ERROR', { message: '최소 3명이 필요합니다.' });

    room.game  = initGame(room.players);
    room.phase = 'playing';
    io.to(room.code).emit('GAME_START');
    broadcastGame(room);
    console.log(`[게임 시작] 방 ${room.code}, ${room.players.length}명`);
  });

  // ── 버리기: 짝 카드 두 장 선택 ────────────────────────
  socket.on('DISCARD_PAIR', ({ idx1, idx2 }) => {
    const room = getRoomBySocket(socket.id);
    if (!room || room.phase !== 'playing') return;
    if (room.game.phase !== 'discard') return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    const { game: newGame, ok, msg } = discardPair(room.game, player.id, idx1, idx2);
    if (!ok) {
      socket.emit('DISCARD_ERROR', { message: msg });
      return;
    }
    room.game = newGame;
    broadcastGame(room);

    if (room.game.phase === 'rps') {
      io.to(room.code).emit('PHASE_CHANGE', { phase: 'rps' });
    }
  });

  // ── 버리기 완료 (더 버릴 짝 없음) ─────────────────────
  socket.on('FINISH_DISCARD', () => {
    const room = getRoomBySocket(socket.id);
    if (!room || room.phase !== 'playing') return;
    if (room.game.phase !== 'discard') return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    // 아직 버릴 짝이 있으면 거부
    const myGamePlayer = room.game.players.find(p => p.id === player.id);
    if (myGamePlayer && checkHasPair(myGamePlayer.hand)) {
      socket.emit('DISCARD_ERROR', { message: '아직 버릴 수 있는 짝이 있습니다!' });
      return;
    }

    const { game: newGame, ok } = finishDiscard(room.game, player.id);
    if (!ok) return;
    room.game = newGame;
    broadcastGame(room);

    if (room.game.phase === 'rps') {
      io.to(room.code).emit('PHASE_CHANGE', { phase: 'rps' });
    }
  });

  // ── 가위바위보 선택 ────────────────────────────────────
  socket.on('RPS_CHOICE', ({ choice }) => {
    const room = getRoomBySocket(socket.id);
    if (!room || room.phase !== 'playing') return;
    if (room.game.phase !== 'rps') return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    // rpsEliminated(이미 순서 확정된 플레이어)는 선택 불가
    const gp = room.game.players.find(p => p.id === player.id);
    if (gp && gp.rpsEliminated) return;
    if (gp && gp.rpsChoice) return; // 이미 선택함

    const { game: newGame, ok, done } = submitRps(room.game, player.id, choice);
    if (!ok) return;
    room.game = newGame;
    broadcastGame(room);

    if (done) {
      // 플레이 단계로 전환
      io.to(room.code).emit('PHASE_CHANGE', { phase: 'play' });
    }
  });

  // ── 카드 뽑기 ──────────────────────────────────────────
  socket.on('PICK_CARD', ({ cardIndex }) => {
    const room = getRoomBySocket(socket.id);
    if (!room || room.phase !== 'playing') return;
    if (room.game.phase !== 'play') return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;
    if (room.game.currentTurn !== player.id) return socket.emit('ERROR', { message: '지금은 당신의 차례가 아닙니다.' });
    if (room.game.waitingConfirm) return;

    const { game: newGame, event } = pickCard(room.game, cardIndex);
    if (!event) return;

    room.game = newGame;
    broadcastGame(room);

    const timer = setTimeout(() => {
      const { game: advanced, ended } = advanceTurn(room.game);
      room.game = advanced;
      if (ended) {
        endRoom(room);
        console.log(`[게임 종료] 방 ${room.code}`);
      } else {
        broadcastGame(room);
      }
    }, 1400);
    room.timers.push(timer);
  });

  // ── 연결 해제 ──────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[해제] ${socket.id}`);
    const room = getRoomBySocket(socket.id);
    if (!room) return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    if (room.phase === 'lobby') {
      if (player.id === 0) {
        room.timers.forEach(clearTimeout);
        io.to(room.code).emit('ROOM_CLOSED', { message: '방장이 나갔습니다.' });
        delete rooms[room.code];
      } else {
        room.players = room.players.filter(p => p.socketId !== socket.id);
        room.players.forEach((p, i) => { p.id = i; p.avatar = AVATARS[i]; p.color = COLORS[i]; });
        broadcastLobby(room);
      }
    } else if (room.phase === 'playing') {
      io.to(room.code).emit('PLAYER_DISCONNECTED', { message: `${player.name}이(가) 게임을 나갔습니다.` });
      room.timers.forEach(clearTimeout);
      delete rooms[room.code];
    }
  });
});

const PORT = process.env.SERVER_PORT || process.env.PORT || 4006;
server.listen(PORT, () => console.log(`\n🃏 도둑잡기 서버: http://localhost:${PORT}\n`));
