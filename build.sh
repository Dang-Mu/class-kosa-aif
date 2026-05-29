#!/usr/bin/env bash
#
# build.sh — 전체 팀 데모 서버를 "개발 모드"로 한 번에 실행한다.
#
#   - 의존성(node_modules)이 없는 팀은 자동으로 npm install 후 실행
#   - 각 팀은 자신의 .env / package.json 설정(포트 등)을 그대로 사용
#   - Ctrl+C 한 번이면 띄운 모든 서버를 정리하고 종료
#   - 각 서버 로그는 logs/<팀>.log 에 기록
#
# 사용법:
#   ./build.sh            # 전체 실행
#   TEAM2_PORT=4102 ./build.sh   # 정적 서버 포트만 변경
#

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT/logs"
RUN_DIR="$ROOT/.run"
mkdir -p "$LOG_DIR" "$RUN_DIR"

# 포트 설정이 없는 정적 전용 팀(team2, team5)의 서빙 포트
TEAM2_PORT="${TEAM2_PORT:-4002}"
TEAM5_PORT="${TEAM5_PORT:-4005}"

# ── 색상 ──────────────────────────────────────────────
if [ -t 1 ]; then
  G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; C=$'\033[36m'; DIM=$'\033[2m'; B=$'\033[1m'; NC=$'\033[0m'
else
  G=; Y=; R=; C=; DIM=; B=; NC=
fi
info() { printf "%s[build]%s %s\n" "$C" "$NC" "$*"; }
ok()   { printf "%s[build]%s %s\n" "$G" "$NC" "$*"; }
warn() { printf "%s[build]%s %s\n" "$Y" "$NC" "$*"; }
err()  { printf "%s[build]%s %s\n" "$R" "$NC" "$*"; }

# ── 사전 점검 ─────────────────────────────────────────
need() { command -v "$1" >/dev/null 2>&1 || { err "'$1' 명령을 찾을 수 없습니다. 설치 후 다시 실행하세요."; exit 1; }; }
need node
need npm
need python3

# ── 프로세스 추적 / 정리 ───────────────────────────────
PIDS=()
LABELS=()
CLEANED=0

# 자식까지 포함해 프로세스 트리를 종료 (vite/npm 은 자식 프로세스를 생성)
kill_tree() {
  local pid="$1" child
  for child in $(pgrep -P "$pid" 2>/dev/null); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null
}

cleanup() {
  [ "$CLEANED" = "1" ] && return
  CLEANED=1
  printf "\n"
  warn "종료 중 — 실행한 모든 서버를 정리합니다…"
  local i
  for i in "${!PIDS[@]}"; do
    if kill -0 "${PIDS[$i]}" 2>/dev/null; then
      kill_tree "${PIDS[$i]}"
    fi
  done
  wait 2>/dev/null
  ok "정리 완료."
}
trap cleanup INT TERM EXIT

# ── 헬퍼 ──────────────────────────────────────────────
# node_modules 가 없으면 npm install. 실패하면 1 반환.
ensure_deps() {
  local dir="$1" label="$2"
  [ -f "$dir/package.json" ] || return 0
  if [ ! -d "$dir/node_modules" ]; then
    info "[$label] 의존성 설치 중 (npm install) … 처음엔 시간이 걸립니다."
    if ( cd "$dir" && npm install ) >"$LOG_DIR/$label-install.log" 2>&1; then
      ok "[$label] 설치 완료."
    else
      err "[$label] npm install 실패 → 로그: logs/$label-install.log (이 팀은 건너뜁니다)"
      return 1
    fi
  fi
  # .bin 실행권한 보정: Windows에서 만든 node_modules는 Unix 셔임에 실행비트가 빠져
  # "vite: Permission denied" 가 발생한다. 무해하게 보정한다.
  if [ -d "$dir/node_modules/.bin" ]; then
    chmod u+x "$dir"/node_modules/.bin/* 2>/dev/null || true
  fi
  return 0
}

# 백그라운드로 실행하고 PID 추적. (cwd, 명령) 지정.
launch() {
  local label="$1" dir="$2"; shift 2
  if [ ! -d "$dir" ]; then
    warn "[$label] 디렉토리($dir)가 없어 건너뜁니다."
    return 0
  fi
  info "[$label] 실행 → ${B}$*${NC} ${DIM}(cwd=${dir#$ROOT/})${NC}"
  ( cd "$dir" && exec "$@" ) >"$LOG_DIR/$label.log" 2>&1 &
  PIDS+=("$!")
  LABELS+=("$label")
}

# ══════════════════════════════════════════════════════
info "전체 데모 서버를 개발 모드로 실행합니다. (중지: Ctrl+C)"
echo

# team1 — Node 정적+API 서버 (내장 모듈만, 설치 불필요)
launch "team1" "$ROOT/team1" node server.js

# team2 — 정적(sql.js + university.db). 디렉토리 루트에서 서빙해야 fetch가 동작.
launch "team2" "$ROOT/team2" python3 -m http.server "$TEAM2_PORT"

# team4 — Vite React (개발 서버)
ensure_deps "$ROOT/team4" "team4" && launch "team4" "$ROOT/team4" npm run dev

# team5 — 단일 HTML. 전체 레포 노출을 피하려고 전용 디렉토리에 심볼릭 링크 후 서빙.
if [ -f "$ROOT/team5.html" ]; then
  mkdir -p "$RUN_DIR/team5"
  ln -sf "$ROOT/team5.html" "$RUN_DIR/team5/index.html"
  launch "team5" "$RUN_DIR/team5" python3 -m http.server "$TEAM5_PORT"
else
  warn "[team5] team5.html 이 없어 건너뜁니다."
fi

# team6 — Node 서버 + Vite 클라이언트 (client가 /api를 server로 프록시)
ensure_deps "$ROOT/team6/server" "team6-server"
ensure_deps "$ROOT/team6/client" "team6-client" && {
  launch "team6-server" "$ROOT/team6/server" node index.js
  launch "team6-client" "$ROOT/team6/client" npm run dev
}

# team7 — Node 서버 + Vite 클라이언트
ensure_deps "$ROOT/team7/server" "team7-server"
ensure_deps "$ROOT/team7" "team7" && {
  launch "team7-server" "$ROOT/team7/server" node index.js
  launch "team7-client" "$ROOT/team7" npm run dev
}

# ── 실행 요약 ─────────────────────────────────────────
sleep 2
echo
ok "실행된 서버 (${#PIDS[@]}개):"
printf "  %-16s %s\n" "team1"        "http://localhost:4001            ${DIM}(server.js · .env SERVER_PORT)${NC}"
printf "  %-16s %s\n" "team2"        "http://localhost:${TEAM2_PORT}"
printf "  %-16s %s\n" "team4"        "Vite 개발 서버 ${DIM}(.env CLIENT_PORT · 실제 포트는 logs/team4.log)${NC}"
printf "  %-16s %s\n" "team5"        "http://localhost:${TEAM5_PORT}"
printf "  %-16s %s\n" "team6 client" "http://localhost:3000            ${DIM}(API → :4000 프록시)${NC}"
printf "  %-16s %s\n" "team7 client" "Vite 개발 서버 ${DIM}(실제 포트는 logs/team7-client.log)${NC}"
echo
info "포트는 각 팀의 .env(SERVER_PORT/CLIENT_PORT)에 따라 달라집니다. 정확한 주소는 각 로그를 확인하세요."
info "로그 실시간 보기:  tail -f logs/<팀>.log"
echo
ok "모든 서버가 백그라운드에서 실행 중입니다. 중지하려면 ${B}Ctrl+C${NC}."

# 포그라운드 유지 — Ctrl+C 시 trap(cleanup) 발동
wait
