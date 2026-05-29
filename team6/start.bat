@echo off
chcp 65001 > nul
echo ========================================
echo   도둑잡기 온라인 - 통합 실행
echo ========================================
echo.

:: 서버 의존성 설치
if not exist "server\node_modules" (
  echo [1/3] 서버 패키지 설치 중...
  cd server
  npm install
  cd ..
)

:: 클라이언트 의존성 설치
if not exist "client\node_modules" (
  echo [2/3] 클라이언트 패키지 설치 중...
  cd client
  npm install
  cd ..
)

:: React 빌드
echo [3/3] React 앱 빌드 중...
cd client
npm run build
cd ..

echo.
echo ========================================
echo   서버 시작 중... (포트 4000)
echo   브라우저: http://localhost:4000
echo ========================================
echo.

start http://localhost:4000
node server/index.js
