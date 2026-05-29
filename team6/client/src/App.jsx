import { useState, useEffect } from 'react';
import { socket } from './socket';
import MainScreen    from './screens/MainScreen';
import CreateScreen  from './screens/CreateScreen';
import JoinScreen    from './screens/JoinScreen';
import LobbyScreen   from './screens/LobbyScreen';
import DiscardScreen from './screens/DiscardScreen';
import RpsScreen     from './screens/RpsScreen';
import GameScreen    from './screens/GameScreen';
import ResultScreen  from './screens/ResultScreen';

export default function App() {
  const [screen,   setScreen]   = useState('main');
  const [myId,     setMyId]     = useState(null);
  const [lobby,    setLobby]    = useState(null);
  const [game,     setGame]     = useState(null);
  const [error,    setError]    = useState('');

  useEffect(() => {
    socket.connect();

    socket.on('ROOM_CREATED', ({ code, playerId }) => {
      setMyId(playerId);
      setScreen('lobby');
    });
    socket.on('ROOM_JOINED', ({ code, playerId }) => {
      setMyId(playerId);
      setError('');
      setScreen('lobby');
    });
    socket.on('JOIN_ERROR',  ({ message }) => setError(message));
    socket.on('LOBBY_STATE', (data)        => setLobby(data));

    socket.on('GAME_START', () => {
      setScreen('discard');
    });

    socket.on('PHASE_CHANGE', ({ phase }) => {
      if (phase === 'rps')  setScreen('rps');
      if (phase === 'play') setScreen('game');
    });

    socket.on('GAME_STATE', (gameState) => {
      setGame(gameState);
      // phase 변화에 따른 화면 전환 (재연결 등 대비)
      if (gameState.phase === 'discard') setScreen('discard');
      if (gameState.phase === 'rps')     setScreen('rps');
      if (gameState.phase === 'play')    setScreen('game');
      if (gameState.phase === 'end')     setScreen('result');
    });

    socket.on('GAME_ENDED',          () => setScreen('result'));
    socket.on('DISCARD_ERROR',       ({ message }) => alert(message));
    socket.on('ROOM_CLOSED',         ({ message }) => { alert(message); handleReset(); });
    socket.on('PLAYER_DISCONNECTED', ({ message }) => { alert(message); handleReset(); });
    socket.on('ERROR',               ({ message }) => alert(message));

    return () => {
      socket.off('ROOM_CREATED'); socket.off('ROOM_JOINED');
      socket.off('JOIN_ERROR');   socket.off('LOBBY_STATE');
      socket.off('GAME_START');   socket.off('PHASE_CHANGE');
      socket.off('GAME_STATE');   socket.off('GAME_ENDED');
      socket.off('DISCARD_ERROR');socket.off('ROOM_CLOSED');
      socket.off('PLAYER_DISCONNECTED'); socket.off('ERROR');
    };
  }, []);

  function handleReset() {
    setScreen('main'); setMyId(null);
    setLobby(null); setGame(null); setError('');
  }

  return (
    <div className="app">
      {screen === 'main'    && <MainScreen   onCreateRoom={() => setScreen('create')} onJoinRoom={() => setScreen('join')} />}
      {screen === 'create'  && <CreateScreen onBack={() => setScreen('main')} onConfirm={(n, m) => socket.emit('CREATE_ROOM', { name: n, maxPlayers: m })} />}
      {screen === 'join'    && <JoinScreen   onBack={() => setScreen('main')} onConfirm={(n, c) => socket.emit('JOIN_ROOM', { name: n, code: c })} error={error} />}
      {screen === 'lobby'   && <LobbyScreen  lobby={lobby} myId={myId} onStart={() => socket.emit('START_GAME')} onLeave={() => { socket.disconnect(); socket.connect(); handleReset(); }} />}
      {screen === 'discard' && <DiscardScreen game={game} myId={myId} onDiscardPair={(i1, i2) => socket.emit('DISCARD_PAIR', { idx1: i1, idx2: i2 })} onFinish={() => socket.emit('FINISH_DISCARD')} />}
      {screen === 'rps'     && <RpsScreen    game={game} myId={myId} onChoice={(c) => socket.emit('RPS_CHOICE', { choice: c })} />}
      {screen === 'game'    && <GameScreen   game={game} myId={myId} onPickCard={(i) => socket.emit('PICK_CARD', { cardIndex: i })} />}
      {screen === 'result'  && <ResultScreen game={game} myId={myId} onRestart={handleReset} />}
    </div>
  );
}
