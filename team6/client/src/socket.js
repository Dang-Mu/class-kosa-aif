import { io } from 'socket.io-client';

// 개발: Vite 프록시(/socket.io)를 통해 same-origin으로 서버에 연결
// 프로덕션(빌드): 같은 origin(서버)에 연결
// → 어느 쪽이든 서버 포트를 알 필요가 없어 폴더별 포트 분리에 안전
const URL = window.location.origin;

export const socket = io(URL, {
  autoConnect: false,
});
