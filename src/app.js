// === i18n ===
var currentLang = localStorage.getItem('evolva_lang') || 'zh';

var LANG = {
  en: {
    tagline: 'self-evolving application',
    settings: 'Settings',
    importBtn: 'Import',
    exportBtn: 'Export',
    about: 'About',
    apiKey: 'API Key',
    baseUrl: 'Base URL',
    protocol: 'Protocol',
    model: 'Model',
    theme: 'Theme (Dark/Light)',
    language: 'Language',
    save: 'Save',
    cancel: 'Cancel',
    ok: 'OK',
    confirm: 'Confirm',
    placeholder: 'Enter mutation instruction...',
    logInit: 'Evolva initialized. Configure settings to begin.',
    logSettingsSaved: 'Settings saved.',
    logSettingsFailed: 'Failed to save settings: ',
    logNoMutations: 'No mutations to export',
    logExported: 'App exported ({count} versions).',
    logExportFailed: 'Export failed: ',
    logImported: 'App imported ({count} versions replayed).',
    logImportFailed: 'Import failed: ',
    logDomCaptured: 'DOM captured ({tokens} tokens, {chars} chars)',
    logLlmResponded: 'LLM responded ({chars} chars, code: {code})',
    logInjected: 'Code injected into iframe.',
    logInjectionFailed: 'Injection failed: ',
    logNoCode: 'No JavaScript code block found',
    logMutationApplied: 'Mutation applied.',
    confirmImport: 'Current session has <strong>{count}</strong> unsaved versions. Import will overwrite. Continue?',
    confirmAutoLoad: 'Previous session found (<strong>{count}</strong> versions). Restore?',
    logAutoLoaded: 'Session restored ({count} versions).',
    logAutoLoadSkipped: 'Session restore skipped.'
  },
  zh: {
    tagline: '自演化应用',
    settings: '设置',
    importBtn: '导入',
    exportBtn: '导出',
    about: '关于',
    apiKey: 'API 密钥',
    baseUrl: '基础 URL',
    protocol: '协议',
    model: '模型',
    theme: '主题（明/暗）',
    language: '语言',
    save: '保存',
    cancel: '取消',
    ok: '确定',
    confirm: '确认',
    placeholder: '输入变异指令...',
    logInit: 'Evolva 已初始化，请先配置设置。',
    logSettingsSaved: '设置已保存。',
    logSettingsFailed: '保存设置失败：',
    logNoMutations: '没有可导出的变异',
    logExported: '已导出应用（{count} 个版本）。',
    logExportFailed: '导出失败：',
    logImported: '已导入应用（{count} 个版本已回放）。',
    logImportFailed: '导入失败：',
    logDomCaptured: 'DOM 已捕获（{tokens} tokens，{chars} chars）',
    logLlmResponded: 'LLM 已响应（{chars} chars，代码：{code}）',
    logInjected: '代码已注入 iframe。',
    logInjectionFailed: '注入失败：',
    logNoCode: '未找到 JavaScript 代码块',
    logMutationApplied: '变异已应用。',
    confirmImport: '当前会话有 <strong>{count}</strong> 个版本未导出，导入将覆盖当前状态。是否继续？',
    confirmAutoLoad: '检测到上次的会话（<strong>{count}</strong> 个版本），是否恢复？',
    logAutoLoaded: '已恢复会话（{count} 个版本）。',
    logAutoLoadSkipped: '已跳过会话恢复。'
  }
};

function t(key, params) {
  var str = (LANG[currentLang] && LANG[currentLang][key]) || LANG.en[key] || key;
  if (params) {
    for (var k in params) {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
    }
  }
  return str;
}

function applyLanguage() {
  document.getElementById('menu-settings').textContent = t('settings');
  document.getElementById('menu-import').textContent = t('importBtn');
  document.getElementById('menu-export').textContent = t('exportBtn');
  document.getElementById('menu-about').textContent = t('about');
  document.querySelector('.window-header p').textContent = t('tagline');
  document.getElementById('prompt-input').placeholder = t('placeholder');
}

// === Tauri check ===
if (!window.__TAURI__) {
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#e0e0e0;font-family:monospace;background:#0f0f1a"><p>Evolva must run inside Tauri. Use: <code>cargo tauri dev</code></p></div>';
  throw new Error('Not running in Tauri');
}

var invoke = window.__TAURI__.core.invoke;

// === DOM refs ===
var mutationFrame = document.getElementById('mutation-space');
var coreWindow = document.getElementById('evolva-core');
var collapseToggle = document.getElementById('collapse-toggle');
var contextFill = document.getElementById('context-fill');
var contextText = document.getElementById('context-text');
var logEl = document.getElementById('log');
var promptEl = document.getElementById('prompt-input');
var sendBtn = document.getElementById('send-btn');
var sendArrow = document.getElementById('send-arrow');
var sendSpinner = document.getElementById('send-spinner');

var processing = false;
var mutationSpaceReady = false;

// === Mutation Space (iframe initialization) ===
async function initMutationSpace() {
  // Fetch CSS from external file
  var cssText = await fetch('style.css').then(function(r) { return r.text(); });
  var doc = mutationFrame.contentDocument;

  doc.open();
  doc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + cssText + '</style></head>' +
    '<body style="margin:0;padding:0;overflow:hidden;height:100vh;width:100vw;position:relative;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;' +
    'background:var(--bg-canvas);background-image:radial-gradient(var(--bg-dot) 1px,transparent 1px);background-size:20px 20px;color:var(--text-primary);"></body></html>');
  doc.close();

  var script = doc.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js';
  script.onload = function() {
    setupMutationHelpers();
    mutationSpaceReady = true;
  };
  doc.head.appendChild(script);

  if (document.body.classList.contains('light')) {
    doc.documentElement.classList.add('light');
    doc.body.classList.add('light');
  }
}

function setupMutationHelpers() {
  var win = mutationFrame.contentWindow;
  var doc = mutationFrame.contentDocument;
  var topZ = 100;

  win.setupDraggable = function(el) {
    win.interact(el)
      .draggable({
        allowFrom: '.window-header',
        inertia: true,
        modifiers: [win.interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })],
        listeners: {
          move: function(event) {
            var target = event.target;
            var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          }
        }
      })
      .resizable({
        edges: { left: false, right: true, bottom: true, top: false },
        listeners: {
          move: function(event) {
            var target = event.target;
            var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.deltaRect.left;
            var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.deltaRect.top;
            target.style.width = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';
            target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          }
        }
      });
  };

  win.bringToFront = function(el) {
    topZ++;
    el.style.zIndex = topZ;
    doc.querySelectorAll('.evolva-window').forEach(function(w) { w.classList.remove('active'); });
    el.classList.add('active');
  };

  var keyHandlers = new Map();
  win.onActiveKeydown = function(windowEl, handler) {
    if (!keyHandlers.has(windowEl)) keyHandlers.set(windowEl, { keydown: [], keyup: [] });
    keyHandlers.get(windowEl).keydown.push(handler);
  };
  win.onActiveKeyup = function(windowEl, handler) {
    if (!keyHandlers.has(windowEl)) keyHandlers.set(windowEl, { keydown: [], keyup: [] });
    keyHandlers.get(windowEl).keyup.push(handler);
  };

  doc.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    var activeWin = doc.querySelector('.evolva-window.active');
    if (!activeWin) return;
    var handlers = keyHandlers.get(activeWin);
    if (handlers) handlers.keydown.forEach(function(fn) { fn(e); });
  });
  doc.addEventListener('keyup', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    var activeWin = doc.querySelector('.evolva-window.active');
    if (!activeWin) return;
    var handlers = keyHandlers.get(activeWin);
    if (handlers) handlers.keyup.forEach(function(fn) { fn(e); });
  });
}

// === Theme ===
function applyTheme(light) {
  document.body.classList.toggle('light', light);
  localStorage.setItem('evolva_theme', light ? 'light' : 'dark');
  if (mutationSpaceReady) {
    var iframeDoc = mutationFrame.contentDocument;
    iframeDoc.documentElement.classList.toggle('light', light);
    iframeDoc.body.classList.toggle('light', light);
  }
}

function loadTheme() {
  var saved = localStorage.getItem('evolva_theme');
  applyTheme(saved === 'light');
}

// === Drag for evolva-core (main page only) ===
function setupDraggable(el) {
  interact(el)
    .draggable({
      allowFrom: '.window-header',
      inertia: true,
      modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })],
      listeners: {
        move: function(event) {
          var target = event.target;
          var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
          target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        }
      }
    })
    .resizable({
      edges: { left: false, right: true, bottom: true, top: false },
      listeners: {
        move: function(event) {
          var target = event.target;
          var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.deltaRect.left;
          var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.deltaRect.top;
          target.style.width = event.rect.width + 'px';
          target.style.height = event.rect.height + 'px';
          target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        }
      }
    });
}

setupDraggable(coreWindow);

function bringToFront(el) {
  el.style.zIndex = 100;
  document.querySelectorAll('.evolva-window').forEach(function(w) { w.classList.remove('active'); });
  el.classList.add('active');
}

document.querySelectorAll('.evolva-window').forEach(function(w) {
  w.addEventListener('mousedown', function() { bringToFront(w); });
});

// === Log ===
function log(actor, message) {
  var entry = document.createElement('div');
  entry.className = 'log-entry';
  var time = document.createElement('span');
  time.className = 'log-time';
  time.textContent = new Date().toLocaleTimeString();
  var actorEl = document.createElement('span');
  actorEl.className = 'log-actor ' + actor;
  actorEl.textContent = actor;
  var msg = document.createElement('span');
  msg.textContent = message;
  entry.appendChild(time);
  entry.appendChild(actorEl);
  entry.appendChild(msg);
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

// === Settings (backend-managed) ===
async function showSettingsDialog() {
  var settings;
  try { settings = await invoke('load_settings'); }
  catch (err) { settings = { api_key: '', base_url: '', model: '', protocol: 'openai' }; }

  var overlay = document.createElement('div');
  overlay.className = 'settings-overlay';
  var dlg = document.createElement('div');
  dlg.className = 'settings-dialog';
  var isLight = document.body.classList.contains('light');
  dlg.innerHTML =
    '<h3>' + t('settings') + '</h3>' +
    '<label>' + t('apiKey') + '</label>' +
    '<div style="position:relative"><input type="password" id="dlg-api-key" placeholder="sk-..." style="width:100%;padding-right:32px"><span id="dlg-key-toggle" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;opacity:0.5;font-size:13px;user-select:none">&#128065;</span></div>' +
    '<label>' + t('baseUrl') + '</label>' +
    '<input type="text" id="dlg-base-url" placeholder="https://api.openai.com/v1">' +
    '<label>' + t('protocol') + '</label>' +
    '<select id="dlg-protocol"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option></select>' +
    '<label>' + t('model') + '</label>' +
    '<input type="text" id="dlg-model" placeholder="gpt-4o">' +
    '<label>' + t('language') + '</label>' +
    '<select id="dlg-lang"><option value="zh">中文</option><option value="en">English</option></select>' +
    '<div class="theme-row"><label>' + t('theme') + '</label><div id="dlg-theme" class="theme-toggle' + (isLight ? ' light' : '') + '"></div></div>' +
    '<div style="display:flex;gap:8px;margin-top:4px">' +
    '<button id="dlg-save" style="background:var(--accent);color:var(--accent-on);border:none;padding:7px 14px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">' + t('save') + '</button>' +
    '<button id="dlg-cancel" style="background:var(--btn-bg);color:var(--text-primary);border:1px solid var(--btn-border);padding:7px 14px;border-radius:5px;cursor:pointer;font-size:12px;">' + t('cancel') + '</button>' +
    '</div>';

  overlay.appendChild(dlg);
  document.body.appendChild(overlay);

  dlg.querySelector('#dlg-api-key').value = settings.api_key || '';
  dlg.querySelector('#dlg-base-url').value = settings.base_url || '';
  dlg.querySelector('#dlg-model').value = settings.model || '';
  dlg.querySelector('#dlg-protocol').value = settings.protocol || 'openai';
  dlg.querySelector('#dlg-lang').value = currentLang;

  dlg.querySelector('#dlg-theme').addEventListener('click', function() {
    var nowLight = !document.body.classList.contains('light');
    applyTheme(nowLight);
    this.classList.toggle('light', nowLight);
  });

  dlg.querySelector('#dlg-key-toggle').addEventListener('click', function() {
    var input = dlg.querySelector('#dlg-api-key');
    var isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    this.textContent = isPassword ? '\u{1F648}' : '\u{1F441}';
  });

  dlg.querySelector('#dlg-lang').addEventListener('change', function() {
    currentLang = this.value;
    localStorage.setItem('evolva_lang', currentLang);
    applyLanguage();
  });

  dlg.querySelector('#dlg-save').addEventListener('click', async function() {
    try {
      await invoke('save_settings', {
        settings: {
          api_key: dlg.querySelector('#dlg-api-key').value.trim(),
          base_url: dlg.querySelector('#dlg-base-url').value.trim(),
          model: dlg.querySelector('#dlg-model').value.trim(),
          protocol: dlg.querySelector('#dlg-protocol').value,
        }
      });
      log('system', t('logSettingsSaved'));
      overlay.remove();
    } catch (err) {
      log('error', t('logSettingsFailed') + String(err));
    }
  });

  dlg.querySelector('#dlg-cancel').addEventListener('click', function() { overlay.remove(); });
}

// === Collapse Toggle ===
collapseToggle.addEventListener('click', function() {
  var isCollapsed = coreWindow.classList.toggle('collapsed');
  collapseToggle.innerHTML = isCollapsed ? '&#9654;' : '&#9660;';
});

// === Menu Bar ===
document.getElementById('menu-settings').addEventListener('click', function() { showSettingsDialog(); });

// === About ===
document.getElementById('menu-about').addEventListener('click', function() { showAboutDialog(); });

async function showAboutDialog() {
  var info = await invoke('get_app_info');
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';

  var dialog = document.createElement('div');
  dialog.style.cssText = 'background:var(--bg-window);border:1px solid var(--border);border-radius:10px;padding:24px 28px;min-width:280px;text-align:center;font-family:inherit;color:var(--text-primary);';
  dialog.innerHTML =
    '<h3 style="margin:0 0 4px;font-size:16px;color:var(--accent);letter-spacing:2px;">Evolva</h3>' +
    '<p style="margin:0 0 4px;font-size:12px;color:var(--text-muted);">' + t('tagline') + '</p>' +
    '<p style="margin:0 0 16px;font-size:12px;color:var(--text-muted);">v' + info.version + '</p>' +
    '<div style="border-top:1px solid var(--border);padding-top:14px;margin-bottom:18px;">' +
    '<p style="margin:0 0 4px;font-size:11px;color:var(--text-muted);">Author: ' + info.authors + '</p>' +
    '<p style="margin:0;font-size:11px;color:var(--text-muted);">&copy; 2025 Evolva. All rights reserved.</p>' +
    '</div>' +
    '<button id="about-close" style="background:var(--accent);color:var(--accent-on);border:none;padding:8px 20px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">' + t('ok') + '</button>';

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  dialog.querySelector('#about-close').addEventListener('click', function() { overlay.remove(); });
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

// === Export / Import ===
var tauriDialog = window.__TAURI__.dialog;

async function exportApp() {
  try {
    var count = await invoke('get_mutation_count');
    if (count === 0) { log('error', t('logNoMutations')); return; }

    var filePath = await tauriDialog.save({
      defaultPath: 'app.evolva.json',
      filters: [{ name: 'Evolva JSON', extensions: ['json'] }]
    });
    if (!filePath) return;

    var name = filePath.split(/[\\/]/).pop().replace('.evolva.json', '').replace('.json', '');
    await invoke('export_app', { path: filePath, name: name });
    log('system', t('logExported', { count: count }));
  } catch (err) {
    log('error', t('logExportFailed') + String(err));
  }
}

async function importApp() {
  try {
    var count = await invoke('get_mutation_count');
    if (count > 0) {
      var confirmed = await showConfirmDialog(count);
      if (!confirmed) return;
    }

    var selected = await tauriDialog.open({
      filters: [{ name: 'Evolva JSON', extensions: ['json'] }],
      multiple: false
    });
    if (!selected) return;

    var codes = await invoke('import_app', { path: selected });

    var iframeDoc = mutationFrame.contentDocument;
    while (iframeDoc.body.firstChild) iframeDoc.body.removeChild(iframeDoc.body.firstChild);
    var headStyles = iframeDoc.head.querySelectorAll('style');
    headStyles.forEach(function(style, i) { if (i > 0) style.remove(); });

    setupMutationHelpers();

    for (var i = 0; i < codes.length; i++) {
      injectCode(codes[i]);
    }
    await invoke('auto_save');
    updateContext();
    log('system', t('logImported', { count: codes.length }));
  } catch (err) {
    log('error', t('logImportFailed') + String(err));
  }
}

// === Confirm Dialog ===
function showConfirmDialog(count) {
  return new Promise(function(resolve) {
    var overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';

    var dialog = document.createElement('div');
    dialog.style.cssText = 'background:var(--bg-window);border:1px solid var(--border);border-radius:10px;padding:20px;max-width:360px;text-align:center;font-family:inherit;color:var(--text-primary);';
    dialog.innerHTML = '<p style="margin-bottom:16px;font-size:13px;line-height:1.5;">' + t('confirmImport', { count: count }) + '</p>' +
      '<div style="display:flex;gap:10px;justify-content:center;">' +
      '<button id="confirm-cancel" style="background:var(--btn-bg);color:var(--text-primary);border:1px solid var(--btn-border);padding:7px 18px;border-radius:5px;cursor:pointer;font-size:12px;">' + t('cancel') + '</button>' +
      '<button id="confirm-ok" style="background:var(--accent);color:var(--accent-on);border:none;padding:7px 18px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">' + t('confirm') + '</button>' +
      '</div>';

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    dialog.querySelector('#confirm-ok').addEventListener('click', function() { overlay.remove(); resolve(true); });
    dialog.querySelector('#confirm-cancel').addEventListener('click', function() { overlay.remove(); resolve(false); });
  });
}

document.getElementById('menu-export').addEventListener('click', exportApp);
document.getElementById('menu-import').addEventListener('click', importApp);

// === Context Bar ===
async function updateContext() {
  try {
    var dom = mutationFrame.contentDocument.documentElement.outerHTML;
    var est = await invoke('estimate_tokens', { dom: dom });
    contextFill.style.width = est.percentage + '%';
    var maxK = Math.round(est.max_tokens / 1000);
    contextText.textContent = 'context ' + est.tokens + ' / ' + maxK + 'k (' + est.percentage.toFixed(1) + '%)';
    contextFill.classList.remove('warning', 'danger');
    if (est.percentage > 96) contextFill.classList.add('danger');
    else if (est.percentage > 72) contextFill.classList.add('warning');
  } catch (_) {}
}

// === Script Injection (into iframe) ===
function injectCode(code) {
  var iframeDoc = mutationFrame.contentDocument;
  var script = iframeDoc.createElement('script');
  script.textContent = '(async () => {\n' + code + '\n})();';
  iframeDoc.body.appendChild(script);
  script.remove();
}

// === Mutation Loop ===
async function mutate() {
  if (processing || !mutationSpaceReady) return;

  var userMsg = promptEl.value.trim();
  if (!userMsg) return;

  processing = true;
  sendBtn.classList.add('loading');
  sendArrow.style.display = 'none';
  sendSpinner.style.display = 'inline';
  promptEl.value = '';
  promptEl.disabled = true;

  try {
    log('user', userMsg);

    var dom = mutationFrame.contentDocument.documentElement.outerHTML;
    log('system', t('logDomCaptured', { tokens: Math.round(dom.length / 4), chars: dom.length }));

    var result = await invoke('call_llm', {
      req: { dom: dom, instruction: userMsg },
    });

    log('system', t('logLlmResponded', {
      chars: result.raw.length,
      code: result.code ? result.code.length + ' chars' : 'none'
    }));

    if (!result.code) {
      log('error', t('logNoCode'));
      console.log('LLM raw response:', result.raw);
      return;
    }

    try {
      injectCode(result.code);
      log('system', t('logInjected'));
    } catch (injectErr) {
      log('error', t('logInjectionFailed') + String(injectErr));
      console.log('Failed code:', result.code);
      return;
    }

    await invoke('save_mutation', { instruction: userMsg, code: result.code });
    await invoke('auto_save');
    log('system', t('logMutationApplied'));
    promptEl.style.height = 'auto';
    updateContext();
  } catch (err) {
    log('error', String(err));
  } finally {
    processing = false;
    sendBtn.classList.remove('loading');
    sendArrow.style.display = 'inline';
    sendSpinner.style.display = 'none';
    promptEl.disabled = false;
  }
}

// === Event Handlers ===
sendBtn.addEventListener('click', mutate);

promptEl.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    mutate();
  }
});

promptEl.addEventListener('input', function() {
  promptEl.style.height = 'auto';
  promptEl.style.height = Math.min(promptEl.scrollHeight, 140) + 'px';
});

// === Init ===
(async function() {
  applyLanguage();
  loadTheme();
  await initMutationSpace();

  // Auto-load: check for previous session
  try {
    var result = await invoke('auto_load');
    if (result && result.length > 0) {
      var restore = await showRestoreDialog(result.length);
      if (restore) {
        for (var i = 0; i < result.length; i++) {
          injectCode(result[i]);
        }
        updateContext();
        log('system', t('logAutoLoaded', { count: result.length }));
      } else {
        log('system', t('logAutoLoadSkipped'));
      }
    }
  } catch (_) {}

  updateContext();
  promptEl.focus();
  log('system', t('logInit'));
})();

// === Restore Dialog ===
function showRestoreDialog(count) {
  return new Promise(function(resolve) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';

    var dialog = document.createElement('div');
    dialog.style.cssText = 'background:var(--bg-window);border:1px solid var(--border);border-radius:10px;padding:20px;max-width:360px;text-align:center;font-family:inherit;color:var(--text-primary);';
    dialog.innerHTML = '<p style="margin-bottom:16px;font-size:13px;line-height:1.5;">' + t('confirmAutoLoad', { count: count }) + '</p>' +
      '<div style="display:flex;gap:10px;justify-content:center;">' +
      '<button id="restore-cancel" style="background:var(--btn-bg);color:var(--text-primary);border:1px solid var(--btn-border);padding:7px 18px;border-radius:5px;cursor:pointer;font-size:12px;">' + t('cancel') + '</button>' +
      '<button id="restore-ok" style="background:var(--accent);color:var(--accent-on);border:none;padding:7px 18px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">' + t('ok') + '</button>' +
      '</div>';

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    dialog.querySelector('#restore-ok').addEventListener('click', function() { overlay.remove(); resolve(true); });
    dialog.querySelector('#restore-cancel').addEventListener('click', function() { overlay.remove(); resolve(false); });
  });
}
