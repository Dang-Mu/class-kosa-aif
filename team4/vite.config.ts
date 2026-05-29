import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  // 포트는 .env(CLIENT_PORT)에서 읽는다 — 폴더별 포트 분리
  const env = loadEnv(mode, __dirname, '');
  const clientPort = Number(env.CLIENT_PORT || '3004');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: clientPort,
      host: '0.0.0.0',
      allowedHosts: true, // 퍼블릭 도메인(ec2-*.compute.amazonaws.com 등) 접속 허용
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
