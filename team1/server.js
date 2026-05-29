const http = require("http");
const fs = require("fs");
const path = require("path");
const https = require("https");

// .env 파일에서 API 키 읽기
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      const val = rest.join("=");
      if (key && val) process.env[key.trim()] = val.trim();
    });
}

const API_KEY = process.env.GEMINI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
// 포트는 .env(SERVER_PORT)에서 읽는다 — 폴더별 포트 분리
const PORT = process.env.SERVER_PORT || 4001;

// 정적 파일 서빙 루트 (경로 탐색 차단 기준)
const PUBLIC_ROOT = fs.realpathSync(__dirname);

// mission.html에서 사용하던 OpenRouter 무료 모델 (서버에서 순차 시도)
const FREE_MODELS = [
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "deepseek/deepseek-v4-flash:free",
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
  "moonshotai/kimi-k2.6:free",
];

// 로컬 개발용 origin만 CORS 허용 (오픈 프록시 방지)
const ALLOWED_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const server = http.createServer((req, res) => {
  // CORS: 로컬 origin만 허용 (동일 출처 요청은 origin 헤더가 없어 그대로 동작)
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGIN.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // OpenRouter API 프록시 (mission.html에서 사용) — 키는 서버 .env에만 존재
  if (req.method === "POST" && req.url === "/api/openrouter") {
    let body = "";
    let aborted = false;
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        // 2MB 제한 (이미지 base64 포함 고려)
        aborted = true;
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "요청 본문이 너무 큽니다 (최대 2MB)" }));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (aborted) return;
      if (!OPENROUTER_API_KEY) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "OPENROUTER_API_KEY가 설정되지 않았습니다 (.env 확인)",
          }),
        );
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }
      const messages = Array.isArray(parsed.messages) ? parsed.messages : null;
      if (!messages) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "messages 배열이 필요합니다" }));
        return;
      }

      // 무료 모델을 순차 시도 (429면 다음 모델로)
      const tryModel = (idx) => {
        if (idx >= FREE_MODELS.length) {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "모든 모델이 rate limit에 걸렸습니다. 잠시 후 다시 시도해주세요.",
            }),
          );
          return;
        }
        const orBody = JSON.stringify({ model: FREE_MODELS[idx], messages });
        const apiReq = https.request(
          {
            hostname: "openrouter.ai",
            path: "/api/v1/chat/completions",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Length": Buffer.byteLength(orBody),
            },
          },
          (apiRes) => {
            let data = "";
            apiRes.on("data", (chunk) => (data += chunk));
            apiRes.on("end", () => {
              if (apiRes.statusCode === 429) {
                tryModel(idx + 1);
                return;
              }
              let json;
              try {
                json = JSON.parse(data);
              } catch (e) {
                res.writeHead(502, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    error: "OpenRouter 응답 파싱 실패",
                    raw: data.slice(0, 300),
                  }),
                );
                return;
              }
              if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
                res.writeHead(apiRes.statusCode, {
                  "Content-Type": "application/json",
                });
                res.end(
                  JSON.stringify({
                    error: `API 오류 ${apiRes.statusCode}`,
                    detail: json,
                  }),
                );
                return;
              }
              const content = json.choices?.[0]?.message?.content || "";
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ content }));
            });
          },
        );
        apiReq.on("error", (e) => {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: e.message }));
        });
        apiReq.write(orBody);
        apiReq.end();
      };
      tryModel(0);
    });
    return;
  }

  // Gemini API 프록시 라우트 (/api/gemini 및 /api/claude 모두 처리)
  if (
    req.method === "POST" &&
    (req.url === "/api/gemini" || req.url === "/api/claude")
  ) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }

      const parts = [];

      // { prompt, image, mimeType } 형식 (mission.html 방식)
      if (parsed.prompt) {
        parts.push({ text: parsed.prompt });
        if (parsed.image) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType || "image/jpeg",
              data: parsed.image,
            },
          });
        }
      } else {
        // Claude 형식 배열을 Gemini 표준 파트 구조로 안전하게 매핑
        const messages = parsed.messages || [];
        for (const msg of messages) {
          if (typeof msg.content === "string") {
            parts.push({ text: msg.content });
          } else if (Array.isArray(msg.content)) {
            for (const c of msg.content) {
              if (c.type === "text") {
                parts.push({ text: c.text });
              } else if (c.type === "image") {
                const cleanBase64 = c.source.data.replace(
                  /^data:image\/\w+;base64,/,
                  "",
                );
                parts.push({
                  inlineData: {
                    mimeType: c.source.media_type || "image/jpeg",
                    data: cleanBase64,
                  },
                });
              }
            }
          }
        }
      }

      // Gemini 구조 조립 (JSON 반환 강제 설정 포함)
      const geminiBody = JSON.stringify({
        contents: [{ role: "user", parts: parts }],
        generationConfig: {
          maxOutputTokens: 1000,
          responseMimeType: "application/json",
        },
      });

      const options = {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(geminiBody),
        },
      };

      const apiReq = https.request(options, (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => (data += chunk));
        apiRes.on("end", () => {
          try {
            const geminiRes = JSON.parse(data);
            const text =
              geminiRes.candidates?.[0]?.content?.parts?.[0]?.text || "";

            // /api/gemini 는 { text } 형식, /api/claude 는 Claude 호환 형식으로 반환
            if (req.url === "/api/gemini") {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ text: text }));
            } else {
              const claudeFormat = {
                content: [{ type: "text", text: text }],
              };
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(claudeFormat));
            }
          } catch (e) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Gemini 응답 파싱 실패", raw: data }),
            );
          }
        });
      });

      apiReq.on("error", (e) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      });

      apiReq.write(geminiBody);
      apiReq.end();
    });
    return;
  }

  // 정적 파일 서빙 (경로 탐색 차단)
  let reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (reqPath === "/") reqPath = "/index.html";
  const requested = path.normalize(reqPath).replace(/^[/\\]+/, "");

  // dotfile/dotdir(.env, .git 등) 및 상위 경로 탈출 차단
  if (requested.split(/[/\\]/).some((seg) => seg.startsWith("."))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  const filePath = path.resolve(PUBLIC_ROOT, requested);
  if (filePath !== PUBLIC_ROOT && !filePath.startsWith(PUBLIC_ROOT + path.sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✅ 서버 실행 중! 브라우저에서 아래 주소로 접속하세요:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://localhost:${PORT}/mission.html`);
});
