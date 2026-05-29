import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 포트는 팀 루트(.env)에서 읽는다 — 폴더별 포트 분리
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const serverPort = env.SERVER_PORT || '4006';
  const clientPort = Number(env.CLIENT_PORT || '3006');

  return {
    plugins: [react()],
    server: {
      port: clientPort,
      proxy: {
        '/socket.io': {
          target: `http://localhost:${serverPort}`,
          ws: true,
        },
      },
    },
  };
});
