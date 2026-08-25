// ============================================================
// FB Guard Pro — popup.js v6.0
// All tabs, Sheet URL, Custom Words, fixed Copy buttons
// ============================================================
"use strict";

// ── Tab switching ─────────────────────────────────────────────
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("on"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("on"));
    tab.classList.add("on");
    const pg = document.getElementById("p-" + tab.dataset.p);
    if (pg) pg.classList.add("on");
    if (tab.dataset.p === "bypass") loadLive();
  });
});

// ── Messaging helper ──────────────────────────────────────────
function send(type, extra = {}) {
  return new Promise(resolve =>
    chrome.runtime.sendMessage({ type, ...extra }, r => resolve(r || {}))
  );
}

// ── Output helpers ────────────────────────────────────────────
function setOut(el, text, cls = "") {
  if (typeof el === "string") el = document.getElementById(el);
  if (!el) return;
  el.textContent = text;
  el.className   = "out" + (cls ? " " + cls : "");
}

function copyText(text, btn) {
  if (!text || text.trim() === "" || text.startsWith("Output")) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "✅ Copied!";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  }).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.cssText = "position:fixed;top:-999px";
    document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); ta.remove();
    btn.textContent = "✅ Copied!";
    setTimeout(() => { btn.textContent = "📋 Copy"; }, 1500);
  });
}

function copyOut(outId, btn) {
  const el = document.getElementById(outId);
  copyText(el?.textContent || "", btn);
}

// ── Load settings ─────────────────────────────────────────────
let CFG = {};

function showLicenseStatus(status, isOwner) {
  const badge = document.getElementById("licBadge");
  const msg   = document.getElementById("licMsg");
  if (!badge) return;

  if (isOwner) {
    badge.textContent = "👑 OWNER — সবসময় Approved";
    badge.style.color = "#38bdf8";
    if (msg) msg.textContent = "আপনি এই extension-এর Owner।";
    return;
  }
  const map = {
    "APPROVED": { icon: "✅ APPROVED",  color: "#4ade80", txt: "AI সব feature চালু আছে।" },
    "PENDING":  { icon: "⏳ PENDING",   color: "#fbbf24", txt: "Owner approval-এর অপেক্ষায়। Offline bypass কাজ করবে।" },
    "DENY":     { icon: "❌ DENIED",    color: "#f87171", txt: "Access blocked। Owner-এর সাথে যোগাযোগ করুন।" },
    "NO_SHEET": { icon: "📊 No Sheet",  color: "#64748b", txt: "Sheet URL দিন Settings-এ।" },
  };
  const s = map[status] || { icon: status, color: "#94a3b8", txt: "" };
  badge.textContent = s.icon;
  badge.style.color = s.color;
  if (msg) msg.textContent = s.txt;
}

async function loadSettings() {
  CFG = await send("LOAD_SETTINGS");

  // API key status
  const keyDot = document.getElementById("keyDot");
  const keySt  = document.getElementById("keySt");
  if (CFG.geminiKey) {
    document.getElementById("apiKey").value = CFG.geminiKey;
    keyDot.className  = "dot g";
    keySt.textContent = "✅ API Key set — Gemini ready";
    keySt.style.color = "#4ade80";
  } else {
    keyDot.className = "dot r";
    keySt.textContent = "❌ API Key নেই — Offline only";
    keySt.style.color = "#f87171";
  }

  // Sheet URL
  if (CFG.sheetUrl) document.getElementById("sheetUrl").value = CFG.sheetUrl;

  // Pattern
  if (CFG.pattern) {
    document.getElementById("defPat").value  = CFG.pattern;
    document.getElementById("patSel").value  = CFG.pattern;
  } else {
    document.getElementById("defPat").value  = "zws";
    document.getElementById("patSel").value  = "zws";
  }

  // Device ID & cached license status
  const devIdEl = document.getElementById("devIdShow");
  if (devIdEl) devIdEl.textContent = CFG.deviceId || "—";
  showLicenseStatus(CFG.licenseStatus || "PENDING", CFG.isOwner || false);

  // Custom words list
  renderCustomList(CFG.customWords || {});
}


// ── Live detection from page ──────────────────────────────────
async function loadLive() {
  const { lastDetectedText: txt, lastDetectedRisks: risks, lastPlatform: plat }
    = await new Promise(r => chrome.storage.local.get(["lastDetectedText","lastDetectedRisks","lastPlatform"], r));

  const banner = document.getElementById("live-banner");
  const lRisk  = document.getElementById("live-risk");
  const lTxt   = document.getElementById("live-txt");
  const dDot   = document.getElementById("d-dot");
  const dLabel = document.getElementById("d-label");

  if (!txt) { banner.classList.remove("show"); return; }

  banner.classList.add("show");
  const pLabel = plat === "youtube" ? "🎬 YT" : "🔵 FB";

  if (risks?.length) {
    lRisk.textContent   = `⚠️ Risk: ${risks.join(", ")}`;
    lTxt.textContent    = txt.slice(0, 120) + (txt.length > 120 ? "…" : "");
    dDot.className      = "dot r";
    dLabel.textContent  = `${pLabel} — ${risks.length} risk word detected`;
    dLabel.style.color  = "#fca5a5";
  } else {
    lRisk.textContent   = "✅ Safe";
    lRisk.style.color   = "#4ade80";
    lTxt.textContent    = txt.slice(0, 80) + (txt.length > 80 ? "…" : "");
    dDot.className      = "dot g";
    dLabel.textContent  = `${pLabel} — Safe ✅`;
    dLabel.style.color  = "#4ade80";
  }

  // Pre-fill bypass input
  const bypIn = document.getElementById("bypIn");
  if (!bypIn.value) bypIn.value = txt;
}

// ── BYPASS TAB ────────────────────────────────────────────────
let origText = "";

document.getElementById("offBtn").addEventListener("click", async () => {
  const text = document.getElementById("bypIn").value.trim();
  if (!text) { setOut("bypOut", "⚠️ Text লিখুন বা paste করুন", "er"); return; }
  origText = text;
  setOut("bypOut", "⏳ Bypassing...");
  const pat = document.getElementById("patSel").value;
  const res = await send("BULK_BYPASS", { text, pattern: pat, platform: "popup" });
  setOut("bypOut", res.result || "❌ Error", res.result ? "ok" : "er");
});

document.getElementById("aiBypassBtn").addEventListener("click", async () => {
  const text = document.getElementById("bypIn").value.trim();
  if (!text) { setOut("bypOut", "⚠️ Text লিখুন বা paste করুন", "er"); return; }
  origText = text;
  setOut("bypOut", "⏳ Gemini AI দিয়ে rewrite করছে...");
  const res = await send("AI_REWRITE", { text });
  const src = res.source === "gemini" ? `🤖 AI (${res.model})` : "📦 Offline fallback";
  setOut("bypOut", res.result ? `[${src}]\n\n${res.result}` : "❌ " + (res.error || "Error"),
         res.result ? "ok" : "er");
});

document.getElementById("copyBypBtn").addEventListener("click", function () {
  copyOut("bypOut", this);
});

document.getElementById("restoreBtn").addEventListener("click", () => {
  document.getElementById("bypIn").value = origText;
  setOut("bypOut", "Output এখানে আসবে...");
});

document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("bypIn").value = "";
  setOut("bypOut", "Output এখানে আসবে...");
  origText = "";
});

// Live bypass
document.getElementById("liveBypassBtn")?.addEventListener("click", async () => {
  const { lastDetectedText: txt } = await new Promise(r =>
    chrome.storage.local.get("lastDetectedText", r));
  if (!txt) return;
  origText = txt;
  document.getElementById("bypIn").value = txt;
  setOut("bypOut", "⏳ Bypassing...");
  const res = await send("BULK_BYPASS", { text: txt, pattern: "apostrophe", platform: "live" });
  setOut("bypOut", res.result || "❌ Error", res.result ? "ok" : "er");
  // Switch to bypass page
  document.querySelector('[data-p="bypass"]').click();
});

// ── Thumbnail ─────────────────────────────────────────────────
let thumbB64 = null, offScore = { skin: 0, blood: 0, red: 0 };

document.getElementById("thumbFile").addEventListener("change", e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = Math.min(img.width, 800);
      c.height = Math.round(img.height * c.width / img.width);
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let sk = 0, re = 0, bl = 0, tot = c.width * c.height;
      for (let i = 0; i < d.length; i += 4) {
        const R = d[i], G = d[i+1], B = d[i+2];
        if (R>95&&G>40&&B>20&&R>G&&R>B) sk++;
        if (R>150&&G<100&&B<100) re++;
        if (R>180&&G<70&&B<70)  bl++;
      }
      offScore = { skin: Math.round(sk/tot*100), red: Math.round(re/tot*100), blood: Math.round(bl/tot*100) };
      thumbB64 = c.toDataURL("image/jpeg", 0.75);
      document.getElementById("thumbPrev").textContent =
        `✅ Ready — Skin: ${offScore.skin}%  Blood: ${offScore.blood}%  Red: ${offScore.red}%`;
      document.getElementById("thumbPrev").style.color = "#4ade80";
    };
    img.src = ev.target.result;
  };
  r.readAsDataURL(f);
});

document.getElementById("thumbBtn").addEventListener("click", async () => {
  if (!thumbB64) { setOut("thumbOut", "⚠️ Image select করুন আগে", "er"); return; }
  setOut("thumbOut", "⏳ Checking thumbnail...");
  const res = await send("THUMBNAIL_CHECK", { image: thumbB64, offlineScore: offScore });
  setOut("thumbOut", res.result || "❌ Error", res.result ? "ok" : "er");
});

// ── AI TAB ────────────────────────────────────────────────────
function aiBtn(btnId, type, extra = {}) {
  document.getElementById(btnId)?.addEventListener("click", async () => {
    const text = document.getElementById("aiIn").value.trim();
    if (!text) { setOut("aiOut", "⚠️ Text দিন", "er"); return; }
    setOut("aiOut", "⏳ Processing...");
    const res = await send(type, { text, ...extra });
    setOut("aiOut", res.result || "❌ " + (res.error || "Error"), res.result ? "ok" : "er");
  });
}
aiBtn("aiRewriteBtn", "AI_REWRITE");
aiBtn("viralBtn",     "VIRAL_TITLE");
aiBtn("hashtagBtn",   "HASHTAG");
aiBtn("translateBtn", "AUTO_TRANSLATE");

document.getElementById("copyAiBtn").addEventListener("click", function () {
  copyOut("aiOut", this);
});

// ── GROWTH TAB ────────────────────────────────────────────────
function growBtn(btnId, type, extra = {}) {
  document.getElementById(btnId)?.addEventListener("click", async () => {
    const text = document.getElementById("growIn").value.trim();
    if (!text) { setOut("growOut", "⚠️ Title দিন", "er"); return; }
    setOut("growOut", "⏳ Processing...");
    const res = await send(type, { text, ...extra });
    setOut("growOut", res.result || "❌ " + (res.error || "Error"), res.result ? "ok" : "er");
  });
}
growBtn("bestTimeBtn", "BEST_TIME");
growBtn("sentimentBtn","SENTIMENT");
growBtn("plagBtn",     "PLAGIARISM");
growBtn("trendBtn",    "TRENDING");

document.getElementById("compBtn")?.addEventListener("click", async () => {
  const title = document.getElementById("growIn").value.trim();
  const comp  = document.getElementById("compIn").value.trim();
  if (!title) { setOut("growOut", "⚠️ Title দিন", "er"); return; }
  setOut("growOut", "⏳ Analyzing...");
  const res = await send("COMPETITOR", { title, competitor: comp });
  setOut("growOut", res.result || "❌ " + (res.error || "Error"), res.result ? "ok" : "er");
});

document.getElementById("copyGrowBtn").addEventListener("click", function () {
  copyOut("growOut", this);
});

// ── SEO TAB ───────────────────────────────────────────────────
document.getElementById("seoBtn").addEventListener("click", async () => {
  const text = document.getElementById("seoIn").value.trim();
  if (!text) { setOut("seoOut", "⚠️ Title দিন", "er"); return; }
  setOut("seoOut", "⏳ Generating SEO...");
  const res = await send("SEO_TAGS", { text });
  setOut("seoOut", res.result || "❌ " + (res.error || "Error"), res.result ? "ok" : "er");
});

document.getElementById("copySeoBtn").addEventListener("click", function () {
  copyOut("seoOut", this);
});

// ── VERIFY TAB ────────────────────────────────────────────────
document.getElementById("fakeBtn").addEventListener("click", async () => {
  const text = document.getElementById("fakeIn").value.trim();
  if (!text) { setOut("fakeOut", "⚠️ News paste করুন", "er"); return; }
  setOut("fakeOut", "⏳ Checking fake/real...");
  const res = await send("FAKE_NEWS", { text });
  setOut("fakeOut", res.result || "❌ " + (res.error || "Error"), res.result ? "ok" : "er");
});

document.getElementById("copyFakeBtn").addEventListener("click", function () {
  copyOut("fakeOut", this);
});

document.getElementById("trendDashBtn").addEventListener("click", async () => {
  setOut("trendOut", "⏳ Loading trending...");
  const res = await send("TRENDING_DASH", {});
  setOut("trendOut", res.result || "❌ " + (res.error || "Error"), res.result ? "ok" : "er");
});

document.getElementById("copyTrendBtn").addEventListener("click", function () {
  copyOut("trendOut", this);
});

// ── CUSTOM WORDS ──────────────────────────────────────────────
function renderCustomList(cw) {
  const list = document.getElementById("cwList");
  list.innerHTML = "";
  const keys = Object.keys(cw);
  if (!keys.length) { list.innerHTML = '<small style="color:#475569">Custom words নেই</small>'; return; }
  keys.forEach(k => {
    const v = cw[k];
    const d = document.createElement("div");
    d.style.cssText = "background:#0f172a;padding:7px;border-radius:7px;margin-top:5px;font-size:11px;display:flex;justify-content:space-between;align-items:center";
    d.innerHTML = `<span style="color:#94a3b8">${k} → ${v.apostrophe} / ${v.slash}</span>
      <button data-k="${k}" style="background:#7f1d1d;color:white;border:0;border-radius:5px;padding:2px 8px;cursor:pointer;font-size:10px;margin-top:0;width:auto">X</button>`;
    d.querySelector("button").addEventListener("click", async function () {
      if (!confirm("Delete " + this.dataset.k + "?")) return;
      const s = await send("LOAD_SETTINGS");
      const cw2 = s.customWords || {};
      delete cw2[this.dataset.k];
      await send("SAVE_SETTINGS", { data: { customWords: cw2 } });
      await loadSettings();
    });
    list.appendChild(d);
  });
}

document.getElementById("addCwBtn").addEventListener("click", async () => {
  const orig  = document.getElementById("cwOrig").value.trim();
  const apo   = document.getElementById("cwApo").value.trim();
  const slash = document.getElementById("cwSlash").value.trim();
  if (!orig || !apo || !slash) { alert("সব field fill করুন"); return; }
  const s   = await send("LOAD_SETTINGS");
  const cw2 = s.customWords || {};
  cw2[orig] = { apostrophe: apo, slash };
  await send("SAVE_SETTINGS", { data: { customWords: cw2 } });
  ["cwOrig","cwApo","cwSlash"].forEach(id => { document.getElementById(id).value = ""; });
  await loadSettings();
  alert("✅ Added & Synced");
});

// ── SETTINGS ──────────────────────────────────────────────────
document.getElementById("saveKeyBtn").addEventListener("click", async () => {
  const k = document.getElementById("apiKey").value.trim();
  if (!k || k.length < 10) { alert("সঠিক API Key দিন!"); return; }
  await send("SAVE_SETTINGS", { data: { geminiKey: k } });
  await loadSettings();
  alert("✅ API Key saved!");
});

document.getElementById("saveSheetBtn").addEventListener("click", async () => {
  const u = document.getElementById("sheetUrl").value.trim();
  await send("SAVE_SETTINGS", { data: { sheetUrl: u } });
  await loadSettings();
  alert(u ? "✅ Sheet URL saved — data এখন sheet এ যাবে!" : "⚠️ Sheet URL cleared");
});

document.getElementById("savePatBtn").addEventListener("click", async () => {
  const p = document.getElementById("defPat").value;
  await send("SAVE_SETTINGS", { data: { pattern: p } });
  document.getElementById("patSel").value = p;
  alert("✅ Pattern saved: " + p);
});

// ── QUICK TEST ────────────────────────────────────────────────
const TEST = "খুন হত্যা মৃত্যু গুলি রক্ত লাশ";

document.getElementById("testOffBtn").addEventListener("click", async () => {
  setOut("testOut", "⏳ Testing...");
  const res = await send("BULK_BYPASS", { text: TEST, pattern: "zws" });
  if (res.result) {
    // ZWS is invisible — show with note
    setOut("testOut",
      `✅ ZWS mode (Invisible bypass):\nInput:  ${TEST}\nOutput: ${res.result}\n\n⚠️ Output text টা same দেখাচ্ছে কারণ ZWS invisible — কিন্তু filter bypass হচ্ছে!`,
      "ok");
  } else {
    setOut("testOut", "❌ Error", "er");
  }
});

document.getElementById("testAiBtn").addEventListener("click", async () => {
  setOut("testOut", "⏳ Testing Gemini...");
  const res = await send("AI_REWRITE", { text: TEST });
  const src = res.source === "gemini" ? `Gemini (${res.model})` : "Offline fallback";
  setOut("testOut", res.result
    ? `[${src}]\nInput:  ${TEST}\nOutput: ${res.result}`
    : "❌ " + (res.error || "Error"), res.result ? "ok" : "er");
});

// ── LICENSE CHECK BUTTON ─────────────────────────────────────
document.getElementById("checkLicBtn")?.addEventListener("click", async () => {
  const btn = document.getElementById("checkLicBtn");
  const msg = document.getElementById("licMsg");
  btn.disabled = true;
  btn.textContent = "⏳ Checking...";
  if (msg) msg.textContent = "";

  const res = await send("LICENSE_CHECK");

  btn.disabled = false;
  btn.textContent = "🔄 License Check করুন";
  showLicenseStatus(res.status || "PENDING", res.isOwner || false);
});


// ── INIT ──────────────────────────────────────────────────────
loadSettings();
loadLive();
