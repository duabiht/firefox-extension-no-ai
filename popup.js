const keywordInput = document.getElementById('keywordInput');
const addBtn = document.getElementById('addBtn');
const keywordList = document.getElementById('keywordList');
const defaultKeywordList = document.getElementById('defaultKeywordList');
const blockedCounter = document.getElementById('blockedCounter');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const initialDefaultKeywords = [
  "AI",
  "artificial intelligence",
  "chatgpt",
  "gpt-4",
  "openai",
  "midjourney",
  "dall-e",
  "machine learning",
  "neural network",
  "llm"
];

let editingIdx = null;
let editingType = null; // 'default' or 'custom'

function initializeKeywords() {
  return browser.storage.local.get({ defaultKeywords: [], customKeywords: [] })
    .then(data => {
      // If no default keywords stored, initialize with the preset list
      if (data.defaultKeywords.length === 0) {
        browser.storage.local.set({ defaultKeywords: [...initialDefaultKeywords] });
        return { defaultKeywords: [...initialDefaultKeywords], customKeywords: data.customKeywords };
      }
      return data;
    });
}

function renderDefaultKeywords(keywords) {
  defaultKeywordList.innerHTML = '';
  keywords.forEach((kw, idx) => {
    const li = document.createElement('li');
    li.textContent = kw;
    li.className = 'default-keyword';
    // Edit (gear) icon
    const edit = document.createElement('span');
    edit.textContent = '\u2699';
    edit.className = 'edit';
    edit.title = 'Edit keyword';
    edit.onclick = () => showEditModal(idx, kw, 'default');
    li.appendChild(edit);
    // Remove (trash) icon
    const rm = document.createElement('span');
    rm.textContent = '\uD83D\uDDD1'; // trash can emoji
    rm.className = 'remove';
    rm.title = 'Delete keyword';
    rm.onclick = () => removeKeyword(idx, 'default');
    li.appendChild(rm);
    defaultKeywordList.appendChild(li);
  });
}

function renderKeywords(keywords) {
  keywordList.innerHTML = '';
  keywords.forEach((kw, idx) => {
    const li = document.createElement('li');
    li.textContent = kw;
    // Edit (gear) icon
    const edit = document.createElement('span');
    edit.textContent = '\u2699';
    edit.className = 'edit';
    edit.title = 'Edit keyword';
    edit.onclick = () => showEditModal(idx, kw, 'custom');
    li.appendChild(edit);
    // Remove (trash) icon
    const rm = document.createElement('span');
    rm.textContent = '\uD83D\uDDD1'; // trash can emoji
    rm.className = 'remove';
    rm.title = 'Delete keyword';
    rm.onclick = () => removeKeyword(idx, 'custom');
    li.appendChild(rm);
    keywordList.appendChild(li);
  });
}

function loadKeywords() {
  return initializeKeywords().then(data => {
    renderDefaultKeywords(data.defaultKeywords);
    renderKeywords(data.customKeywords);
    return data;
  });
}

function saveKeywords(keywords, type = 'custom') {
  const key = type === 'default' ? 'defaultKeywords' : 'customKeywords';
  browser.storage.local.set({ [key]: keywords });
}

function addKeyword() {
  const kw = keywordInput.value.trim();
  if (!kw) return;
  browser.storage.local.get({ customKeywords: [] }).then(data => {
    if (!data.customKeywords.includes(kw)) {
      const updated = [...data.customKeywords, kw];
      saveKeywords(updated, 'custom');
      renderKeywords(updated);
      keywordInput.value = '';
    }
  });
}

function removeKeyword(idx, type = 'custom') {
  const key = type === 'default' ? 'defaultKeywords' : 'customKeywords';
  browser.storage.local.get({ [key]: [] }).then(data => {
    const keywords = data[key];
    keywords.splice(idx, 1);
    saveKeywords(keywords, type);
    if (type === 'default') {
      renderDefaultKeywords(keywords);
    } else {
      renderKeywords(keywords);
    }
  });
}

function showEditModal(idx, oldValue, type = 'custom') {
  editingIdx = idx;
  editingType = type;
  editInput.value = oldValue;
  editModal.style.display = 'flex';
  editInput.focus();
}

function hideEditModal() {
  editingIdx = null;
  editingType = null;
  editModal.style.display = 'none';
}

saveEditBtn.onclick = function() {
  const newValue = editInput.value.trim();
  if (!newValue) return;
  const key = editingType === 'default' ? 'defaultKeywords' : 'customKeywords';
  browser.storage.local.get({ [key]: [] }).then(data => {
    const keywords = data[key];
    if (editingIdx !== null && editingIdx < keywords.length) {
      keywords[editingIdx] = newValue;
      saveKeywords(keywords, editingType);
      if (editingType === 'default') {
        renderDefaultKeywords(keywords);
      } else {
        renderKeywords(keywords);
      }
      hideEditModal();
    }
  });
};

cancelEditBtn.onclick = hideEditModal;

function updateBlockedCounter() {
  browser.storage.local.get({ blockedCount: 0 }).then(data => {
    blockedCounter.textContent = `Blocked posts: ${data.blockedCount}`;
  });
}

addBtn.onclick = addKeyword;

// Allow adding keywords with Enter key
keywordInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addKeyword();
  }
});

// Allow saving edits with Enter key
editInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    saveEditBtn.click();
  }
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  loadKeywords();
  updateBlockedCounter();
});
