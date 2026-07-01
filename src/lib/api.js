const CHAT_URL = "/.netlify/functions/chat";

export function stripCodeFences(text) {
  return (text || "").replace(/^```[\w]*\n?/gm, "").replace(/\n?```$/gm, "").trim();
}

export async function callChat(messages, { max_tokens = 4096, signal } = {}) {
  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o", max_tokens, messages }),
    signal,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data.error?.message ||
      (typeof data.error === "string" ? data.error : null) ||
      `API error ${res.status}`;
    throw new Error(msg);
  }

  return data.choices?.[0]?.message?.content || "";
}

export function decodeGitHubContent(content) {
  const binary = atob(content.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

export const FILE_EXTENSIONS = {
  "js-ts": ".ts",
  "py2-py3": ".py",
  "react-class-hooks": ".tsx",
  "cjs-esm": ".mjs",
  "flask-fastapi": ".py",
  "java8-java17": ".java",
  "xml-compose": ".kt",
};

export function getOutputFilename(pathId, importedName) {
  const ext = FILE_EXTENSIONS[pathId] || ".txt";
  if (importedName) {
    const base = importedName.replace(/\.[^.]+$/, "");
    return `migrated-${base}${ext}`;
  }
  return `migrated${ext}`;
}

export function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "app") {
    return { page: "app", path: parts[1] || "js-ts" };
  }
  return { page: "landing", path: null };
}

export function navigateTo(page, pathId) {
  if (page === "app") {
    window.location.hash = pathId ? `#/app/${pathId}` : "#/app";
  } else {
    window.location.hash = "#/";
  }
}
