// ============================================================
// FB Guard Pro — background.js v6.1
// Fix: AQ./Bearer token support | ZWS invisible bypass | Sheet
// ============================================================

// ── INVISIBLE BYPASS CHARACTER ────────────────────────────────
// ZWS = Zero-Width Space (U+200B) — INVISIBLE in all browsers/apps
// Text looks IDENTICAL to human eye but defeats keyword filters
const Z = "\u200B";

// ── OFFLINE BYPASS MAP ────────────────────────────────────────
// z = invisible (ZWS) — DEFAULT — looks same as original
// a = apostrophe (খ'ুন) — visible
// s = slash (খু/ন) — visible
const OFFLINE_MAP = {
  // হত্যা / খুন
  "গণহত্যা":     { z: "গণহ"+Z+"ত্যা",     a: "গণহ'ত্যা",     s: "গণহ/ত্যা"     },
  "হত্যাকাণ্ড":  { z: "হত্যা"+Z+"কাণ্ড",  a: "হ'ত্যাকাণ্ড",  s: "হ/ত্যাকাণ্ড"  },
  "হত্যাচেষ্টা": { z: "হত্যা"+Z+"চেষ্টা", a: "হ'ত্যাচেষ্টা", s: "হ/ত্যাচেষ্টা"  },
  "হত্যাকারী":   { z: "হত্যা"+Z+"কারী",   a: "হ'ত্যাকারী",   s: "হ/ত্যাকারী"    },
  "হত্যা":       { z: "হ"+Z+"ত্যা",        a: "হ'ত্যা",        s: "হ/ত্যা"        },
  "খুনি":         { z: "খুন"+Z+"ি",          a: "খু'নি",          s: "খু/নি"          },
  "খুন":          { z: "খ"+Z+"ুন",           a: "খ'ুন",           s: "খু/ন"           },
  "মার্ডার":     { z: "মার্"+Z+"ডার",      a: "মা'র্ডার",      s: "মার্/ডার"      },
  // মৃত্যু
  "মৃতদেহ":      { z: "মৃত"+Z+"দেহ",       a: "ম'ৃতদেহ",       s: "মৃত/দেহ"       },
  "মৃত্যুদণ্ড":  { z: "মৃত্যু"+Z+"দণ্ড",   a: "ম'ৃত্যুদণ্ড",   s: "মৃত্যু/দণ্ড"   },
  "মৃত্যু":      { z: "মৃ"+Z+"ত্যু",        a: "ম'ৃত্যু",        s: "মৃ/ত্যু"        },
  "মৃত":         { z: "মৃ"+Z+"ত",            a: "ম'ৃত",            s: "মৃ/ত"            },
  "নিহতদের":     { z: "নিহত"+Z+"দের",       a: "নি'হতদের",       s: "নি/হতদের"       },
  "নিহত":        { z: "নি"+Z+"হত",           a: "নি'হত",           s: "নি/হত"           },
  // আহত / রক্ত
  "আহত":         { z: "আ"+Z+"হত",            a: "আ'হত",            s: "আ/হত"            },
  "রক্তাক্ত":    { z: "রক্ত"+Z+"াক্ত",      a: "র'ক্তাক্ত",      s: "রক্ত/ক্ত"       },
  "রক্তপাত":     { z: "রক্ত"+Z+"পাত",        a: "র'ক্তপাত",        s: "রক্ত/পাত"        },
  "রক্ত":        { z: "র"+Z+"ক্ত",            a: "র'ক্ত",            s: "র/ক্ত"            },
  "লাশ":         { z: "লা"+Z+"শ",             a: "লা'শ",             s: "লা/শ"             },
  "জখম":         { z: "জ"+Z+"খম",             a: "জ'খম",             s: "জ/খম"             },
  // গুলি / বোমা
  "গুলিবিদ্ধ":   { z: "গুলি"+Z+"বিদ্ধ",     a: "গু'লিবিদ্ধ",     s: "গুলি/বিদ্ধ"     },
  "গুলিবর্ষণ":   { z: "গুলি"+Z+"বর্ষণ",     a: "গু'লিবর্ষণ",     s: "গুলি/বর্ষণ"     },
  "গুলি":        { z: "গু"+Z+"লি",            a: "গু'লি",            s: "গু/লি"            },
  "বোমা":        { z: "বো"+Z+"মা",            a: "বো'মা",            s: "বো/মা"            },
  "বিস্ফোরণ":    { z: "বিস্"+Z+"ফোরণ",       a: "বি'স্ফোরণ",       s: "বিস্/ফোরণ"       },
  // যৌন / ধর্ষণ
  "ধর্ষণকাণ্ড":  { z: "ধর্ষণ"+Z+"কাণ্ড",    a: "ধ'র্ষণকাণ্ড",    s: "ধর্ষণ/কাণ্ড"    },
  "ধর্ষিতা":     { z: "ধর্ষি"+Z+"তা",        a: "ধ'র্ষিতা",        s: "ধর্/ষিতা"        },
  "ধর্ষিত":      { z: "ধর্ষি"+Z+"ত",         a: "ধ'র্ষিত",         s: "ধর্/ষিত"         },
  "ধর্ষণ":       { z: "ধর্"+Z+"ষণ",          a: "ধ'র্ষণ",          s: "ধর্/ষণ"          },
  "যৌন":         { z: "যৌ"+Z+"ন",             a: "যৌ'ন",             s: "যৌ/ন"             },
  "ব্যভিচার":    { z: "ব্যভি"+Z+"চার",       a: "ব্য'ভিচার",       s: "ব্যভি/চার"       },
  // আত্মহত্যা
  "আত্মহত্যা":   { z: "আত্ম"+Z+"হত্যা",     a: "আ'ত্মহত্যা",     s: "আত্ম/হত্যা"     },
  "সুইসাইড":     { z: "সুই"+Z+"সাইড",        a: "সু'ইসাইড",        s: "সুই/সাইড"        },
  // মব / সন্ত্রাস
  "সন্ত্রাসী":   { z: "সন্ত্রা"+Z+"সী",      a: "স'ন্ত্রাসী",      s: "সন্ত্রা/সী"      },
  "সন্ত্রাস":    { z: "সন্ত্রা"+Z+"স",       a: "স'ন্ত্রাস",       s: "সন্ত্রা/স"       },
  "জঙ্গিবাদ":    { z: "জঙ্গি"+Z+"বাদ",       a: "জ'ঙ্গিবাদ",       s: "জং/গিবাদ"        },
  "জঙ্গি":       { z: "জঙ"+Z+"গি",            a: "জ'ঙ্গি",           s: "জং/গি"            },
  "মব":          { z: "ম"+Z+"ব",              a: "ম'ব",              s: "ম/ব"              },
  "দাঙ্গা":      { z: "দাঙ"+Z+"গা",           a: "দা'ঙ্গা",          s: "দাং/গা"           },
  "গ্রেফতার":    { z: "গ্রেফ"+Z+"তার",        a: "গ্রে'ফতার",        s: "গ্রেফ/তার"        },
  // গালি
  "শালা":        { z: "শা"+Z+"লা",            a: "শা'লা",            s: "শা/লা"            },
  "হারামি":      { z: "হারা"+Z+"মি",          a: "হা'রামি",          s: "হারা/মি"          },
  "কুত্তা":      { z: "কুত্"+Z+"তা",          a: "কু'ত্তা",          s: "কুত্/তা"          },
  "বেশ্যা":      { z: "বেশ্"+Z+"যা",          a: "বে'শ্যা",          s: "বেশ্/যা"          },
  "মাদারচোদ":    { z: "মাদার"+Z+"চোদ",        a: "মাদা'রচোদ",        s: "মাদার/চোদ"        },
  "চোদা":        { z: "চো"+Z+"দা",            a: "চো'দা",            s: "চো/দা"            },
  // ইংরেজি
  "terrorist":   { z: "terror"+Z+"ist",       a: "terro'rist",       s: "terror/ist"       },
  "violence":    { z: "viole"+Z+"nce",        a: "viole'nce",        s: "viole/nce"        },
  "suicide":     { z: "sui"+Z+"cide",         a: "sui'cide",         s: "sui/cide"         },
  "murder":      { z: "mur"+Z+"der",          a: "mur'der",          s: "mur/der"          },
  "blood":       { z: "blo"+Z+"od",           a: "blo'od",           s: "blo/od"           },
  "shoot":       { z: "sho"+Z+"ot",           a: "sho'ot",           s: "sho/ot"           },
  "death":       { z: "dea"+Z+"th",           a: "dea'th",           s: "dea/th"           },
  "rape":        { z: "ra"+Z+"pe",            a: "ra'pe",            s: "ra/pe"            },
  "kill":        { z: "ki"+Z+"ll",            a: "ki'll",            s: "ki/ll"            },
  "dead":        { z: "de"+Z+"ad",            a: "de'ad",            s: "de/ad"            },
  "bomb":        { z: "bo"+Z+"mb",            a: "bo'mb",            s: "bo/mb"            },
  "gun":         { z: "gu"+Z+"n",             a: "gu'n",             s: "gu/n"             },
};

function bypassText(text, pat = "zws") {
  if (!text) return text;
  let out = text;
  const keys = Object.keys(OFFLINE_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (!out.includes(k)) continue;
    let rep;
    if (pat === "slash")            rep = OFFLINE_MAP[k].s;
    else if (pat === "apostrophe")  rep = OFFLINE_MAP[k].a;
    else                            rep = OFFLINE_MAP[k].z; // ZWS default

    // Word boundary: don't replace if k is inside a larger Bengali word
    // e.g. "রাখুন" contains "খুন" — should NOT be replaced
    // Bengali chars: U+0980–U+09FF (consonants, vowels, matras)
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx  = new RegExp(`(?<![\\u0980-\\u09FF])${esc}(?![\\u0980-\\u09FF])`, "g");
    out = out.replace(rx, rep);
  }
  return out;
}

// ── SETTINGS ─────────────────────────────────────────────────
let CFG = {
  geminiKey: "", pattern: "zws", sheetUrl: "",
  deviceId: "", customWords: {}, licenseStatus: "PENDING", isOwner: false
};

async function loadCfg() {
  const r = await chrome.storage.local.get(
    ["geminiKey", "pattern", "sheetUrl", "deviceId", "customWords", "licenseStatus", "isOwner"]
  );
  if (!r.deviceId) {
    // UUID v4 format — matches OWNER_ID style in Apps Script
    r.deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const v = Math.random() * 16 | 0;
      return (c === "x" ? v : (v & 0x3 | 0x8)).toString(16).toUpperCase();
    });
    await chrome.storage.local.set({ deviceId: r.deviceId });
  }
  CFG = { ...CFG, ...r };
  return CFG;
}


// ── GEMINI API ─────────────────────────────────────────────────
// Model cascade — gemini-3.6-flash first (Aug 2026 confirmed working)
// Automatically falls back if a model is unavailable
const MODELS = [
  "gemini-3.6-flash",        // Primary — Aug 2026 production model
  "gemini-3.7-flash",        // Newest, try if 3.6 unavailable
  "gemini-3.5-flash",        // 3.x fallback
  "gemini-2.0-flash",        // Legacy fallback
  "gemini-1.5-flash",        // Last resort
];

// ── Build all auth variants to try for any key format ─────────
function authVariants(model, apiKey) {
  const url  = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const json = { "Content-Type": "application/json" };
  return [
    // 1. key as query param (standard API key format)
    { url: `${url}?key=${apiKey}`,  headers: { ...json } },
    // 2. Bearer header (OAuth / new format tokens)
    { url,  headers: { ...json, "Authorization": `Bearer ${apiKey}` } },
    // 3. x-goog-api-key header (Google SDK style)
    { url,  headers: { ...json, "x-goog-api-key": apiKey } },
  ];
}

async function callGemini(prompt, apiKey, imageBase64 = null) {
  const parts = [{ text: prompt }];

  if (imageBase64) {
    let mimeType = "image/jpeg", b64 = imageBase64;
    if (imageBase64.startsWith("data:")) {
      const m = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/s);
      if (m) { mimeType = m[1]; b64 = m[2]; }
    }
    b64 = b64.replace(/\s+/g, "");
    if (b64.length < 50) throw new Error("Image data too small");
    parts.push({ inlineData: { mimeType, data: b64 } });
  }

  const body = JSON.stringify({ contents: [{ parts }] });
  let lastErr = "";

  for (const model of MODELS) {
    const variants = authVariants(model, apiKey);

    for (const { url, headers } of variants) {
      try {
        const res  = await fetch(url, { method: "POST", headers, body });
        const data = await res.json();

        if (data.error) {
          const msg = data.error.message || "";
          // Model not available — stop trying auth variants, go to next model
          if (data.error.code === 404 ||
              msg.includes("not found") || msg.includes("not supported")) {
            lastErr = `${model}: not available`; break;
          }
          // Auth failure with this variant — try next variant
          lastErr = `${model}: ${msg}`; continue;
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, model }; // ✅ Success
      } catch (e) {
        lastErr = e.message; continue;
      }
    }
  }

  // All models + all auth methods failed
  // Give helpful error based on what we saw
  if (lastErr.includes("authentication") || lastErr.includes("credentials") ||
      lastErr.includes("UNAUTHENTICATED") || lastErr.includes("API key")) {
    throw new Error(
      "❌ API Key কাজ করছে না\n\n" +
      "সম্ভাব্য কারণ:\n" +
      "• Key টা expire হয়ে গেছে\n" +
      "• Key টা এই API-র জন্য সঠিক না\n\n" +
      "✅ নতুন key নিন:\n" +
      "aistudio.google.com/app/apikey\n" +
      "→ 'Create API Key' click করুন\n" +
      "→ Settings এ নতুন key দিন"
    );
  }
  throw new Error("সব model fail:\n" + lastErr);
}


// ── BYPASS PROMPT (avoids Gemini refusal) ─────────────────────
function bypassPrompt(text) {
  return `You are a Bengali social media content editor. Insert a single apostrophe (') inside flagged words to make them bypass content filters while keeping the full meaning intact.

Rules: খুন→খ'ুন, হত্যা→হ'ত্যা, মৃত্যু→ম'ৃত্যু, মৃত→ম'ৃত, রক্ত→র'ক্ত, লাশ→লা'শ, গুলি→গু'লি, ধর্ষণ→ধ'র্ষণ, আত্মহত্যা→আ'ত্মহত্যা, সন্ত্রাস→স'ন্ত্রাস, নিহত→নি'হত

Apply the same apostrophe rule to any other sensitive word. Keep all other words unchanged. Output ONLY the modified text.

Text: ${text}`;
}

// ── GUARD v8.1.1 LICENSE SYSTEM ───────────────────────────────
// All communication via GET query params — matches Apps Script doGet()

function genUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
  });
}

async function guardGet(url, params) {
  if (!url || !url.includes("script.google")) return null;
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  try {
    const res = await fetch(`${url}?${qs}`);
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return { ok: true }; }
  } catch { return null; }
}

// Check license — APPROVED / PENDING / DENY
async function checkLicense(sheetUrl, deviceId) {
  const r = await guardGet(sheetUrl, { action: "check", deviceId });
  const status   = r?.status   || "PENDING";
  const isOwner  = r?.isOwner  || false;
  await chrome.storage.local.set({ licenseStatus: status, isOwner });
  CFG.licenseStatus = status;
  CFG.isOwner       = isOwner;
  return { status, isOwner, isApproved: r?.isApproved || false };
}

// Register / update device in Sheet1
async function logDevice(sheetUrl, deviceId, apiKey) {
  guardGet(sheetUrl, {
    action:     "log",
    deviceId,
    deviceName: "FB Guard Pro",
    apiKey:     apiKey ? apiKey.slice(0, 10) + "***" : "",
    ua:         navigator.userAgent.slice(0, 60),
  });
}

// Log usage report to Reports sheet (fire-and-forget)
function reportUsage(sheetUrl, deviceId, type, platform) {
  if (!sheetUrl || !deviceId) return;
  guardGet(sheetUrl, { action: "report", deviceId, type, platform });
}

// logToSheet — backward compat wrapper → sends as report now
async function logToSheet(sheetUrl, payload) {
  if (!sheetUrl) return;
  reportUsage(sheetUrl, payload.deviceId || CFG.deviceId, payload.type || "bypass", payload.platform || "");
}


// ── MESSAGE LISTENER ─────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, send) => {

  // Settings — LOAD returns licenseStatus too
  if (msg.type === "LOAD_SETTINGS") {
    loadCfg().then(send); return true;
  }
  if (msg.type === "SAVE_SETTINGS") {
    chrome.storage.local.set(msg.data, async () => {
      Object.assign(CFG, msg.data);
      // If sheetUrl or apiKey changed, register device with sheet
      if ((msg.data.sheetUrl || msg.data.geminiKey) && CFG.sheetUrl && CFG.deviceId) {
        logDevice(CFG.sheetUrl, CFG.deviceId, CFG.geminiKey);
      }
      send({ ok: true });
    });
    return true;
  }

  // License check — calls Apps Script ?action=check
  if (msg.type === "LICENSE_CHECK") {
    (async () => {
      await loadCfg();
      if (!CFG.sheetUrl) return send({ status: "NO_SHEET", isApproved: false });
      const result = await checkLicense(CFG.sheetUrl, CFG.deviceId);
      send(result);
    })(); return true;
  }

  // Offline bypass
  if (msg.type === "BULK_BYPASS") {
    const pat    = msg.pattern ?? CFG.pattern ?? "zws";
    const result = bypassText(msg.text, pat);
    loadCfg().then(cfg => {
      logToSheet(cfg.sheetUrl, {
        type: "bypass", platform: msg.platform || "manual",
        original: msg.text, bypassed: result,
        pattern: pat, deviceId: cfg.deviceId,
        time: new Date().toISOString(), status: "Pending",
      });
    });
    send({ result });
    return true;
  }

  // AI Rewrite
  if (msg.type === "AI_REWRITE") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) {
          send({ result: bypassText(msg.text), source: "offline_fallback" }); return;
        }
        const { text, model } = await callGemini(bypassPrompt(msg.text), CFG.geminiKey);
        logToSheet(CFG.sheetUrl, {
          type: "ai_rewrite", original: msg.text, result: text,
          model, deviceId: CFG.deviceId,
          time: new Date().toISOString(), status: "Pending",
        });
        send({ result: text, source: "gemini", model });
      } catch (e) {
        send({ result: bypassText(msg.text), source: "offline_fallback", error: e.message });
      }
    })(); return true;
  }

  // Viral Title
  if (msg.type === "VIRAL_TITLE") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `You are a viral Bengali YouTube/Facebook content creator. Given this title or topic, suggest 5 highly viral, click-worthy Bengali titles. Make them emotional, curiosity-driven, and safe for platform policies. Just list 5 titles numbered.\n\nTopic: ${msg.text}`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // Hashtag Generator
  if (msg.type === "HASHTAG") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `Generate 20 relevant Bengali and English hashtags for this social media post/title. Mix trending and niche hashtags. Format: comma-separated.\n\nContent: ${msg.text}`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // Auto Translate
  if (msg.type === "AUTO_TRANSLATE") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `Translate this Bengali text to English. Make it natural, professional, and safe for social media platforms. Output only the translation.\n\nBengali: ${msg.text}`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // Best Time
  if (msg.type === "BEST_TIME") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `As a Bangladesh social media expert, what are the best times to post this content on Facebook and YouTube for maximum reach in Bangladesh? Give specific times in BST with reasons.\n\nContent: ${msg.text}`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // Sentiment
  if (msg.type === "SENTIMENT") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `Analyze this Bengali social media content:\n1. Sentiment: Positive/Negative/Neutral (%)\n2. Emotional tone\n3. Reach risk: HIGH/MEDIUM/LOW\n4. One improvement suggestion\n\nContent: ${msg.text}`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // Plagiarism
  if (msg.type === "PLAGIARISM") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `Analyze this Bengali content for originality:\n1. Uniqueness score (0-100%)\n2. Is it copied/templated?\n3. Flagged phrases\n4. How to make it more original\n\nContent: ${msg.text}`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // Trending
  if (msg.type === "TRENDING") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `Suggest trending hashtags for this topic popular in Bangladesh on Facebook and YouTube. Include Bengali and English hashtags, comma-separated.\n\nTopic: ${msg.text}`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // Trending Dashboard — REAL data from Google Trends Bangladesh RSS
  if (msg.type === "TRENDING_DASH") {
    (async () => {
      try {
        // ── Live from Google Trends BD ────────────────────────
        const rssUrl = "https://trends.google.com/trending/rss?geo=BD";
        const res = await fetch(rssUrl);
        const xml = await res.text();

        // Parse <title> from RSS items (skip first = feed title)
        const titles = [];
        const titleRx = /<item>[\s\S]*?<title><!\[CDATA\[(.+?)\]\]><\/title>/g;
        let m;
        while ((m = titleRx.exec(xml)) !== null) titles.push(m[1]);

        // Also try plain <title> tags (some RSS formats differ)
        if (titles.length === 0) {
          const plain = [...xml.matchAll(/<title>(?:<!\[CDATA\[)?([^\]<]+?)(?:\]\]>)?<\/title>/g)]
            .map(x => x[1].trim())
            .filter(t => t && !t.includes("Google"));
          titles.push(...plain);
        }

        if (titles.length > 0) {
          const list = titles.slice(0, 10).map((t, i) => `${i + 1}. ${t}`).join("\n");
          send({ result: `🔴 BD Live Trending (Google Trends):\n\n${list}\n\n📅 ${new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}` });
          return;
        }

        // ── Fallback: Gemini ───────────────────────────────────
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "Google Trends data পাওয়া যায়নি। API Key দিলে AI থেকে পাবেন।" });
        const prompt = `What topics are currently trending in Bangladesh on Facebook and YouTube? List top 10 trending topics with brief descriptions. Format as numbered list.`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: "🤖 AI (Gemini):\n\n" + text });

      } catch (e) {
        // Fallback to Gemini on any error
        try {
          await loadCfg();
          if (!CFG.geminiKey) return send({ error: `RSS error: ${e.message}` });
          const { text } = await callGemini(
            "What topics are currently trending in Bangladesh on Facebook and YouTube? List top 10 trending topics. Format as numbered list.",
            CFG.geminiKey
          );
          send({ result: "🤖 AI fallback:\n\n" + text });
        } catch (e2) { send({ error: e2.message }); }
      }
    })(); return true;
  }


  // Competitor
  if (msg.type === "COMPETITOR") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `Compare these content titles:\n\nMy title: ${msg.title}\nCompetitor titles: ${msg.competitor || "N/A"}\n\n1. How does my title compare?\n2. What competitors do better?\n3. How to improve my title?\n4. SEO advantage analysis`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // SEO Tags
  if (msg.type === "SEO_TAGS") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `YouTube title: "${msg.text}"\n\nGenerate:\nTAGS: (15 SEO tags, comma separated, mix Bengali+English)\nKEYWORDS: (5 most important keywords)\nDESC: (2-sentence SEO description for Bangladesh audience)`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // Fake News
  if (msg.type === "FAKE_NEWS") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) return send({ error: "API Key নেই" });
        const prompt = `Fact-check this Bengali news/claim:\n"${msg.text}"\n\nRespond in Bengali:\n1. VERDICT: FAKE / REAL / UNVERIFIABLE\n2. Confidence: X%\n3. Reason (2-3 lines)\n4. Red flags (if any)`;
        const { text } = await callGemini(prompt, CFG.geminiKey);
        logToSheet(CFG.sheetUrl, {
          type: "fake_news", content: msg.text, result: text,
          deviceId: CFG.deviceId, time: new Date().toISOString(), status: "Pending",
        });
        send({ result: text });
      } catch (e) { send({ error: e.message }); }
    })(); return true;
  }

  // Thumbnail Check — gemini-3.7-flash (best vision Aug 2026)
  if (msg.type === "THUMBNAIL_CHECK") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.geminiKey) {
          send({ result: `📦 OFFLINE\nSkin: ${msg.offlineScore?.skin ?? 0}%\nBlood: ${msg.offlineScore?.blood ?? 0}%\nRed: ${msg.offlineScore?.red ?? 0}%` });
          return;
        }

        const prompt = `Analyze this thumbnail for Facebook and YouTube policy compliance.\nOffline pixel analysis: Skin ${msg.offlineScore?.skin ?? 0}%, Blood ${msg.offlineScore?.blood ?? 0}%, Red ${msg.offlineScore?.red ?? 0}%\n\nVerdict in Bengali:\n1. FB Policy: SAFE / RISKY / UNSAFE\n2. YT Policy: SAFE / RISKY / UNSAFE\n3. Monetization: OK / LIMITED / BLOCKED\n4. One-line reason`;

        // Prepare image
        let mimeType = "image/jpeg", b64 = msg.image || "";
        if (b64.startsWith("data:")) {
          const m = b64.match(/^data:(image\/\w+);base64,(.+)$/s);
          if (m) { mimeType = m[1]; b64 = m[2]; }
        }
        b64 = b64.replace(/\s+/g, "");

        const body = JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inlineData: { mimeType, data: b64 } },
          ]}]
        });

        // Vision models: 3.7 best, 3.6 confirmed working, 2.0-flash fallback
        const VISION_MODELS = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.0-flash"];
        const HDR = { "Content-Type": "application/json" };
        let result = null, usedModel = null, lastErr = "";

        // fetchWithTimeout: 15s per call so we don't hang
        const fetchWT = (url, opts, ms = 15000) => {
          const ctrl = new AbortController();
          const tid  = setTimeout(() => ctrl.abort(), ms);
          return fetch(url, { ...opts, signal: ctrl.signal })
            .finally(() => clearTimeout(tid));
        };

        for (const vModel of VISION_MODELS) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${vModel}:generateContent?key=${CFG.geminiKey}`;
            const res  = await fetchWT(url, { method: "POST", headers: HDR, body });
            const data = await res.json();

            if (data.error) {
              lastErr = data.error.message;
              // Auth error or model not found → try next model
              continue;
            }
            const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (txt) { result = txt; usedModel = vModel; break; }
          } catch (e) {
            lastErr = e.name === "AbortError" ? `${vModel}: timeout` : e.message;
          }
        }

        if (result) {
          send({ result, model: usedModel });
        } else {
          send({ result: `❌ Vision error:\n${lastErr}` });
        }
      } catch (e) { send({ result: `❌ ${e.message}` }); }
    })(); return true;
  }

  // Sheet Approval Fetch — reads rows back from Google Apps Script
  if (msg.type === "SHEET_FETCH") {
    (async () => {
      try {
        await loadCfg();
        if (!CFG.sheetUrl) return send({ error: "Sheet URL নেই। Settings এ দিন।" });
        // Use guardGet — handles Apps Script redirects properly
        const data = await guardGet(CFG.sheetUrl, { action: "fetch" });
        if (!data) return send({ error: "Sheet থেকে data আসেনি। Apps Script deploy করা আছে?" });
        if (Array.isArray(data)) {
          send({ rows: data });
        } else {
          send({ error: "Sheet data format ঠিক নেই। sheet_script.js এ fetchRows() আছে?" });
        }
      } catch (e) {
        send({ error: "Sheet fetch error: " + e.message });
      }
    })(); return true;
  }

});
