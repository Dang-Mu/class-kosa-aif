@echo off
chcp 65001 > nul

:: .env에서 포트 읽기 (폴더별 포트 분리)
set SERVER_PORT=4000
set CLIENT_PORT=3000
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
  if "%%a"=="SERVER_PORT" set SERVER_PORT=%%b
  if "%%a"=="CLIENT_PORT" set CLIENT_PORT=%%b
)

echo ========================================
echo   도둑잡기 - 개발 모드 (핫리로드)
echo ========================================
echo.
echo 서버(%SERVER_PORT%)와 클라이언트(%CLIENT_PORT%) 동시 실행
echo 브라우저: http://localhost:%CLIENT_PORT%
echo.

start "서버" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak > nul
start "클라이언트" cmd /k "cd client && npm run dev"
timeout /t 3 /nobreak > nul
start http://localhost:%CLIENT_PORT%
