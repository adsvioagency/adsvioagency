/* ==========================================================================
   ADSVIO - generate-image
   Serverless image generation via the Gemini API.

   WHY THIS FILE EXISTS
   The browser must never see GEMINI_API_KEY. A key in frontend JavaScript is
   readable by anyone who opens devtools, and once it is in a deployed bundle
   it is effectively published. So the browser posts a prompt here, this
   function holds the key, and only the finished image goes back.

   THE KEY IS READ IN EXACTLY ONE PLACE - process.env.GEMINI_API_KEY, below.
   It is never logged, never echoed in an error, and never included in a
   response body. If you add logging here, log the prompt, not the client.

   SDK SHAPE - read this before changing the call
   Current @google/genai generates images through ai.interactions.create(),
   NOT the older ai.models.generateContent() with responseModalities. The
   result carries the image on `output_image` (snake_case, genuinely) as
   base64 in `.data`, with `.mime_type` alongside. Any text the model returns
   instead - typically a refusal - lands on `output_text`. Verified against
   the type definitions in @google/genai@2.22.0.

   TIMEOUT
   Netlify synchronous functions get 60s. Image generation normally lands in
   5-20s, so this runs synchronously and returns the image directly. If a
   future model pushes past 60s this has to become a background function,
   which is a different shape entirely - it returns 202 and the client polls.
   ========================================================================== */

import { GoogleGenAI } from "@google/genai";

/* Primary model, and what to fall back to if the account or SDK cannot serve
   it. Ordered most-capable-per-cost first. A 404 or NOT_FOUND on the first
   entry walks to the next rather than failing the request outright. */
const MODELS = [
  "gemini-3.1-flash-image",
  "gemini-3-pro-image",
  "gemini-2.5-flash-image"
];

const MAX_PROMPT_CHARS = 1000;
const MIN_PROMPT_CHARS = 3;
const MAX_BODY_BYTES = 8 * 1024;

/* Browsers enforce this via CORS; curl does not. It filters casual abuse and
   stops the endpoint being embedded in someone else's page. It is NOT rate
   limiting - see the note on THROTTLE below. */
const ALLOWED_ORIGINS = [
  "https://adsvioagency.com",
  "https://www.adsvioagency.com",
  "http://localhost:8888",
  "http://localhost:8787"
];

/* A token bucket in module scope. Be honest about what this is: it only sees
   traffic that lands on the SAME warm instance, so a burst spread across cold
   starts walks straight past it. It stops one person hammering the button; it
   does not stop a determined script. Real protection means Netlify Rate
   Limiting or an auth check in front of this endpoint. */
const THROTTLE = new Map();
const THROTTLE_WINDOW_MS = 60_000;
const THROTTLE_MAX = 8;

function throttled(key) {
  const now = Date.now();
  const hits = (THROTTLE.get(key) || []).filter((t) => now - t < THROTTLE_WINDOW_MS);
  hits.push(now);
  THROTTLE.set(key, hits);
  if (THROTTLE.size > 500) {
    for (const [k, v] of THROTTLE) if (!v.some((t) => now - t < THROTTLE_WINDOW_MS)) THROTTLE.delete(k);
  }
  return hits.length > THROTTLE_MAX;
}

function json(status, body, origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

/* Belt and braces. Nothing here should ever contain the key, but an SDK that
   echoes a request URL in an error message would change that, and the cost of
   being wrong is a published credential. */
function scrub(message) {
  const key = process.env.GEMINI_API_KEY;
  let out = String(message || "");
  if (key && key.length > 8) out = out.split(key).join("[redacted]");
  return out.replace(/AIza[0-9A-Za-z_\-]{10,}/g, "[redacted]").slice(0, 300);
}

/* The SDK's err.message is useless for diagnosis - an invalid key produces
   literally `400 API error occurred: {"httpMeta":{"response":{},"request":{}}}`.
   The real payload is on err.body as a JSON string (sometimes wrapped in an
   array), carrying error.message and a machine-readable details[].reason.
   Verified by calling the live API with a deliberately invalid key. */
function describe(err) {
  let message = scrub(err?.message);
  let reason = "";
  try {
    const parsed = JSON.parse(err.body);
    const node = (Array.isArray(parsed) ? parsed[0] : parsed)?.error;
    if (node?.message) message = scrub(node.message);
    reason = node?.details?.find((d) => d?.reason)?.reason || node?.status || "";
  } catch { /* no body, or not JSON - fall back to the message */ }
  return { message, reason };
}

/* An invalid or unauthorised key comes back as 400 INVALID_ARGUMENT, not 401.
   Matching on status alone would report "Gemini rejected that prompt" to a
   visitor when the truth is that the server is misconfigured - sending someone
   off to rewrite a perfectly good prompt forever. */
function isCredentialProblem(status, { message, reason }) {
  if (status === 401 || status === 403) return true;
  return /API_KEY_INVALID|PERMISSION_DENIED|UNAUTHENTICATED/i.test(reason)
    || /api key not valid|api key expired|permission denied|caller does not have permission/i.test(message);
}

export default async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      }
    });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Use POST." }, origin);
  }

  /* A cross-origin POST from a browser carries an Origin header. Same-origin
     requests may omit it, so a missing Origin is allowed; a wrong one is not. */
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json(403, { error: "Not allowed from this origin." }, null);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    /* Say what is wrong without hinting at the value. This fires when the env
       var is missing from the Netlify site config, or when netlify dev was
       started without a local .env. */
    console.error("[generate-image] GEMINI_API_KEY is not set in this environment");
    return json(500, { error: "Image generation is not configured on the server." }, origin);
  }

  /* ---- Input ------------------------------------------------------------ */

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json(413, { error: "That request is too large." }, origin);
  }

  let body;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    return json(400, { error: "Expected a JSON body." }, origin);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return json(400, { error: "Write a prompt first." }, origin);
  }
  if (prompt.length < MIN_PROMPT_CHARS) {
    return json(400, { error: "That prompt is too short to work with." }, origin);
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return json(400, {
      error: `Keep the prompt under ${MAX_PROMPT_CHARS} characters. Yours is ${prompt.length}.`
    }, origin);
  }

  /* ---- Throttle --------------------------------------------------------- */

  /* Deliberately the LAST gate, immediately before the only expensive thing
     this function does. An earlier version checked here first, which meant a
     rejected empty prompt - costing nothing - consumed the same budget as a
     real generation, and someone fat-fingering the button eight times locked
     themselves out without a single image being made. Count spending, not
     requests. */
  const ip = req.headers.get("x-nf-client-connection-ip")
    || req.headers.get("x-forwarded-for")
    || "unknown";
  if (throttled(ip)) {
    return json(429, { error: "Too many images too quickly. Give it a minute and try again." }, origin);
  }

  /* ---- Generate --------------------------------------------------------- */

  const ai = new GoogleGenAI({ apiKey });
  let lastError = null;

  for (const model of MODELS) {
    try {
      const interaction = await ai.interactions.create({ model, input: prompt });
      const image = interaction?.output_image;

      if (image?.data) {
        return json(200, {
          model,
          mimeType: image.mime_type || "image/png",
          data: image.data
        }, origin);
      }

      /* No image came back. Usually a safety refusal, and the model explains
         itself in text - pass that through, because "something went wrong" is
         useless when the real answer is "it will not draw that". */
      const said = (interaction?.output_text || "").trim();
      return json(422, {
        error: said
          ? `The model returned text instead of an image: ${said.slice(0, 300)}`
          : "The model did not return an image. Try rewording the prompt."
      }, origin);

    } catch (err) {
      lastError = err;
      const status = err?.status;
      const info = describe(err);
      const msg = info.message;

      /* Credentials first - it masquerades as a 400, so checking status order
         alone would misreport it as a prompt problem. Never echo the upstream
         text here: it is a server-side misconfiguration, and the visitor can
         do nothing about it. The detail goes to the function log instead. */
      if (isCredentialProblem(status, info)) {
        console.error("[generate-image] upstream rejected the credential:", msg);
        return json(500, {
          error: "Image generation is not configured correctly on the server."
        }, origin);
      }

      /* Only an unavailable model is worth retrying on the next one. Anything
         else will fail identically on every model in the list. */
      const modelMissing = status === 404
        || /NOT_FOUND/i.test(info.reason)
        || /not found|not supported|does not exist/i.test(msg);
      if (modelMissing && model !== MODELS[MODELS.length - 1]) {
        console.warn(`[generate-image] ${model} unavailable, falling back`);
        continue;
      }

      if (status === 429 || /RESOURCE_EXHAUSTED|QUOTA/i.test(info.reason)) {
        return json(429, { error: "Gemini is rate limiting us right now. Try again shortly." }, origin);
      }
      if (status === 400) {
        return json(400, { error: `Gemini rejected that prompt: ${msg}` }, origin);
      }
      if (status >= 500) {
        return json(502, { error: "Gemini is having trouble right now. Try again shortly." }, origin);
      }

      console.error("[generate-image] unexpected failure:", msg);
      return json(502, { error: `Image generation failed: ${msg}` }, origin);
    }
  }

  console.error("[generate-image] every model failed:", scrub(lastError?.message));
  return json(502, { error: "No image model is available right now." }, origin);
};

/* Deliberately no `export const config = { path: "/api/..." }`. A custom path
   is nicer to read, but it interacts with the 30-odd forced redirects already
   in netlify.toml and I could not verify that here. The default endpoint,
   /.netlify/functions/generate-image, is handled by Netlify before any
   redirect rule runs, so it cannot be swallowed by one. Add a pretty path
   later if you want it, and test the redirect order when you do. */
