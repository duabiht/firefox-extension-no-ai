# 🚀 Filterit — Clean up Reddit with smart, modular filters

[![Firefox AMO](https://img.shields.io/badge/Firefox%20AMO-Coming%20Soon-lightgrey)](#-installation-firefox)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
[![Firefox 109+](https://img.shields.io/badge/Firefox-109%2B-orange)](https://www.mozilla.org/firefox/)
[![No Tracking](https://img.shields.io/badge/Tracking-None-blue)](#-privacy--permissions)

Filterit lets you take control of Reddit. Hide posts you don’t want to see using powerful, easy-to-manage Filter Packs. Toggle whole topics on/off, fine-tune keywords with case sensitivity, and share your packs with a single code.

— Enjoy a calmer, spoiler-free, drama-free Reddit.

---

## ✨ Why Filterit?
- Reduce noise and doomscrolling
- Avoid spoilers and topics you’re tired of
- Create your own packs or use built‑in presets
- Everything runs locally — your data never leaves your browser

---

## 🔑 Key Features

- Filter Packs (modular)
  - Group keywords by theme (AI, Politics, Sports, etc.)
  - Enable/disable packs with one click, expand/collapse for clarity
  - 6 curated preset packs ready to install
- Case Sensitivity Controls
  - Per‑keyword toggle (Aa) for case‑sensitive vs case‑insensitive matching
  - Pack‑level default for new keywords
  - Smart defaults (e.g., “AI” is case‑sensitive by default)
- Shareable Packs
  - Export any pack to a compact code
  - Import packs from friends or community posts
  - Preset browser to quickly add built‑ins
- Global Controls
  - One‑click Pause/Resume for all filtering
  - Live “Blocked posts” counter
  - Changes apply instantly — no page reload needed
- DevTools Panel (for power users)
  - Live stats, logs, and manual controls in a dedicated Filterit tab

---

## 📦 Built‑in Preset Packs

- AI & Tech
- Politics
- War & Conflict
- Sports
- Movie Spoilers
- Video Game Spoilers

Presets install disabled by default so you stay in control. Customize them or create your own.

---

## 🧠 How it works

- Monitors Reddit with a MutationObserver for new content
- Extracts text from titles, bodies, and tricky nested/shadow elements
- Separates case‑sensitive and case‑insensitive keywords for accurate matches
- Hides matching posts immediately and updates stats

---

## 🛠 Installation (Firefox)

Option A — Temporary install (for local use or development):
1. Download/clone this repository
2. Open Firefox → about:debugging → This Firefox
3. Click “Load Temporary Add‑on…” and select manifest.json from this folder

Option B — From AMO: (coming soon)

---

## 🧭 Using Filterit

1. Click the Filterit icon to open the popup
2. Enable the packs you want, expand to manage keywords
3. Click “Aa” on a keyword to toggle case sensitivity
4. Add new keywords with the input + “Add”
5. Use Pause to quickly stop/start filtering
6. Export, import, or browse Presets from the footer

---

## 🔁 Share Packs

- Export: Click 📤 on a pack to copy a shareable code
- Import: Click “Import”, paste a code, and confirm
- Presets: Click “Presets” to add any of the built‑in packs

All packs are stored locally and can be edited at any time.

---

## 🔒 Privacy & Permissions

- Privacy‑first: No analytics, no trackers, no external requests
- Everything runs locally in your browser
- Permissions used:
  - storage — save your settings and packs
  - host (reddit.com) — read page content to filter posts

Minimum Firefox version: 109 (Manifest V3)

---

## 🧰 Technical

- Firefox WebExtension (Manifest V3)
- Content script with MutationObserver for dynamic pages
- Local persistence via browser.storage.local
- DevTools integration for advanced debugging

---

## 🖼 Icons

- icon‑32.png
- icon‑48.png
- icon‑96.png
- icon‑128.png

---

## 🗓 Changelog

- 3.1
  - Per‑keyword case sensitivity + pack default
  - All presets available and installed by default (disabled)
  - Pack delete added and made robust
  - Separate dialog modal for Presets/Export/Confirm to avoid UI conflicts
  - Counter stability and paused=0 behavior
- 3.0
  - Rebrand to Filterit
  - Introduced modular Filter Packs + Preset browser
  - Import/Export shareable pack codes
- 1.0
  - Initial release (basic Reddit keyword filtering)

---

## ☕ Support

If you enjoy Filterit, you can support development: https://buymeacoffee.com/duabiht

---

Made with ❤️ by duabiht
