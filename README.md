# KOSA AIF Build-up — 팀 프로젝트 모음

각 팀의 결과물을 한 폴더 아래 모아두고, **동시에 실행해도 포트가 충돌하지 않도록** 팀별로 포트를 분리해 두었습니다.

## 포트 규칙

> `teamN` → 서버 `400N`, 클라이언트(Vite/정적) `300N`

| 팀 | 형태 | 서버 포트 | 클라이언트 포트 | 실행 방법 |
|----|------|:---------:|:---------------:|-----------|
| team1 | Node `http` 단일 서버 | **4001** | — | `node server.js` |
| team2 | 순수 정적 (Vanilla JS) | — | **3002** | Live Server / `npx serve -l 3002` |
| team3 | 외부 링크 | — | — | (배포 URL 접속) |
| team4 | Vite + React/TS | — | **3004** | `npm run dev` |
| team5 | 단일 HTML 파일 | — | (3005) | 브라우저로 직접 열기 |
| team6 | Vite + Express(Socket.IO) | **4006** | **3006** | `start.bat` / `dev.bat` |
| team7 | Vite + Express(API) | **4007** | **3007** | `npm run dev` + `npm run server` |

> team3·team5는 로컬 서버가 없어 포트 충돌과 무관합니다. team5를 다른 팀과 함께 로컬 서버로 띄울 경우에만 `npx serve -l 3005`로 포트를 맞추세요.

## 포트는 `.env`로 관리합니다

서버/Vite가 동작하는 팀은 각 팀 폴더의 **`.env`** 파일에서 포트를 읽습니다. 포트를 바꾸려면 코드가 아니라 `.env`만 수정하면 됩니다.

```bash
# 예: team6/.env
SERVER_PORT=4006
CLIENT_PORT=3006
```

`.env`는 git에 올라가지 않습니다(`.gitignore`). 새로 받은 폴더에서는 `.env.example`을 `.env`로 복사해 사용하세요.

```bash
cp .env.example .env
```

## 팀별 실행

### team1 — 학습 미션 페이지 (Node http)
```bash
cd team1
node server.js
# http://localhost:4001
```
> AI 기능을 쓰려면 `team1/.env`에 `OPENROUTER_API_KEY`를 넣어야 합니다.

### team2 — UniMap 대학 3D 지도 (정적)
브라우저 보안 정책상 로컬 서버 권장:
```bash
cd team2
npx serve -l 3002      # 또는 VS Code Live Server (포트 3002로 설정됨)
# http://localhost:3002
```

### team3 — 외부 링크
배포된 URL로 접속합니다. *(링크는 별도 공유)*

### team4 — React 앱 (Vite)
```bash
cd team4
npm install
npm run dev
# http://localhost:3004
```
> Gemini 기능을 쓰려면 `team4/.env`에 `GEMINI_API_KEY`를 넣으세요.

### team5 — 단일 HTML
`team5/index.html`(또는 해당 파일)을 브라우저에서 직접 엽니다. 별도 서버가 필요 없습니다.

### team6 — 도둑잡기 온라인 (Vite + Socket.IO 서버)
**통합 실행(빌드 후 한 포트로 서빙):**
```bash
cd team6
start.bat          # Windows. 서버가 빌드된 클라이언트까지 서빙 → http://localhost:4006
```
**개발 모드(핫리로드):**
```bash
dev.bat            # 서버(4006) + Vite(3006) 동시 실행 → http://localhost:3006
```

### team7 — School Quest Board (Vite + API 서버)
서버와 클라이언트를 각각 띄웁니다(Node.js v22+ 필요 — 내장 SQLite 사용):
```bash
cd team7
npm install
npm run server     # API 서버 → http://localhost:4007
npm run dev        # 클라이언트(Vite) → http://localhost:3007 (/api 는 4007로 프록시)
```

## 새 팀 폴더를 추가할 때

1. 폴더를 `teamN` 이름으로 둡니다.
2. 포트를 규칙(`서버 400N` / `클라 300N`)에 맞춰 그 팀 구조에 적용합니다.
   - **단일 Node 서버**: `.env`의 `SERVER_PORT`를 읽도록 포트 상수 수정.
   - **Vite 프로젝트**: `vite.config`에서 `loadEnv`로 `CLIENT_PORT`(+프록시 타깃 `SERVER_PORT`)를 읽도록 수정.
   - **정적 사이트**: 서버가 없으므로 띄울 때 포트만 `300N`으로 지정.
3. `.env` / `.env.example`을 만들어 포트를 기록합니다.
