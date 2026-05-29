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
      host: true, // 0.0.0.0 바인딩 — 외부(EC2 등)에서 접속 허용
      allowedHosts: true, // 퍼블릭 도메인(ec2-*.compute.amazonaws.com 등) 접속 허용
      proxy: {
        '/socket.io': {
          target: `http://localhost:${serverPort}`,
          ws: true,
        },
      },
    },
  };
});
