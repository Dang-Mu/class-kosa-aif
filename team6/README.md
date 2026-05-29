# 🃏 도둑잡기 온라인

React + Node.js(Socket.IO) 실시간 멀티플레이어 도둑잡기 카드게임

---

## 📁 프로젝트 구조

```
도둑잡기-온라인/
├── package.json          ← 루트 스크립트
├── start.bat             ← 프로덕션 원클릭 실행 (빌드 후 단일 서버)
├── dev.bat               ← 개발 모드 실행 (핫리로드)
│
├── server/               ← Node.js + Express + Socket.IO
│   ├── index.js          ← 서버 진입점 (정적 파일 서빙 + 소켓)
│   ├── gameLogic.js      ← 게임 로직
│   └── package.json
│
└── client/               ← React + Vite
    ├── src/
    │   ├── App.jsx
    │   ├── socket.js
    │   ├── screens/
    │   └── components/
    └── package.json
```

---

## 🚀 실행 방법

### 사전 준비
**Node.js 설치 필요** → https://nodejs.org (LTS 버전)

---

### ▶ 프로덕션 모드 (권장 — 포트 하나로 통합)

```
start.bat 더블클릭
```

또는 터미널에서:
```bash
# 1. 의존성 설치
cd server && npm install && cd ..
cd client && npm install && cd ..

# 2. React 빌드
cd client && npm run build && cd ..

# 3. 서버 실행 (React 앱 + 소켓 모두 포트 4000)
node server/index.js
```

브라우저에서 `http://localhost:4000` 접속

---

### 🔧 개발 모드 (핫리로드)

```
dev.bat 더블클릭
```

또는 터미널 2개:
```bash
# 터미널 1 — 서버 (포트 4000)
cd server && npm run dev

# 터미널 2 — 클라이언트 (포트 3000, Vite 프록시)
cd client && npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 🎮 게임 흐름

1. **방 만들기** — 닉네임 + 최대 인원(3~5명) 설정
2. **방 코드 공유** — 친구에게 6자리 코드 전달
3. **대기실** — 방장이 게임 시작
4. **1단계: 카드 버리기** — 같은 숫자 카드 두 장씩 직접 선택해서 버리기
5. **2단계: 가위바위보** — 순서 결정
6. **3단계: 도둑잡기** — 순서대로 상대 카드 뽑기, 조커 피하기
7. **결과** — 마지막에 조커를 가진 사람이 도둑으로 패배

---

## 🌐 통합 구조 설명

```
브라우저 → http://localhost:4000
              │
              ▼
         Express 서버
         ├── GET /*        → client/dist/index.html (React SPA)
         ├── GET /assets/* → client/dist/assets/* (JS/CSS)
         └── socket.io     → 실시간 게임 통신
```

빌드 후에는 **포트 4000 하나**로 프론트엔드와 백엔드가 모두 동작합니다.
