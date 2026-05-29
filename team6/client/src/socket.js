import { io } from 'socket.io-client';

// 개발: Vite 프록시로 localhost:4000 연결
// 프로덕션(빌드): 같은 origin(서버)에 연결
const URL = import.meta.env.DEV
  ? 'http://localhost:4000'
  : window.location.origin;

export const socket = io(URL, {
  autoConnect: false,
});
