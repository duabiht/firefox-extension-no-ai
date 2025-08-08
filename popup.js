// Element references for new pack-based UI
const packsContainer = document.getElementById('packsContainer');
const pauseBtn = document.getElementById('pauseBtn');

function uid() { return Math.random().toString(36).slice(2, 9); }

const INITIAL_DEFAULT_PACK = {
  id: uid(),
  name: 'AI (Default)',
  enabled: true,
  expanded: true,
  caseSensitiveDefault: false,
  keywords: [
    { text: 'AI', enabled: true, isDefault: true, caseSensitive: true },
    { text: 'artificial intelligence', enabled: true, isDefault: true, caseSensitive: false },
    { text: 'chatgpt', enabled: true, isDefault: true, caseSensitive: false },
    { text: 'gpt-4', enabled: true, isDefault: true, caseSensitive: false },
    { text: 'openai', enabled: true, isDefault: true, caseSensitive: false },
    { text: 'midjourney', enabled: true, isDefault: true, caseSensitive: false },
    { text: 'dall-e', enabled: true, isDefault: true, caseSensitive: false },
    { text: 'machine learning', enabled: true, isDefault: true, caseSensitive: false },
    { text: 'neural network', enabled: true, isDefault: true, caseSensitive: false },
    { text: 'llm', enabled: true, isDefault: true, caseSensitive: false },
  ]
};

function getDefaultPacks() {
  // Use the packs from packs.js if available
  if (typeof window !== 'undefined' && window.FilteritPacks) {
    return window.FilteritPacks.DEFAULT_PACKS.map(pack => ({
      id: uid(),
      name: pack.name,
      description: pack.description,
      enabled: pack.enabled,
      expanded: false,
      caseSensitiveDefault: pack.caseSensitiveDefault || false,
      keywords: pack.keywords.map(kw => ({ 
        text: kw.text, 
        enabled: kw.enabled, 
        isDefault: false,
        caseSensitive: kw.caseSensitive !== undefined ? kw.caseSensitive : false
      }))
    }));
  }
  return [INITIAL_DEFAULT_PACK];
}

function migrateOldStorage(data) {
  // If packs already exist, migrate case sensitivity properties
  if (data && Array.isArray(data.packs)) {
    const packs = data.packs.map(pack => {
      // Add caseSensitiveDefault if missing
      if (pack.caseSensitiveDefault === undefined) {
        pack.caseSensitiveDefault = false;
      }
      // Add caseSensitive to keywords if missing
      if (pack.keywords) {
        pack.keywords = pack.keywords.map(kw => {
          if (kw.caseSensitive === undefined) {
            // Set "AI" to case sensitive by default, others to false
            kw.caseSensitive = kw.text === "AI";
          }
          return kw;
        });
      }
      return pack;
    });
    return { packs, globalPause: !!data.globalPause };
  }
  const defaultKeywords = data?.defaultKeywords || [];
  const customKeywords = data?.customKeywords || [];
  if (defaultKeywords.length === 0 && customKeywords.length === 0) {
    return { packs: getDefaultPacks(), globalPause: false };
  }
  const pack = {
    id: uid(),
    name: 'Migrated Keywords',
    enabled: true,
    expanded: true,
    caseSensitiveDefault: false,
    keywords: [
      ...defaultKeywords.map(t => ({ text: t, enabled: true, isDefault: true, caseSensitive: t === "AI" })),
      ...customKeywords.map(t => ({ text: t, enabled: true, isDefault: false, caseSensitive: false })),
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

// Helper function to toggle pack case sensitivity default
window.togglePackCaseSensitive = function(packIndex, enabled) {
  loadState().then(state => {
    if (state.packs[packIndex]) {
      state.packs[packIndex].caseSensitiveDefault = enabled;
      saveState(state);
    }
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

    const exportBtn = document.createElement('button');
    exportBtn.className = 'pack-edit';
    exportBtn.textContent = '📤';
    exportBtn.title = 'Export pack';
    exportBtn.onclick = () => exportPack(pack);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'pack-edit';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete pack';
    deleteBtn.style.color = '#c62828';
    deleteBtn.onclick = () => {
      if (confirm(`Delete pack "${pack.name}"? This cannot be undone.`)) {
        const packIndex = state.packs.indexOf(pack);
        if (packIndex > -1) {
          state.packs.splice(packIndex, 1);
          saveState(state).then(() => renderPacks(state));
        }
      }
    };

    header.appendChild(expand);
    header.appendChild(toggle);
    header.appendChild(name);
    header.appendChild(editBtn);
    header.appendChild(exportBtn);
    header.appendChild(deleteBtn);

    const body = document.createElement('div');
    body.className = 'pack-body' + (pack.expanded ? ' open' : '');

    // Pack settings row
    const settingsRow = document.createElement('div');
    settingsRow.className = 'pack-settings';
    settingsRow.innerHTML = `
      <label>
        <input type="checkbox" ${pack.caseSensitiveDefault ? 'checked' : ''} onchange="togglePackCaseSensitive(${state.packs.indexOf(pack)}, this.checked)">
        Default case sensitive for new keywords
      </label>
    `;

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

      const caseBtn = document.createElement('button');
      caseBtn.className = 'case-btn' + (kw.caseSensitive ? ' active' : '');
      caseBtn.textContent = 'Aa';
      caseBtn.title = kw.caseSensitive ? 'Case sensitive' : 'Case insensitive';
      caseBtn.onclick = () => { 
        kw.caseSensitive = !kw.caseSensitive; 
        saveState(state).then(() => renderPacks(state)); 
      };

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
      li.appendChild(caseBtn);
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
      pack.keywords.push({ 
        text: val, 
        enabled: true, 
        isDefault: false,
        caseSensitive: pack.caseSensitiveDefault || false
      });
      input.value = '';
      saveState(state).then(() => renderPacks(state));
    };
    addBtn.onclick = addKw;

    addRow.appendChild(input);
    addRow.appendChild(addBtn);

    body.appendChild(settingsRow);
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

function exportPack(pack) {
  try {
    const code = window.FilteritPacks ? window.FilteritPacks.exportPack(pack) : btoa(JSON.stringify({
      name: pack.name,
      description: pack.description || '',
      keywords: pack.keywords.map(kw => ({ text: kw.text, enabled: kw.enabled }))
    }));
    
    openModal('Export Pack', `
      <div>Share this code:</div>
      <textarea class="export-code" readonly>${code}</textarea>
      <div style="font-size: 12px; color: #666; margin-top: 8px;">Copy and share this code with others to share your filter pack.</div>
    `, [
      { text: 'Copy to Clipboard', action: () => { navigator.clipboard.writeText(code); } },
      { text: 'Close', action: () => {} }
    ]);
  } catch (e) {
    alert('Failed to export pack: ' + e.message);
  }
}

function importPack(state) {
  openEditModal('Import Pack Code', '', (code) => {
    try {
      const imported = window.FilteritPacks ? window.FilteritPacks.importPack(code) : JSON.parse(atob(code));
      const pack = {
        id: uid(),
        name: imported.name,
        description: imported.description || '',
        enabled: true,
        expanded: true,
        keywords: imported.keywords.map(kw => ({ 
          text: kw.text, 
          enabled: kw.enabled !== false, 
          isDefault: false 
        }))
      };
      state.packs.push(pack);
      saveState(state).then(() => renderPacks(state));
    } catch (e) {
      alert('Failed to import pack: Invalid code format');
    }
  });
}

function showPresets(state) {
  const presets = window.FilteritPacks ? window.FilteritPacks.DEFAULT_PACKS : [];
  if (presets.length === 0) {
    alert('No presets available');
    return;
  }
  
  const list = presets.map(preset => `
    <div class="preset-item">
      <div class="preset-info">
        <div class="preset-name">${preset.name}</div>
        <div class="preset-desc">${preset.description}</div>
      </div>
      <button class="preset-btn" onclick="installPreset('${preset.name}')">Add</button>
    </div>
  `).join('');
  
  window.installPreset = (name) => {
    const preset = presets.find(p => p.name === name);
    if (preset) {
      const pack = {
        id: uid(),
        name: preset.name,
        description: preset.description,
        enabled: preset.enabled,
        expanded: false,
        caseSensitiveDefault: preset.caseSensitiveDefault || false,
        keywords: preset.keywords.map(kw => ({ 
          text: kw.text, 
          enabled: kw.enabled, 
          isDefault: false,
          caseSensitive: kw.caseSensitive !== undefined ? kw.caseSensitive : false
        }))
      };
      state.packs.push(pack);
      saveState(state).then(() => {
        renderPacks(state);
        document.getElementById('editModal').style.display = 'none';
      });
    }
  };
  
  openModal('Install Preset Packs', `<div class="preset-list">${list}</div>`, [
    { text: 'Close', action: () => {} }
  ]);
}

function openModal(title, content, buttons = []) {
  const modal = document.getElementById('editModal');
  const modalLabel = document.getElementById('modalLabel');
  const modalContent = modal.querySelector('.modal-content');
  
  modalLabel.textContent = title;
  modalContent.innerHTML = `
    <div>${content}</div>
    <div class="modal-actions">
      ${buttons.map((btn, i) => `<button id="modalBtn${i}">${btn.text}</button>`).join('')}
    </div>
  `;
  
  buttons.forEach((btn, i) => {
    document.getElementById(`modalBtn${i}`).onclick = () => {
      btn.action();
      modal.style.display = 'none';
    };
  });
  
  modal.style.display = 'flex';
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
    const el = document.getElementById('blockedCounter');
    if (el) {
      el.textContent = `Blocked posts: ${data.blockedCount}`;
    }
  });
}

function initPopup() {
  browser.storage.local.get({ globalPause: false }).then(({ globalPause }) => updatePauseUI(globalPause));
  loadState().then(state => {
    renderPacks(state);
    document.getElementById('addPackBtn').onclick = () => addPack(state);
    document.getElementById('importPackBtn').onclick = () => importPack(state);
    document.getElementById('presetsBtn').onclick = () => showPresets(state);
    pauseBtn.onclick = async () => {
      const data = await browser.storage.local.get({ globalPause: false });
      const newVal = !data.globalPause;
      await browser.storage.local.set({ globalPause: newVal });
      updatePauseUI(newVal);
    };
    // Update blocked counter
    updateBlockedCounter();
  });
}

// Initial load
document.addEventListener('DOMContentLoaded', initPopup);
