const keywordInput = document.getElementById('keywordInput');
const addBtn = document.getElementById('addBtn');
const keywordList = document.getElementById('keywordList');
const defaultKeywordList = document.getElementById('defaultKeywordList');
const blockedCounter = document.getElementById('blockedCounter');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const packsContainer = document.getElementById('packsContainer');
const pauseBtn = document.getElementById('pauseBtn');

// Data model for Filter Packs
// packs: Array<{ id, name, enabled, expanded, keywords: Array<{ text, enabled, isDefault }> }>
// globalPause: boolean

function uid() { return Math.random().toString(36).slice(2, 9); }

const INITIAL_DEFAULT_PACK = {
  id: uid(),
  name: 'AI (Default)',
  enabled: true,
  expanded: true,
  keywords: [
    { text: 'AI', enabled: true, isDefault: true },
    { text: 'artificial intelligence', enabled: true, isDefault: true },
    { text: 'chatgpt', enabled: true, isDefault: true },
    { text: 'gpt-4', enabled: true, isDefault: true },
    { text: 'openai', enabled: true, isDefault: true },
    { text: 'midjourney', enabled: true, isDefault: true },
    { text: 'dall-e', enabled: true, isDefault: true },
    { text: 'machine learning', enabled: true, isDefault: true },
    { text: 'neural network', enabled: true, isDefault: true },
    { text: 'llm', enabled: true, isDefault: true },
  ]
};

function migrateOldStorage(data) {
  // If packs already exist, skip
  if (data && Array.isArray(data.packs)) return { packs: data.packs, globalPause: !!data.globalPause };
  const defaultKeywords = data?.defaultKeywords || [];
  const customKeywords = data?.customKeywords || [];
  if (defaultKeywords.length === 0 && customKeywords.length === 0) {
    return { packs: [INITIAL_DEFAULT_PACK], globalPause: false };
  }
  const pack = {
    id: uid(),
    name: 'Migrated Keywords',
    enabled: true,
    expanded: true,
    keywords: [
      ...defaultKeywords.map(t => ({ text: t, enabled: true, isDefault: true })),
      ...customKeywords.map(t => ({ text: t, enabled: true, isDefault: false })),
    ]
  };
  return { packs: [pack], globalPause: false };
}

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

function loadState() {
  return browser.storage.local.get({ packs: null, globalPause: false, defaultKeywords: [], customKeywords: [] })
    .then(data => migrateOldStorage(data));
}

function saveState(state) {
  return browser.storage.local.set({ packs: state.packs, globalPause: state.globalPause });
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

function renderPacks(state) {
  packsContainer.innerHTML = '';
  state.packs.forEach((pack) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'pack';

    const header = document.createElement('div');
    header.className = 'pack-header';

    const expand = document.createElement('span');
    expand.className = 'expand';
    expand.textContent = pack.expanded ? '▾' : '▸';
    expand.onclick = () => {
      pack.expanded = !pack.expanded; saveState(state).then(() => renderPacks(state));
    };

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.className = 'pack-toggle';
    toggle.checked = pack.enabled;
    toggle.onchange = () => { pack.enabled = toggle.checked; saveState(state); };

    const name = document.createElement('div');
    name.className = 'pack-name';
    name.textContent = pack.name;

    const editBtn = document.createElement('button');
    editBtn.className = 'pack-edit';
    editBtn.textContent = '✎';
    editBtn.title = 'Rename pack';
    editBtn.onclick = () => openEditModal('Rename pack', pack.name, (val) => { pack.name = val; saveState(state).then(() => renderPacks(state)); });

    header.appendChild(expand);
    header.appendChild(toggle);
    header.appendChild(name);
    header.appendChild(editBtn);

    const body = document.createElement('div');
    body.className = 'pack-body' + (pack.expanded ? ' open' : '');

    const list = document.createElement('ul');
    pack.keywords.forEach((kw, idx) => {
      const li = document.createElement('li');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = kw.enabled;
      cb.onchange = () => { kw.enabled = cb.checked; saveState(state); };

      const span = document.createElement('span');
      span.className = 'kw-text';
      span.textContent = kw.text;

      const edit = document.createElement('button');
      edit.className = 'edit';
      edit.textContent = '✎';
      edit.title = 'Edit keyword';
      edit.onclick = () => openEditModal('Edit keyword', kw.text, (val) => { kw.text = val; saveState(state).then(() => renderPacks(state)); });

      const rm = document.createElement('button');
      rm.className = 'remove';
      rm.textContent = '🗑️';
      rm.title = 'Delete keyword';
      rm.onclick = () => { pack.keywords.splice(idx, 1); saveState(state).then(() => renderPacks(state)); };

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(edit);
      li.appendChild(rm);
      list.appendChild(li);
    });

    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add keyword...';
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addKw(); });

    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Add';
    const addKw = () => {
      const val = input.value.trim(); if (!val) return;
      pack.keywords.push({ text: val, enabled: true, isDefault: false });
      input.value = '';
      saveState(state).then(() => renderPacks(state));
    };
    addBtn.onclick = addKw;

    addRow.appendChild(input);
    addRow.appendChild(addBtn);

    body.appendChild(list);
    body.appendChild(addRow);

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    packsContainer.appendChild(wrapper);
  });
}

function openEditModal(label, initialValue, onSave) {
  const modal = document.getElementById('editModal');
  const input = document.getElementById('editInput');
  const save = document.getElementById('saveEditBtn');
  const cancel = document.getElementById('cancelEditBtn');
  const modalLabel = document.getElementById('modalLabel');
  modalLabel.textContent = label;
  input.value = initialValue || '';
  modal.style.display = 'flex';
  input.focus();

  const onClickSave = () => { const v = input.value.trim(); if (v) onSave(v); close(); };
  const onKey = (e) => { if (e.key === 'Enter') onClickSave(); };
  function close() {
    modal.style.display = 'none';
    save.removeEventListener('click', onClickSave);
    cancel.removeEventListener('click', close);
    input.removeEventListener('keypress', onKey);
  }
  save.addEventListener('click', onClickSave);
  cancel.addEventListener('click', close);
  input.addEventListener('keypress', onKey);
}

function addPack(state) {
  const pack = { id: uid(), name: 'New Pack', enabled: true, expanded: true, keywords: [] };
  state.packs.push(pack);
  return saveState(state).then(() => renderPacks(state));
}

function updatePauseUI(paused) {
  pauseBtn.textContent = paused ? '▶️ Paused' : '⏸️ Active';
  pauseBtn.classList.toggle('paused', paused);
  pauseBtn.classList.toggle('active', !paused);
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

function initPopup() {
  browser.storage.local.get({ globalPause: false }).then(({ globalPause }) => updatePauseUI(globalPause));
  loadState().then(state => {
    renderPacks(state);
    document.getElementById('addPackBtn').onclick = () => addPack(state);
    pauseBtn.onclick = async () => {
      const data = await browser.storage.local.get({ globalPause: false });
      const newVal = !data.globalPause;
      await browser.storage.local.set({ globalPause: newVal });
      updatePauseUI(newVal);
    };
    // Update blocked counter
    browser.storage.local.get({ blockedCount: 0 }).then(data => {
      const el = document.getElementById('blockedCounter');
      el.textContent = `Blocked posts: ${data.blockedCount}`;
    });
  });
}

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
  initPopup();
});
