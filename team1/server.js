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
const PORT = 3500;

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
  // CORS 헤더 허용
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
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

  // 정적 파일 서빙
  let reqUrl = req.url === "/" ? "/index.html" : req.url;
  let filePath = path.join(__dirname, reqUrl);
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
