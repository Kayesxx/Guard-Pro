# 🛡️ FB Guard Pro — Chrome Extension

> **Facebook & YouTube restricted word bypass — Offline + Gemini AI**

![Version](https://img.shields.io/badge/version-6.2-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-Private-red)

---

## 📌 Overview

**FB Guard Pro** is a powerful Chrome Extension that helps content creators bypass Facebook and YouTube restricted word filters — without changing the meaning of your content.

It uses **Invisible Zero-Width Space (ZWS)** characters inserted at Bengali syllable boundaries, making text look identical to human readers but undetectable by platform keyword filters.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔵 Offline Bypass | Instant bypass using ZWS / Apostrophe / Slash — no API needed |
| 🤖 AI Bypass | Gemini AI rewrites content to avoid filters |
| 🎯 FB + YT Detection | Auto-detects text box on Facebook & YouTube (posts, comments, Studio, Community) |
| 📊 Trending Dashboard | Live Bangladesh trending topics from Google Trends |
| 🖼️ Thumbnail Check | AI-powered thumbnail policy analysis (FB + YT) |
| 📰 Fake News Detector | Fact-check Bengali news/claims with Gemini AI |
| 🏷️ SEO Tag Generator | YouTube SEO tags, keywords, description |
| 📈 Viral Title Generator | Viral post titles for Bangladesh audience |
| 🛡️ License System | Device approval via Google Sheets (APPROVED / PENDING / DENY) |

---

## 🚀 Installation

1. Download or clone this repository
2. Open Chrome → `chrome://extensions`
3. Enable **Developer Mode** (top right toggle)
4. Click **"Load unpacked"** → Select the extension folder

---

## ⚙️ Setup

### Gemini API Key (Required for AI features)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a free API Key
3. Extension → **Set tab** → Paste key → **Save API Key**

> Offline bypass works without any API key.

### Google Sheet License System (Optional)

1. Google Sheets → **Extensions → Apps Script**
2. Paste contents of `sheet_script.js`
3. **Deploy → New deployment → Web App → Anyone → Deploy**
4. Copy URL → Extension → **Set tab** → Sheet URL → Save

---

## 🗂️ File Structure

```
FB-Guard-Pro/
├── manifest.json        # Chrome Extension manifest v3
├── background.js        # Service worker — Gemini API, bypass logic, license
├── content.js           # Page script — detects FB/YT text boxes
├── popup.html           # Extension popup UI (7 tabs)
├── popup.js             # Popup logic and event handlers
├── icons/               # Extension icons (16, 48, 128px)
└── sheet_script.js      # Google Apps Script template (NOT in extension ZIP)
```

---

## 🔵 Bypass Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| **Invisible ZWS** ⭐ | খুন → খ​ুন (looks identical) | Best — undetectable |
| Apostrophe | খুন → খ'ুন | Visible |
| Slash | খুন → খু/ন | Visible |

---

## 🤖 Gemini Models

```
Text tasks:    gemini-3.6-flash → 3.7 → 3.5 → 2.0
Vision tasks:  gemini-3.7-flash → 3.6 → 2.0-flash
```

---

## 🛡️ License System Flow

```
User installs → Auto-registers as PENDING in owner's Sheet
Owner approves from Sheet dropdown → APPROVED
AI features unlock ✅  |  Offline bypass always works
```

---

## 📋 Tabs

| Tab | Purpose |
|-----|---------|
| **Bypass** | Main bypass — offline + AI |
| **AI** | Viral titles, hashtags, translate |
| **Growth** | Best posting time, plagiarism |
| **SEO** | YouTube tags, competitor analysis |
| **Verify** | Fake news check, trending |
| **Custom** | Custom word bypass mappings |
| **Set** | API Key, Sheet URL, settings |

---

## ⚠️ Disclaimer

For legitimate content creators discussing news topics (crime, politics, health) without being incorrectly flagged by automated filters. Do not use to spread misinformation or violate platform Terms of Service.

---

## 👤 Author

**Muhammad Kayes** — Content Creator  
YouTube: [@MuhammadKayesVines](https://youtube.com/@MuhammadKayesVines)

---

## 📄 License

Private — All rights reserved.
