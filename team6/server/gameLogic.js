// ════════════════════════════════════════════════════════
//  도둑잡기 — 게임 로직 (서버 전용)
//  phase: 'discard' → 'rps' → 'play' → 'end'
// ════════════════════════════════════════════════════════

const SUITS      = ['♠', '♥', '♦', '♣'];
const RANKS      = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUIT_COLOR = { '♠':'black','♣':'black','♥':'red','♦':'red' };
const AVATARS    = ['🧑','👩','🧒','👴','🧔'];
const COLORS     = ['#f7971e','#4ecdc4','#a29bfe','#fd79a8','#55efc4'];

const RPS_CHOICES = ['✊','✌️','🖐️']; // 바위, 가위, 보
const RPS_NAMES   = { '✊':'바위', '✌️':'가위', '🖐️':'보' };

// ── 유틸 ─────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 같은 숫자(rank)만 짝
function isPair(a, b) {
  if (a.isJoker || b.isJoker) return false;
  return a.rank === b.rank;
}

function activeCount(players) {
  return players.filter(p => !p.eliminated).length;
}

function nextActive(from, players) {
  const n = players.length;
  let idx = (from + 1) % n;
  let tries = 0;
  while (players[idx].eliminated && tries < n) {
    idx = (idx + 1) % n;
    tries++;
  }
  return players[idx].eliminated ? -1 : idx;
}

function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── 가위바위보 승패 판정 ──────────────────────────────────
// 반환: 이긴 choice 목록 (무승부면 빈 배열)
function rpsWinner(choices) {
  const unique = [...new Set(choices)];
  if (unique.length === 1 || unique.length === 3) return []; // 무승부
  // 바위 vs 가위 → 바위 승
  // 가위 vs 보  → 가위 승
  // 보  vs 바위 → 보 승
  const beats = { '✊': '✌️', '✌️': '🖐️', '🖐️': '✊' };
  for (const c of unique) {
    if (choices.includes(beats[c])) return [c];
  }
  return [];
}

// ── 게임 초기화 ───────────────────────────────────────────
function initGame(lobbyPlayers) {
  // 덱 생성 (52장 + 조커 1장)
  let deck = [];
  for (const suit of SUITS)
    for (const rank of RANKS)
      deck.push({ suit, rank, color: SUIT_COLOR[suit], isJoker: false, id: `${rank}${suit}` });
  deck.push({ suit: '★', rank: 'JOKER', color: 'joker', isJoker: true, id: 'JOKER' });
  deck = shuffle(deck);

  // 플레이어 생성
  const players = lobbyPlayers.map((p, i) => ({
    id: i,
    socketId: p.socketId,
    name: p.name,
    avatar: AVATARS[i],
    color: COLORS[i],
    hand: [],
    eliminated: false,
    finishOrder: null,
    isLoser: false,
    discardDone: false,   // 버리기 완료 여부
    rpsChoice: null,      // 가위바위보 선택
  }));

  // 카드 배분 (짝 제거 없이 그대로)
  deck.forEach((card, i) => players[i % players.length].hand.push(card));

  return {
    players,
    phase: 'discard',     // 버리기 단계
    currentTurn: -1,
    targetPlayer: -1,
    finishOrder: 1,
    waitingConfirm: false,
    lastMsg: '손패에서 짝이 되는 카드 두 장을 선택해 버리세요!',
    rpsRound: 1,
    turnOrder: [],        // 가위바위보로 결정된 순서 (플레이어 id 배열)
    rpsHistory: [],       // 가위바위보 라운드 기록
  };
}

// ── 버리기: 카드 두 장 선택해서 버리기 ───────────────────
function discardPair(game, playerId, idx1, idx2) {
  const g = JSON.parse(JSON.stringify(game));
  const player = g.players.find(p => p.id === playerId);
  if (!player || player.discardDone) return { game, ok: false, msg: '이미 버리기를 완료했습니다.' };

  const c1 = player.hand[idx1];
  const c2 = player.hand[idx2];
  if (!c1 || !c2) return { game, ok: false, msg: '잘못된 카드 인덱스입니다.' };
  if (idx1 === idx2)  return { game, ok: false, msg: '같은 카드를 두 번 선택했습니다.' };
  if (!isPair(c1, c2)) return { game, ok: false, msg: '짝이 되지 않는 카드입니다. (같은 숫자 또는 같은 문양)' };

  // 큰 인덱스부터 제거
  const hi = Math.max(idx1, idx2);
  const lo = Math.min(idx1, idx2);
  player.hand.splice(hi, 1);
  player.hand.splice(lo, 1);

  // 더 버릴 짝이 없으면 완료
  const hasPair = checkHasPair(player.hand);
  if (!hasPair) {
    player.discardDone = true;
    g.lastMsg = `${player.name}이(가) 버리기를 완료했습니다!`;
  } else {
    g.lastMsg = `${player.name}이(가) 짝을 버렸습니다. 계속 버리세요!`;
  }

  // 모두 완료했는지 확인
  const allDone = g.players.every(p => p.discardDone);
  if (allDone) {
    g.phase = 'rps';
    g.lastMsg = '모두 버리기 완료! 가위바위보로 순서를 정합니다!';
    // rps 초기화
    g.players.forEach(p => { p.rpsChoice = null; });
    g.rpsRound = 1;
    g.rpsHistory = [];
  }

  return { game: g, ok: true, msg: g.lastMsg };
}

// 버리기 완료 처리 (더 이상 버릴 짝 없을 때 수동 완료)
function finishDiscard(game, playerId) {
  const g = JSON.parse(JSON.stringify(game));
  const player = g.players.find(p => p.id === playerId);
  if (!player || player.discardDone) return { game, ok: false };

  player.discardDone = true;
  g.lastMsg = `${player.name}이(가) 버리기를 완료했습니다!`;

  const allDone = g.players.every(p => p.discardDone);
  if (allDone) {
    g.phase = 'rps';
    g.lastMsg = '모두 버리기 완료! 가위바위보로 순서를 정합니다!';
    g.players.forEach(p => { p.rpsChoice = null; });
    g.rpsRound = 1;
    g.rpsHistory = [];
  }

  return { game: g, ok: true };
}

// 손패에 버릴 짝이 있는지 확인
function checkHasPair(hand) {
  for (let i = 0; i < hand.length; i++) {
    if (hand[i].isJoker) continue;
    for (let j = i + 1; j < hand.length; j++) {
      if (hand[j].isJoker) continue;
      if (isPair(hand[i], hand[j])) return true;
    }
  }
  return false;
}

// ── 가위바위보 선택 ───────────────────────────────────────
function submitRps(game, playerId, choice) {
  if (!RPS_CHOICES.includes(choice)) return { game, ok: false, done: false };

  const g = JSON.parse(JSON.stringify(game));
  const player = g.players.find(p => p.id === playerId);
  if (!player || player.rpsChoice) return { game, ok: false, done: false };

  player.rpsChoice = choice;

  // 모두 선택했는지 확인
  const allChosen = g.players.every(p => p.rpsChoice !== null);
  if (!allChosen) {
    return { game: g, ok: true, done: false };
  }

  // 결과 계산
  return resolveRps(g);
}

function resolveRps(g) {
  const choices = g.players.map(p => p.rpsChoice);
  const winChoice = rpsWinner(choices);

  // 라운드 기록
  const roundRecord = g.players.map(p => ({
    id: p.id, name: p.name, avatar: p.avatar, choice: p.rpsChoice,
  }));

  if (winChoice.length === 0) {
    // 무승부 → 재시도
    g.rpsHistory.push({ round: g.rpsRound, records: roundRecord, result: '무승부' });
    g.rpsRound++;
    g.players.forEach(p => { p.rpsChoice = null; });
    g.lastMsg = `무승부! ${g.rpsRound}라운드를 진행합니다.`;
    return { game: g, ok: true, done: false };
  }

  // 승자 그룹 (같은 선택을 한 플레이어들)
  const winners = g.players.filter(p => p.rpsChoice === winChoice[0]);
  const losers  = g.players.filter(p => p.rpsChoice !== winChoice[0]);

  g.rpsHistory.push({ round: g.rpsRound, records: roundRecord, result: `${RPS_NAMES[winChoice[0]]} 승리` });

  if (winners.length === 1) {
    // 단독 승자 → 순서 확정 (승자 먼저, 나머지는 기존 순서)
    const winnerId = winners[0].id;
    const rest = g.players.filter(p => p.id !== winnerId).map(p => p.id);
    g.turnOrder = [winnerId, ...rest];
    return startPlay(g);
  } else {
    // 승자가 여럿 → 승자들끼리 재시도
    // 패자들은 순서 뒤로 확정
    const loserIds = losers.map(p => p.id);
    // 기존 turnOrder 뒤에 패자 추가
    g.turnOrder = [...g.turnOrder, ...loserIds];
    // 승자들만 rps 재시도
    g.players.forEach(p => {
      if (winners.some(w => w.id === p.id)) p.rpsChoice = null;
      // 패자는 rps에서 제외 (rpsEliminated 표시)
      else p.rpsEliminated = true;
    });
    g.rpsRound++;
    g.lastMsg = `${winners.map(p => p.name).join(', ')}이(가) 동률! 재시도합니다.`;
    return { game: g, ok: true, done: false };
  }
}

// ── 플레이 단계 시작 ──────────────────────────────────────
function startPlay(g) {
  g.phase = 'play';
  g.lastMsg = '순서가 정해졌습니다! 게임을 시작합니다!';

  // turnOrder 기준으로 첫 번째 활성 플레이어
  // 빈 손 플레이어 탈락 처리
  let finishOrder = g.finishOrder;
  g.players.forEach(p => {
    if (!p.eliminated && p.hand.length === 0) {
      p.eliminated = true;
      p.finishOrder = finishOrder++;
    }
  });
  g.finishOrder = finishOrder;

  // turnOrder에서 첫 활성 플레이어
  const firstId = g.turnOrder.find(id => {
    const p = g.players.find(pl => pl.id === id);
    return p && !p.eliminated;
  });

  if (firstId === undefined) {
    return endGame(g);
  }

  g.currentTurn = firstId;

  // 대상: turnOrder에서 currentTurn 다음 활성 플레이어
  const targetId = nextInOrder(g.currentTurn, g.turnOrder, g.players);
  if (targetId === -1) return endGame(g);
  g.targetPlayer = targetId;

  g.waitingConfirm = false;
  return { game: g, ok: true, done: true };
}

// turnOrder 기준 다음 활성 플레이어
function nextInOrder(currentId, turnOrder, players) {
  const idx = turnOrder.indexOf(currentId);
  if (idx === -1) return -1;
  const n = turnOrder.length;
  for (let i = 1; i < n; i++) {
    const nextId = turnOrder[(idx + i) % n];
    const p = players.find(pl => pl.id === nextId);
    if (p && !p.eliminated) return nextId;
  }
  return -1;
}

// ── 카드 뽑기 ─────────────────────────────────────────────
function pickCard(game, cardIndex) {
  if (game.waitingConfirm) return { game, event: null };

  const g = JSON.parse(JSON.stringify(game));
  const picker = g.players.find(p => p.id === g.currentTurn);
  const target = g.players.find(p => p.id === g.targetPlayer);
  if (!picker || !target) return { game, event: null };

  const picked = target.hand[cardIndex];
  if (!picked) return { game, event: null };

  target.hand.splice(cardIndex, 1);
  picker.hand.push(picked);

  let matched = false;

  if (!picked.isJoker) {
    const newCardIdx = picker.hand.length - 1;
    const pairIdx = picker.hand.findIndex(
      (c, i) => i !== newCardIdx && !c.isJoker && isPair(picked, c)
    );
    if (pairIdx !== -1) {
      const hi = Math.max(pairIdx, newCardIdx);
      const lo = Math.min(pairIdx, newCardIdx);
      picker.hand.splice(hi, 1);
      picker.hand.splice(lo, 1);
      g.lastMsg = `${picker.name}이(가) 짝을 맞췄습니다! 🎉`;
      matched = true;
    } else {
      g.lastMsg = `${picker.name}이(가) 카드를 뽑았습니다!`;
    }
  } else {
    g.lastMsg = `${picker.name}이(가) 카드를 뽑았습니다!`;
  }

  // 빈 손 체크
  g.players.forEach(p => {
    if (!p.eliminated && p.hand.length === 0) {
      p.eliminated = true;
      p.finishOrder = g.finishOrder++;
    }
  });

  g.waitingConfirm = true;
  return { game: g, event: { type: 'PICKED', pickerId: picker.id, matched } };
}

// ── 차례 진행 ─────────────────────────────────────────────
function advanceTurn(game) {
  const g = JSON.parse(JSON.stringify(game));
  g.waitingConfirm = false;
  g.lastMsg = '';

  if (activeCount(g.players) <= 1) return endGame(g);

  const nextId = nextInOrder(g.currentTurn, g.turnOrder, g.players);
  if (nextId === -1) return endGame(g);
  g.currentTurn = nextId;

  const targetId = nextInOrder(g.currentTurn, g.turnOrder, g.players);
  if (targetId === -1) return endGame(g);
  g.targetPlayer = targetId;

  return { game: g, ended: false };
}

// ── 게임 종료 ─────────────────────────────────────────────
function endGame(game) {
  const g = JSON.parse(JSON.stringify(game));
  const loser = g.players.find(p => !p.eliminated);
  if (loser) {
    loser.finishOrder = g.finishOrder++;
    loser.isLoser = true;
  }
  g.phase = 'end';
  return { game: g, ended: true };
}

// ── 클라이언트용 상태 (카드 숨김 처리) ───────────────────
function getStateForPlayer(game, playerId) {
  const state = JSON.parse(JSON.stringify(game));
  state.players = state.players.map(p => {
    if (p.id === playerId || p.eliminated) return p;
    // 버리기 단계: 다른 플레이어 카드 숨김
    // 플레이 단계: 다른 플레이어 카드 숨김
    return {
      ...p,
      hand: p.hand.map(() => ({ hidden: true })),
    };
  });
  return state;
}

// 손패에서 버릴 수 있는 짝 목록 반환 (클라이언트 힌트용)
function getPairHints(hand) {
  const pairs = [];
  for (let i = 0; i < hand.length; i++) {
    if (hand[i].isJoker) continue;
    for (let j = i + 1; j < hand.length; j++) {
      if (hand[j].isJoker) continue;
      if (isPair(hand[i], hand[j])) pairs.push([i, j]);
    }
  }
  return pairs;
}

module.exports = {
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
  getPairHints,
  AVATARS,
  COLORS,
  RPS_CHOICES,
  RPS_NAMES,
};
