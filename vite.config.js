import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function chatDevProxy() {
  return {
    name: "chat-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/.netlify/functions/chat", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          });
          res.end();
          return;
        }

        if (req.method !== "POST") return next();

        const env = loadEnv(server.config.mode, server.config.envDir, "");
        const apiKey = env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY;

        if (!apiKey) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: {
                message:
                  "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local",
              },
            })
          );
          return;
        }

        try {
          const body = await readBody(req);
          const upstream = await fetch(OPENAI_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body,
          });
          const data = await upstream.text();
          res.writeHead(upstream.status, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          });
          res.end(data);
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: err.message } }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), chatDevProxy()],
});
