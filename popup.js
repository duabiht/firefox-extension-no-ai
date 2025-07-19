const keywordInput = document.getElementById('keywordInput');
const addBtn = document.getElementById('addBtn');
const keywordList = document.getElementById('keywordList');

function renderKeywords(keywords) {
  keywordList.innerHTML = '';
  keywords.forEach((kw, idx) => {
    const li = document.createElement('li');
    li.textContent = kw;
    const rm = document.createElement('span');
    rm.textContent = '✕';
    rm.className = 'remove';
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

addBtn.onclick = addKeyword;
keywordInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addKeyword();
});

document.addEventListener('DOMContentLoaded', loadKeywords);
