const keywordInput = document.getElementById('keywordInput');
const addBtn = document.getElementById('addBtn');
const keywordList = document.getElementById('keywordList');
const defaultKeywordList = document.getElementById('defaultKeywordList');
const blockedCounter = document.getElementById('blockedCounter');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const defaultKeywords = [
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

function renderDefaultKeywords() {
  defaultKeywordList.innerHTML = '';
  defaultKeywords.forEach(kw => {
    const li = document.createElement('li');
    li.textContent = kw;
    li.className = 'default-keyword';
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
    edit.onclick = () => showEditModal(idx, kw);
    li.appendChild(edit);
    // Remove (trash) icon
    const rm = document.createElement('span');
    rm.textContent = '\uD83D\uDDD1'; // trash can emoji
    rm.className = 'remove';
    rm.title = 'Delete keyword';
    rm.onclick = () => removeKeyword(idx);
    li.appendChild(rm);
    keywordList.appendChild(li);
  });
}

function loadKeywords() {
  browser.storage.local.get({ customKeywords: [] }).then(data => {
    renderKeywords(data.customKeywords);
  });
}

function saveKeywords(keywords) {
  browser.storage.local.set({ customKeywords: keywords });
}

function addKeyword() {
  const kw = keywordInput.value.trim();
  if (!kw) return;
  browser.storage.local.get({ customKeywords: [] }).then(data => {
    if (!data.customKeywords.includes(kw)) {
      const updated = [...data.customKeywords, kw];
      saveKeywords(updated);
      renderKeywords(updated);
      keywordInput.value = '';
    }
  });
}

function removeKeyword(idx) {
  browser.storage.local.get({ customKeywords: [] }).then(data => {
    data.customKeywords.splice(idx, 1);
    saveKeywords(data.customKeywords);
    renderKeywords(data.customKeywords);
  });
}

function showEditModal(idx, oldValue) {
  editingIdx = idx;
  editInput.value = oldValue;
  editModal.style.display = 'flex';
  editInput.focus();
}

function hideEditModal() {
  editingIdx = null;
  editModal.style.display = 'none';
}

saveEditBtn.onclick = function() {
  const newValue = editInput.value.trim();
  if (!newValue) return;
  browser.storage.local.get({ customKeywords: [] }).then(data => {
    if (editingIdx !== null && editingIdx < data.customKeywords.length) {
      data.customKeywords[editingIdx] = newValue;
      saveKeywords(data.customKeywords);
      renderKeywords(data.customKeywords);
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

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  renderDefaultKeywords();
  loadKeywords();
  updateBlockedCounter();
});
