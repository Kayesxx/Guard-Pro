// ============================================================
// FB Guard Pro — content.js v6.0
// FIXED: saves lastEl before panel click steals focus
// FIXED: bypass fills box, copy copies bypassed text
// ============================================================

(function () {
  "use strict";

  const IS_FB = location.hostname.includes("facebook.com");
  const IS_YT = location.hostname.includes("youtube.com") ||
                location.hostname.includes("studio.youtube.com");

  const RISK_WORDS = [
    "হত্যা","খুন","মৃত","মৃত্যু","গুলি","মব","ধর্ষণ","লাশ",
    "আত্মহত্যা","রক্ত","ধর্ষিত","নিহত","আহত","মার্ডার","খুনি",
    "সন্ত্রাস","জঙ্গি","বোমা","দাঙ্গা","যৌন","বেশ্যা",
    "kill","murder","rape","suicide","bomb","terrorist",
  ];

  function findRisks(text) {
    return RISK_WORDS.filter(w => {
      const esc = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Only match if NOT inside a larger Bengali word
      const rx = new RegExp(`(?<![\\u0980-\\u09FF])${esc}(?![\\u0980-\\u09FF])`, "i");
      return rx.test(text);
    });
  }

  // ── KEY FIX: store element BEFORE panel button steals focus ─
  // We save the element reference when we detect text in it.
  // Never rely on document.activeElement inside a button click handler.
  let savedEl   = null;   // the actual FB/YT box element
  let savedText = "";     // last text we read from it
  let bypassedText = "";  // result after bypass (for copy)

  // ── Selectors ─────────────────────────────────────────────
  const FB_SELECTORS = [
    'div[contenteditable="true"][role="textbox"]',
    'div[data-lexical-editor="true"]',
    'div[contenteditable="true"][data-contents="true"]',
    'div[contenteditable="true"]',
  ];

  // YouTube has many different editors — cover them all:
  const YT_SELECTORS = [
    // ── YouTube Studio (studio.youtube.com) ──
    '#textbox[aria-label="Add a title"]',
    'div[aria-label="Add a title"]',
    '#title-textarea #textbox',
    '#description-textarea #textbox',
    'div[aria-label="Tell viewers about your video"]',
    'ytcp-social-suggestion-input #textbox',
    'textarea#title',
    'ytcp-autosize-textarea textarea',
    '#description #textbox',
    'ytcp-form-input-container #textbox',

    // ── YouTube Community Posts (youtube.com Posts tab) ──
    '#contenteditable-root',                             // main community post box
    'div#contenteditable-root',
    'yt-formatted-string#contenteditable-root',
    '#text-input #contenteditable-root',
    'div[contenteditable="true"].yt-formatted-string',
    'ytd-backstage-post-renderer #contenteditable-root',
    '#backstage-post-form #contenteditable-root',
    'ytd-post-renderer #contenteditable-root',

    // ── YouTube Comments ──
    'yt-formatted-string[contenteditable="true"]',
    '#placeholder-area[contenteditable="true"]',
    'div[contenteditable="true"][data-yt-focus-type]',
    '#simple-box #contenteditable-root',
    'ytd-commentbox div[contenteditable="true"]',

    // ── YouTube Community tab / Post creation ──
    'div[contenteditable="plaintext-only"]',
    '#text-input div[contenteditable]',
    'iron-autogrow-textarea textarea',

    // ── Generic YouTube fallback ──
    'div[contenteditable="true"]',
  ];

  // Find ANY box with actual text — tries ALL selectors, picks first with content
  function findBox() {
    const selectors = IS_YT ? YT_SELECTORS : FB_SELECTORS;

    for (const sel of selectors) {
      // querySelectorAll — get every matching element
      let els;
      try { els = document.querySelectorAll(sel); } catch { continue; }

      for (const el of els) {
        // Skip hidden / zero-size elements
        if (!el.offsetParent && el.tagName !== "TEXTAREA") continue;
        const txt = (el.innerText || el.textContent || el.value || "").trim();
        if (txt.length > 2) return { el, text: txt };
      }
    }
    return null;
  }

  // ── UNIVERSAL TEXT INJECTION (React/Lexical safe) ─────────
  function fillBox(el, safeText) {
    if (!el) return false;
    try {
      el.focus();
      if (el.isContentEditable) {
        // execCommand works with Facebook Lexical & YouTube
        document.execCommand("selectAll", false, null);
        const ok = document.execCommand("insertText", false, safeText);
        if (!ok) {
          // Fallback for Firefox/some cases: manual Range replacement
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            sel.getRangeAt(0).deleteContents();
            sel.getRangeAt(0).insertNode(document.createTextNode(safeText));
          }
        }
        el.dispatchEvent(new InputEvent("input", { bubbles: true, data: safeText }));
      } else {
        // textarea or input — React native setter trick
        const proto = el.tagName === "TEXTAREA"
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (setter) { setter.call(el, safeText); }
        else        { el.value = safeText; }
        el.dispatchEvent(new Event("input",  { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return true;
    } catch (err) {
      console.warn("[FB Guard] fillBox error:", err);
      return false;
    }
  }

  // ── PANEL ────────────────────────────────────────────────
  let panel = null;

  function buildPanel() {
    if (panel && document.body.contains(panel)) return panel;

    const brand    = IS_YT ? "🎬 YT Guard" : "🛡️ FB Guard";
    const mainColor = IS_YT ? "#ff0000" : "#1877f2";

    const el = document.createElement("div");
    el.id = "fbg-root";
    el.innerHTML = `
<style>
#fbg-root {
  position:fixed; bottom:20px; right:20px; z-index:2147483647;
  background:#1a1d2e; color:#e2e8f0;
  padding:14px 16px; border-radius:14px;
  box-shadow:0 8px 32px rgba(0,0,0,.6);
  font:13px/1.4 system-ui,sans-serif;
  min-width:280px; max-width:340px;
  transition:opacity .2s;
}
#fbg-root * { box-sizing:border-box; }
#fbg-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
#fbg-brand { font-weight:700; font-size:13px; }
#fbg-badge {
  font-size:10px; padding:2px 10px; border-radius:20px;
  background:#2a2f45; color:#94a3b8;
}
#fbg-info {
  font-size:11px; color:#94a3b8; margin-bottom:10px;
  min-height:32px; word-break:break-word;
}
#fbg-btns { display:flex; gap:6px; flex-wrap:wrap; }
.fbg-btn {
  border:none; border-radius:8px; padding:8px 6px;
  font-size:11px; font-weight:700; cursor:pointer;
  transition:opacity .15s,transform .1s;
}
.fbg-btn:hover { opacity:.85; transform:translateY(-1px); }
#fbg-bypass { flex:1; background:${mainColor}; color:#fff; }
#fbg-ai     { flex:1; background:#7c3aed; color:#fff; }
#fbg-copy   { background:#2a2f45; color:#e2e8f0; flex:0 0 40px; }
#fbg-close  { background:transparent; color:#64748b; flex:0 0 28px; font-size:15px; line-height:1; }
#fbg-toast  {
  display:none; margin-top:8px;
  background:#0d2b1a; color:#4ade80;
  font-size:10px; padding:6px 8px; border-radius:8px;
  word-break:break-all;
}
#fbg-toast.err { background:#2b0d0d; color:#f87171; }
</style>
<div id="fbg-head">
  <span id="fbg-brand">${brand}</span>
  <span id="fbg-badge">Idle</span>
</div>
<div id="fbg-info">Post বা title লিখলে auto detect হবে...</div>
<div id="fbg-btns">
  <button class="fbg-btn" id="fbg-bypass">⚡ Bypass</button>
  <button class="fbg-btn" id="fbg-ai">🤖 AI Fix</button>
  <button class="fbg-btn" id="fbg-copy" title="Copy bypassed text">📋</button>
  <button class="fbg-btn" id="fbg-close">✕</button>
</div>
<div id="fbg-toast"></div>`;

    document.body.appendChild(el);
    panel = el;

    // ── Close ──────────────────────────────────────────────
    el.querySelector("#fbg-close").addEventListener("click", () => {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      setTimeout(() => { el.style.opacity = "1"; el.style.pointerEvents = ""; }, 15000);
    });

    // ── Copy (copies BYPASSED text, not original) ──────────
    el.querySelector("#fbg-copy").addEventListener("click", (e) => {
      e.stopPropagation();
      const textToCopy = bypassedText || savedText;
      if (!textToCopy) { showToast("❌ কোনো text নেই", true); return; }
      navigator.clipboard.writeText(textToCopy)
        .then(() => showToast("📋 Copied: " + textToCopy.slice(0, 60)))
        .catch(() => {
          // Fallback for clipboard API failure
          const ta = document.createElement("textarea");
          ta.value = textToCopy;
          ta.style.cssText = "position:fixed;top:-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
          showToast("📋 Copied!");
        });
    });

    // ── Offline Bypass ─────────────────────────────────────
    el.querySelector("#fbg-bypass").addEventListener("click", (e) => {
      e.stopPropagation();
      // Use savedEl (captured before this click stole focus)
      if (!savedEl || !savedText) {
        // Try one more time
        const found = findBox();
        if (found) { savedEl = found.el; savedText = found.text; }
        else { showToast("❌ Text box পাওয়া গেল না। কিছু লিখে তারপর click করুন।", true); return; }
      }

      const btn = el.querySelector("#fbg-bypass");
      btn.textContent = "⏳...";
      btn.disabled = true;

      chrome.runtime.sendMessage(
        { type: "BULK_BYPASS", text: savedText, pattern: "apostrophe",
          platform: IS_YT ? "youtube" : "facebook" },
        (res) => {
          btn.disabled = false;
          btn.textContent = "⚡ Bypass";

          if (!res?.result) {
            showToast("❌ Bypass error", true); return;
          }

          bypassedText = res.result; // save for copy button

          const ok = fillBox(savedEl, res.result);
          if (ok) {
            updatePanel([], res.result);
            showToast("✅ Done: " + res.result.slice(0, 70));
          } else {
            // If fillBox failed, at least show result in toast so user can copy
            showToast("⚠️ Box fill হয়নি। Copy করুন: " + res.result.slice(0, 60), true);
          }
        }
      );
    });

    // ── AI Bypass ──────────────────────────────────────────
    el.querySelector("#fbg-ai").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!savedEl || !savedText) {
        const found = findBox();
        if (found) { savedEl = found.el; savedText = found.text; }
        else { showToast("❌ Text box পাওয়া গেল না।", true); return; }
      }

      const btn = el.querySelector("#fbg-ai");
      btn.textContent = "⏳ AI...";
      btn.disabled = true;

      chrome.runtime.sendMessage({ type: "AI_REWRITE", text: savedText }, (res) => {
        btn.disabled = false;
        btn.textContent = "🤖 AI Fix";

        if (!res?.result) {
          showToast("❌ " + (res?.error || "AI Error"), true); return;
        }

        bypassedText = res.result;
        const ok = fillBox(savedEl, res.result);
        const src = res.source === "gemini" ? `🤖 AI (${res.model})` : "📦 Offline";
        if (ok) {
          updatePanel([], res.result);
          showToast(`${src}: ` + res.result.slice(0, 70));
        } else {
          showToast(`⚠️ ${src} — Copy করুন: ` + res.result.slice(0, 60), true);
        }
      });
    });

    return el;
  }

  function getEl(id) { return panel?.querySelector("#" + id); }

  function updatePanel(risks, text) {
    buildPanel();
    const badge  = getEl("fbg-badge");
    const info   = getEl("fbg-info");
    const bypass = getEl("fbg-bypass");
    if (!badge || !info) return;

    const mainColor = IS_YT ? "#ff0000" : "#1877f2";

    if (risks.length) {
      badge.textContent = `⚠️ ${risks[0]}`;
      badge.style.cssText = "font-size:10px;padding:2px 10px;border-radius:20px;background:#7f1d1d;color:#fca5a5;";
      info.innerHTML = `<b style="color:#fca5a5">⚠️ ${risks.join(", ")}</b><br>
        <span style="color:#64748b">${text.slice(0, 80)}${text.length > 80 ? "…" : ""}</span>`;
      if (bypass) bypass.style.background = "#dc2626";
    } else if (text && text.length > 3) {
      badge.textContent = "Safe ✅";
      badge.style.cssText = "font-size:10px;padding:2px 10px;border-radius:20px;background:#14532d;color:#86efac;";
      info.textContent = "✅ Safe — কোনো restricted word নেই";
      if (bypass) bypass.style.background = mainColor;
    } else {
      badge.textContent = "Scanning…";
      badge.style.cssText = "font-size:10px;padding:2px 10px;border-radius:20px;background:#2a2f45;color:#94a3b8;";
      info.textContent = IS_YT
        ? "YouTube title বা description লিখলে detect হবে"
        : "Facebook post বা comment লিখলে detect হবে";
      if (bypass) bypass.style.background = mainColor;
    }
  }

  function showToast(msg, isErr = false) {
    buildPanel();
    const t = getEl("fbg-toast");
    if (!t) return;
    t.textContent = msg;
    t.className   = isErr ? "err" : "";
    t.style.display = "block";
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.display = "none"; }, 4000);
  }

  // ── SCAN LOOP ─────────────────────────────────────────────
  let lastScannedText = "";
  let scanTimer       = null;

  function scan() {
    const found = findBox();
    if (!found) return;

    // KEY: save el+text here, BEFORE any button click can steal focus
    savedEl   = found.el;
    savedText = found.text;

    if (found.text === lastScannedText) return;
    lastScannedText = found.text;
    bypassedText    = "";  // reset when text changes

    const risks = findRisks(found.text);
    chrome.storage.local.set({
      lastDetectedText:  found.text,
      lastDetectedRisks: risks,
      lastPlatform:      IS_YT ? "youtube" : "facebook",
    });
    updatePanel(risks, found.text);
  }

  // MutationObserver — debounced
  const observer = new MutationObserver(() => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, 400);
  });

  function startObs() {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) observer.disconnect();
    else { startObs(); scan(); }
  });

  // Fast scan on typing
  document.addEventListener("input",   () => { clearTimeout(scanTimer); scanTimer = setTimeout(scan, 200); }, true);
  document.addEventListener("focusin", () => { clearTimeout(scanTimer); scanTimer = setTimeout(scan, 300); }, true);

  // Init
  setTimeout(() => {
    buildPanel();
    startObs();
    scan();
    setInterval(scan, 2000);
  }, 1500);

})();
