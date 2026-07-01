const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return json(500, {
      error: "OpenAI API key not configured. Set OPENAI_API_KEY in Netlify environment variables.",
    });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return json(500, { error: err.message || "Migration request failed" });
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
