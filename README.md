# 🛑 Filterit (Firefox Extension)

Filter any Reddit posts using customizable Filter Packs. Filterit provides a modular, powerful way to customize what you see on Reddit with advanced keyword filtering, case sensitivity controls, and pack sharing capabilities.

---

## ✨ Key Features

### � **Filter Packs System**
- **Modular Design**: Organize keywords into themed packs (AI, Politics, Sports, etc.)
- **Pack Management**: Enable/disable entire packs, expand/collapse for easy organization
- **6 Preset Packs**: Ready-to-use filters for AI, Politics, War, Sports, Movie Spoilers, and Game Spoilers

### 🔤 **Advanced Case Sensitivity**
- **Per-Keyword Control**: Toggle case sensitivity for each individual keyword with "Aa" button
- **Pack Defaults**: Set case sensitivity defaults for new keywords in each pack
- **Smart Defaults**: "AI" is case-sensitive by default, other keywords are case-insensitive

### 🔄 **Pack Sharing & Import/Export**
- **Export Packs**: Generate shareable codes for your custom filter packs
- **Import Packs**: Add community-shared packs using import codes
- **Preset Installation**: Install any of the 6 built-in preset packs

### ⏸️ **Global Controls**
- **Pause/Resume**: Global pause button to temporarily disable all filtering
- **Live Counter**: Real-time display of blocked posts count
- **Instant Updates**: Changes take effect immediately without page reload

---

## 🛠️ User Interface

### **Popup (Main Interface)**
- **Sticky Header**: Pause button and blocked posts counter always visible
- **Folder-Style Packs**: Collapsible pack containers with expand/collapse
- **Keyword Management**: Add, edit (✎), delete (🗑️), and toggle keywords
- **Case Sensitivity**: "Aa" button for each keyword (green = case-sensitive, gray = case-insensitive)
- **Pack Controls**: Rename (✎), export (📤), and manage pack settings
- **Footer Actions**: Add new packs, import packs, browse presets

### **DevTools Panel (Advanced Debugging)**
Includes a custom **Filterit** tab in DevTools (F12):
- **Live Stats**: Posts found, posts hidden, filter runs
- **Real-time Logs**: Color-coded logging with debug information
- **Manual Controls**: Run filter manually, clear logs, export data

---

## 🚀 How It Works

1. **Content Scanning**: Monitors Reddit page for new posts using MutationObserver
2. **Smart Text Extraction**: Extracts text from titles, bodies, and shadow DOM elements
3. **Case-Sensitive Filtering**: Separates keywords into case-sensitive and case-insensitive lists
4. **Real-time Hiding**: Instantly hides matching posts with visual feedback
5. **Statistics Tracking**: Counts and reports filtering activity

---

## 📦 Built-in Filter Packs

1. **AI & Tech** - AI, machine learning, technology content (AI is case-sensitive)
2. **Politics** - Political discussions and election content
3. **War & Conflict** - Military and conflict-related content  
4. **Sports** - Sports news and discussions
5. **Movie Spoilers** - Movie endings and plot discussions
6. **Video Game Spoilers** - Game story and ending spoilers

Each pack can be enabled/disabled independently and customized with your own keywords.

---

## 🖼️ Installation & Usage

### **Installation**
1. Download the extension from Firefox Add-ons (AMO) or load manually
2. Visit Reddit - the extension starts working immediately
3. Click the Filterit icon to open the popup and configure your packs

### **Basic Usage**
1. **Enable Packs**: Check the boxes next to pack names to enable filtering
2. **Manage Keywords**: Expand packs to see keywords, toggle individual ones on/off
3. **Case Sensitivity**: Click the "Aa" button next to keywords to toggle case sensitivity
4. **Add Keywords**: Type in the input field and click "+ Add" to add custom keywords
5. **Global Pause**: Use the pause button to temporarily disable all filtering

### **Advanced Features**
- **Export Packs**: Click 📤 to generate a shareable code for your pack
- **Import Packs**: Click "📥 Import" and paste a pack code to add community packs
- **Install Presets**: Click "📦 Presets" to browse and install built-in filter packs
- **DevTools Debugging**: Press F12 → **Filterit** tab for advanced monitoring

---

## 🔧 Technical Details

- **Manifest V3**: Modern Firefox extension architecture
- **Real-time Filtering**: Uses MutationObserver for dynamic content
- **Smart Text Extraction**: Handles Reddit's complex DOM structure and shadow elements
- **Persistent Storage**: All settings saved locally with browser storage API
- **Performance Optimized**: Efficient filtering with minimal Reddit performance impact

---

## 📋 Icons Included

For a polished look, the extension includes these icons:

- `icon-32.png`
- `icon-48.png`
- `icon-64.png`
- `icon-96.png`
- `icon-128.png`

---

## ☕ Support


If you enjoy using **Filterit**, consider supporting development: [Buy Me a Coffee](https://buymeacoffee.com/duabiht)

---

## 🚀 Get Started

1. Install the extension (see instructions above or on AMO).
2. Browse Reddit as usual — posts matching your custom keywords will be removed automatically.
3. Enjoy a cleaner, more relevant Reddit experience!

---

Made with ❤️ by duabiht
