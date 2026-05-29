@echo off
chcp 65001 > nul
echo ========================================
echo   도둑잡기 - 개발 모드 (핫리로드)
echo ========================================
echo.
echo 서버(4000)와 클라이언트(3000) 동시 실행
echo 브라우저: http://localhost:3000
echo.

start "서버" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak > nul
start "클라이언트" cmd /k "cd client && npm run dev"
timeout /t 3 /nobreak > nul
start http://localhost:3000
