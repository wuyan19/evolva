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
    logAutoLoadSkipped: 'Session restore skipped.',
    tabNew: 'New Tab',
    tabDefault: 'Tab {n}',
    confirmCloseTab: 'This tab has <strong>{count}</strong> mutations. Close anyway?',
    logTabCreated: 'New tab created.',
    logTabClosed: 'Tab closed.',
    confirmRestoreAll: 'Found <strong>{count}</strong> tabs from previous session. Restore all?',
    maxTabsReached: 'Maximum {max} tabs reached.',
    sandboxPermissions: 'Sandbox Permissions',
    permNetwork: 'Network Access',
    permFsRead: 'File Read',
    permFsWrite: 'File Write',
    permTauriApi: 'Tauri API',
    permStorage: 'Persistent Storage',
    permClipboard: 'Clipboard',
    settingsBasic: 'General',
    settingsSecurity: 'Security',
    checkUpdate: 'Check for Updates',
    checking: 'Checking...',
    newVersion: 'New version {version} available',
    upToDate: 'You\'re up to date',
    checkFailed: 'Update check failed',
    downloading: 'Downloading... {percent}%',
    downloadComplete: 'Download complete, restarting...',
    downloadAndRestart: 'Download & Restart',
    goToDownload: 'Go to Download',
    updateFailed: 'Update failed, opening download page...'
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
    logAutoLoadSkipped: '已跳过会话恢复。',
    tabNew: '新建标签页',
    tabDefault: '标签 {n}',
    confirmCloseTab: '该标签页有 <strong>{count}</strong> 个变异记录。确定关闭？',
    logTabCreated: '已创建新标签页。',
    logTabClosed: '已关闭标签页。',
    confirmRestoreAll: '检测到上次会话的 <strong>{count}</strong> 个标签页。是否全部恢复？',
    maxTabsReached: '已达到最大标签页数量 {max}。',
    sandboxPermissions: '沙盒权限',
    permNetwork: '网络访问',
    permFsRead: '文件读取',
    permFsWrite: '文件写入',
    permTauriApi: 'Tauri API',
    permStorage: '持久存储',
    permClipboard: '剪贴板',
    settingsBasic: '基础设置',
    settingsSecurity: '安全设置',
    checkUpdate: '检查更新',
    checking: '检查中...',
    newVersion: '发现新版本 {version}',
    upToDate: '已是最新版本',
    checkFailed: '检查更新失败',
    downloading: '下载中... {percent}%',
    downloadComplete: '下载完成，即将重启...',
    downloadAndRestart: '下载并重启',
    goToDownload: '前往下载',
    updateFailed: '更新失败，正在打开下载页面...'
  }
};

function t(key, params) {
  var str = (LANG[currentLang] && LANG[currentLang][key]) || LANG.en[key] || key;
  if (params) {
    for (var k in params) {
      str = str.replace(new RegExp('\{' + k + '\}', 'g'), params[k]);
    }
  }
  return str;
}

// === Tauri check ===
if (!window.__TAURI__) {
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#e0e0e0;font-family:monospace;background:#0f0f1a"><p>Evolva must run inside Tauri. Use: <code>cargo tauri dev</code></p></div>';
  throw new Error('Not running in Tauri');
}

var invoke = window.__TAURI__.core.invoke;

// === Tab State ===
var MAX_TABS = 10;
var tabCounter = 0;
var tabs = {};
var activeTabId = null;
var cachedCssText = null;
var cachedInteractText = null;
var cachedSandboxText = null;

function TabState(id, name) {
  this.id = id;
  this.name = name;
  this.iframe = null;
  this.coreEl = null;
  this.processing = false;
  this.mutationSpaceReady = false;
  this.logEl = null;
  this.promptEl = null;
  this.sendBtn = null;
  this.sendArrow = null;
  this.sendSpinner = null;
  this.contextFill = null;
  this.contextText = null;
  this.collapseToggle = null;
}

function getActiveState() {
  return tabs[activeTabId] || null;
}

// === Tab Management ===

async function createTab(name) {
  var ids = Object.keys(tabs);
  if (ids.length >= MAX_TABS) {
    var st = getActiveState();
    if (st) log(st, 'error', t('maxTabsReached', { max: MAX_TABS }));
    return null;
  }

  var id = 'tab-' + (tabCounter++);
  var state = new TabState(id, name || t('tabDefault', { n: tabCounter }));

  // 创建 iframe
  var iframe = document.createElement('iframe');
  iframe.className = 'mutation-space';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  state.iframe = iframe;

  // 创建控制面板
  createCoreElement(state);

  tabs[id] = state;

  // 初始化 iframe 内容
  await initMutationSpaceForTab(state);

  // 同步主题
  if (document.body.classList.contains('light')) {
    var doc = state.iframe.contentDocument;
    if (doc) {
      doc.documentElement.classList.add('light');
      doc.body.classList.add('light');
    }
  }

  // 首个标签页自动激活
  if (!activeTabId) {
    state.iframe.style.display = '';
    state.coreEl.style.display = '';
    activeTabId = id;
  }

  updateTabBarUI();
  return state;
}

function switchTab(tabId) {
  if (tabId === activeTabId) return;
  var state = tabs[tabId];
  if (!state) return;

  // 隐藏当前活动标签页
  if (activeTabId && tabs[activeTabId]) {
    tabs[activeTabId].iframe.style.display = 'none';
    tabs[activeTabId].coreEl.style.display = 'none';
  }

  // 显示目标标签页
  state.iframe.style.display = '';
  state.coreEl.style.display = '';
  activeTabId = tabId;

  updateTabBarUI();
}

async function closeTab(tabId) {
  var state = tabs[tabId];
  if (!state) return;

  // 不允许关闭正在处理的标签页
  if (state.processing) return;

  // 至少保留一个标签页
  var ids = Object.keys(tabs);
  if (ids.length <= 1) return;

  // 从 DOM 移除
  state.iframe.remove();
  state.coreEl.remove();

  // 后端清理
  try {
    await invoke('clear_mutations', { tabId: tabId });
    await invoke('delete_tab_save', { tabId: tabId });
  } catch (_) {}

  delete tabs[tabId];

  // 如果关闭的是当前活动标签页，切换到其他标签页
  if (tabId === activeTabId) {
    var remaining = Object.keys(tabs);
    switchTab(remaining[remaining.length - 1]);
  }

  updateTabBarUI();
}

function updateTabBarUI() {
  var list = document.getElementById('tab-list');
  list.innerHTML = '';

  for (var id in tabs) {
    var state = tabs[id];
    var item = document.createElement('div');
    item.className = 'tab-item' + (id === activeTabId ? ' active' : '');
    item.setAttribute('data-tab-id', id);

    var nameSpan = document.createElement('span');
    nameSpan.className = 'tab-name';
    nameSpan.textContent = state.name;
    item.appendChild(nameSpan);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', (function(tid) {
      return function(e) { e.stopPropagation(); closeTab(tid); };
    })(id));
    item.appendChild(closeBtn);

    // 点击切换
    item.addEventListener('click', (function(tid) {
      return function() { switchTab(tid); };
    })(id));

    // 双击重命名
    nameSpan.addEventListener('dblclick', (function(tid, ns) {
      return function(e) {
        e.stopPropagation();
        var input = document.createElement('input');
        input.className = 'tab-name-input';
        input.value = tabs[tid].name;
        ns.style.display = 'none';
        ns.parentNode.insertBefore(input, ns);
        input.focus();
        input.select();

        function finishRename() {
          var val = input.value.trim();
          if (val) {
            tabs[tid].name = val;
            ns.textContent = val;
            invoke('auto_save', { tabId: tid, tabName: val });
          }
          input.remove();
          ns.style.display = '';
        }
        input.addEventListener('blur', finishRename);
        input.addEventListener('keydown', function(ev) {
          if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
          if (ev.key === 'Escape') { input.value = tabs[tid].name; input.blur(); }
        });
      };
    })(id, nameSpan));

    list.appendChild(item);
  }
}

// === Create Core Element (per-tab control panel) ===

function createCoreElement(state) {
  var core = document.createElement('div');
  core.className = 'evolva-window active evolva-core';
  core.setAttribute('data-protected', '');
  core.style.display = 'none';
  core.innerHTML =
    '<div class="window-header">' +
      '<div><h2>Evolva</h2><p></p></div>' +
      '<button class="collapse-toggle">&#9660;</button>' +
    '</div>' +
    '<div class="menu-bar">' +
      '<button class="menu-btn menu-import"></button>' +
      '<button class="menu-btn menu-export"></button>' +
    '</div>' +
    '<div class="log"></div>' +
    '<div class="input-area">' +
      '<textarea class="prompt-input" rows="1"></textarea>' +
      '<button class="send-btn"><span class="send-arrow">&uarr;</span><span class="send-spinner" style="display:none">&#x27F3;</span></button>' +
    '</div>' +
    '<div class="context-bar">' +
      '<div class="context-fill"></div>' +
      '<span class="context-text">context 0 / 128k (0%)</span>' +
    '</div>';

  state.coreEl = core;
  state.logEl = core.querySelector('.log');
  state.promptEl = core.querySelector('.prompt-input');
  state.sendBtn = core.querySelector('.send-btn');
  state.sendArrow = core.querySelector('.send-arrow');
  state.sendSpinner = core.querySelector('.send-spinner');
  state.contextFill = core.querySelector('.context-fill');
  state.contextText = core.querySelector('.context-text');
  state.collapseToggle = core.querySelector('.collapse-toggle');

  // 绑定事件
  state.sendBtn.addEventListener('click', function() { mutate(state); });
  state.promptEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mutate(state); }
  });
  state.promptEl.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 140) + 'px';
  });
  state.collapseToggle.addEventListener('click', function() {
    var collapsed = core.classList.toggle('collapsed');
    this.innerHTML = collapsed ? '&#9654;' : '&#9660;';
  });
  core.querySelector('.menu-export').addEventListener('click', function() { exportApp(state); });
  core.querySelector('.menu-import').addEventListener('click', function() { importApp(state); });

  // 设置菜单按钮文本
  core.querySelector('.menu-import').textContent = t('importBtn');
  core.querySelector('.menu-export').textContent = t('exportBtn');
  core.querySelector('.window-header p').textContent = t('tagline');
  state.promptEl.placeholder = t('placeholder');

  // 拖拽
  setupDraggable(core);

  // 焦点管理
  core.addEventListener('mousedown', function() { bringToFront(core); });

  document.body.appendChild(core);
  return core;
}

// === Mutation Space Init ===

async function initMutationSpaceForTab(state) {
  // 缓存 CSS 文本，避免重复请求
  if (!cachedCssText) {
    cachedCssText = await fetch('style.css').then(function(r) { return r.text(); });
  }
  // 预加载 sandbox.js 和 interact.js
  if (!cachedSandboxText) {
    cachedSandboxText = await fetch('sandbox.js').then(function(r) { return r.text(); });
  }
  if (!cachedInteractText) {
    cachedInteractText = await fetch('https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js')
      .then(function(r) { return r.text(); });
  }

  // 安全处理：防止 </script 截断 HTML 解析
  function safeScript(text) {
    return text.replace(/<\/script/gi, '<\\/script');
  }

  var doc = state.iframe.contentDocument;
  doc.open();
  doc.write('<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<style>' + cachedCssText + '</style>' +
    '<script>' + safeScript(cachedSandboxText) + '<\/script>' +
    '<script>' + safeScript(cachedInteractText) + '<\/script>' +
    '</head>' +
    '<body style="margin:0;padding:0;overflow:hidden;height:100vh;width:100vw;position:relative;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;' +
    'background:var(--bg-canvas);background-image:radial-gradient(var(--bg-dot) 1px,transparent 1px);background-size:20px 20px;color:var(--text-primary);"></body></html>');
  doc.close();

  // 设置 mutation helpers
  setupMutationHelpers(state);
  state.mutationSpaceReady = true;

  // 同步主题
  if (document.body.classList.contains('light')) {
    doc.documentElement.classList.add('light');
    doc.body.classList.add('light');
  }
}

function setupMutationHelpers(state) {
  var win = state.iframe.contentWindow;
  var doc = state.iframe.contentDocument;
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
  for (var id in tabs) {
    var s = tabs[id];
    if (s.mutationSpaceReady) {
      var iframeDoc = s.iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.documentElement.classList.toggle('light', light);
        iframeDoc.body.classList.toggle('light', light);
      }
    }
  }
}

// === Language ===
function applyLanguage() {
  for (var id in tabs) {
    var s = tabs[id];
    if (!s.coreEl) continue;
    s.coreEl.querySelector('.menu-import').textContent = t('importBtn');
    s.coreEl.querySelector('.menu-export').textContent = t('exportBtn');
    s.coreEl.querySelector('.window-header p').textContent = t('tagline');
    s.promptEl.placeholder = t('placeholder');
  }
  // 全局按钮文本
  document.getElementById('tab-settings').textContent = t('settings');
  document.getElementById('tab-about').textContent = t('about');
  updateTabBarUI();
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

function bringToFront(el) {
  el.style.zIndex = 100;
  document.querySelectorAll('.evolva-core').forEach(function(w) { w.classList.remove('active'); });
  el.classList.add('active');
}

// === Log ===
function log(state, actor, message) {
  if (!state || !state.logEl) return;
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
  state.logEl.appendChild(entry);
  state.logEl.scrollTop = state.logEl.scrollHeight;
}

// === Settings Dialog ===
function showSettingsDialog() {
  var state = getActiveState();
  invoke('load_settings').then(function(settings) {
    buildSettingsDialog(state, settings);
  }).catch(function() {
    buildSettingsDialog(state, { api_key: '', base_url: '', model: '', protocol: 'openai' });
  });
}

function buildSettingsDialog(state, settings) {
  var overlay = document.createElement('div');
  overlay.className = 'settings-overlay';
  var dlg = document.createElement('div');
  dlg.className = 'settings-dialog';
  var isLight = document.body.classList.contains('light');
  dlg.innerHTML =
    '<h3>' + t('settings') + '</h3>' +
    '<div class="settings-tabs">' +
      '<button class="settings-tab active" data-tab="basic">' + t('settingsBasic') + '</button>' +
      '<button class="settings-tab" data-tab="security">' + t('settingsSecurity') + '</button>' +
    '</div>' +
    '<div class="settings-panel" id="panel-basic">' +
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
    '</div>' +
    '<div class="settings-panel" id="panel-security" style="display:none">' +
      '<div class="permissions-section">' +
        '<h4>' + t('sandboxPermissions') + '</h4>' +
        '<div class="permission-row"><span>' + t('permNetwork') + '</span><div id="perm-network" class="permission-toggle' + (settings.permissions && settings.permissions.network ? ' on' : '') + '"></div></div>' +
        '<div class="permission-row"><span>' + t('permFsRead') + '</span><div id="perm-fs-read" class="permission-toggle' + (settings.permissions && settings.permissions.fs_read ? ' on' : '') + '"></div></div>' +
        '<div class="permission-row"><span>' + t('permFsWrite') + '</span><div id="perm-fs-write" class="permission-toggle' + (settings.permissions && settings.permissions.fs_write ? ' on' : '') + '"></div></div>' +
        '<div class="permission-row"><span>' + t('permStorage') + '</span><div id="perm-storage" class="permission-toggle' + (settings.permissions && settings.permissions.storage ? ' on' : '') + '"></div></div>' +
        '<div class="permission-row"><span>' + t('permClipboard') + '</span><div id="perm-clipboard" class="permission-toggle' + (settings.permissions && settings.permissions.clipboard ? ' on' : '') + '"></div></div>' +
      '</div>' +
    '</div>' +
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

  // 标签页切换
  dlg.querySelectorAll('.settings-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      dlg.querySelectorAll('.settings-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      var target = this.getAttribute('data-tab');
      dlg.querySelector('#panel-basic').style.display = target === 'basic' ? '' : 'none';
      dlg.querySelector('#panel-security').style.display = target === 'security' ? '' : 'none';
    });
  });

  dlg.querySelector('#dlg-theme').addEventListener('click', function() {
    var nowLight = !document.body.classList.contains('light');
    applyTheme(nowLight);
    this.classList.toggle('light', nowLight);
  });

  // 权限 toggle 开关事件
  var permKeys = ['network', 'fs-read', 'fs-write', 'tauri-api', 'storage', 'clipboard'];
  permKeys.forEach(function(key) {
    var toggle = dlg.querySelector('#perm-' + key);
    if (toggle) {
      toggle.addEventListener('click', function() { this.classList.toggle('on'); });
    }
  });

  dlg.querySelector('#dlg-lang').addEventListener('change', function() {
    currentLang = this.value;
    localStorage.setItem('evolva_lang', currentLang);
    applyLanguage();
  });

  dlg.querySelector('#dlg-key-toggle').addEventListener('click', function() {
    var input = dlg.querySelector('#dlg-api-key');
    var isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    this.textContent = isPassword ? '\u{1F648}' : '\u{1F441}';
  });

  dlg.querySelector('#dlg-save').addEventListener('click', async function() {
    try {
      await invoke('save_settings', {
        settings: {
          api_key: dlg.querySelector('#dlg-api-key').value.trim(),
          base_url: dlg.querySelector('#dlg-base-url').value.trim(),
          model: dlg.querySelector('#dlg-model').value.trim(),
          protocol: dlg.querySelector('#dlg-protocol').value,
          theme: document.body.classList.contains('light') ? 'light' : 'dark',
          language: currentLang,
          permissions: {
            network: !!dlg.querySelector('#perm-network').classList.contains('on'),
            fs_read: !!dlg.querySelector('#perm-fs-read').classList.contains('on'),
            fs_write: !!dlg.querySelector('#perm-fs-write').classList.contains('on'),
            storage: !!dlg.querySelector('#perm-storage').classList.contains('on'),
            clipboard: !!dlg.querySelector('#perm-clipboard').classList.contains('on'),
          }
        }
      });
      // 重新加载权限并广播到所有 iframe
      await loadPermissions();
      broadcastPermissions();
      log(state, 'system', t('logSettingsSaved'));
      overlay.remove();
    } catch (err) {
      log(state, 'error', t('logSettingsFailed') + String(err));
    }
  });

  dlg.querySelector('#dlg-cancel').addEventListener('click', function() { overlay.remove(); });
}

// === About Dialog ===
var updateStatus = 'idle'; // idle | checking | upToDate | available | downloading | downloadComplete | failed
var updateVersion = '';
var updatePercent = 0;
var updateError = '';

async function showAboutDialog() {
  var info = await invoke('get_app_info');
  updateStatus = 'idle';
  updateVersion = '';
  updatePercent = 0;
  updateError = '';

  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';

  var dialog = document.createElement('div');
  dialog.style.cssText = 'background:var(--bg-window);border:1px solid var(--border);border-radius:10px;padding:24px 28px;min-width:300px;text-align:center;font-family:inherit;color:var(--text-primary);';
  dialog.innerHTML =
    '<h3 style="margin:0 0 4px;font-size:16px;color:var(--accent);letter-spacing:2px;">Evolva</h3>' +
    '<p style="margin:0 0 4px;font-size:12px;color:var(--text-muted);">' + t('tagline') + '</p>' +
    '<p style="margin:0 0 16px;font-size:12px;color:var(--text-muted);">v' + info.version + '</p>' +
    '<div style="border-top:1px solid var(--border);padding-top:14px;margin-bottom:18px;">' +
    '<p style="margin:0 0 4px;font-size:11px;color:var(--text-muted);">Author: ' + info.authors + '</p>' +
    '<p style="margin:0;font-size:11px;color:var(--text-muted);">&copy; 2025 Evolva. All rights reserved.</p>' +
    '</div>' +
    '<div id="update-section" style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px;"></div>' +
    '<button id="about-close" style="background:var(--accent);color:var(--accent-on);border:none;padding:8px 20px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">' + t('ok') + '</button>';

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  function renderUpdateUI() {
    var section = dialog.querySelector('#update-section');
    if (!section) return;
    var html = '';
    switch (updateStatus) {
      case 'idle':
        html = '<button id="btn-check-update" style="background:var(--btn-bg);color:var(--text-primary);border:1px solid var(--btn-border);padding:6px 16px;border-radius:5px;cursor:pointer;font-size:12px;">' + t('checkUpdate') + '</button>';
        break;
      case 'checking':
        html = '<p style="font-size:12px;color:var(--text-muted);">' + t('checking') + '</p>';
        break;
      case 'upToDate':
        html = '<p style="font-size:12px;color:var(--text-muted);">' + t('upToDate') + '</p>';
        break;
      case 'available':
        html = '<p style="font-size:12px;margin-bottom:8px;">' + t('newVersion', { version: updateVersion }) + '</p>' +
          '<div style="display:flex;gap:8px;justify-content:center;">' +
          '<button id="btn-download-update" style="background:var(--accent);color:var(--accent-on);border:none;padding:6px 14px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">' + t('downloadAndRestart') + '</button>' +
          '<button id="btn-go-download" style="background:var(--btn-bg);color:var(--text-primary);border:1px solid var(--btn-border);padding:6px 14px;border-radius:5px;cursor:pointer;font-size:12px;">' + t('goToDownload') + '</button>' +
          '</div>';
        break;
      case 'downloading':
        html = '<div style="background:var(--btn-bg);border-radius:4px;height:6px;margin-bottom:6px;overflow:hidden;">' +
          '<div style="background:var(--accent);height:100%;width:' + updatePercent + '%;transition:width 0.3s;"></div></div>' +
          '<p style="font-size:12px;color:var(--text-muted);">' + t('downloading', { percent: updatePercent }) + '</p>';
        break;
      case 'downloadComplete':
        html = '<p style="font-size:12px;color:var(--text-muted);">' + t('downloadComplete') + '</p>';
        break;
      case 'failed':
        html = '<p style="font-size:12px;color:var(--color-error);">' + updateError + '</p>';
        break;
    }
    section.innerHTML = html;

    // 绑定按钮事件
    var checkBtn = dialog.querySelector('#btn-check-update');
    if (checkBtn) checkBtn.addEventListener('click', handleCheckUpdate);
    var downloadBtn = dialog.querySelector('#btn-download-update');
    if (downloadBtn) downloadBtn.addEventListener('click', handleDownloadAndInstall);
    var goBtn = dialog.querySelector('#btn-go-download');
    if (goBtn) goBtn.addEventListener('click', function() { invoke('open_github'); });
  }

  async function handleCheckUpdate() {
    updateStatus = 'checking';
    renderUpdateUI();
    try {
      var updater = window.__TAURI__.updater;
      var update = await updater.check();
      if (update) {
        updateStatus = 'available';
        updateVersion = update.version;
      } else {
        updateStatus = 'upToDate';
      }
    } catch (e) {
      updateStatus = 'failed';
      updateError = t('checkFailed');
    }
    renderUpdateUI();
  }

  async function handleDownloadAndInstall() {
    try {
      var updater = window.__TAURI__.updater;
      var update = await updater.check();
      if (!update) return;

      var downloaded = 0;
      var contentLength = 0;
      await update.downloadAndInstall(function(event) {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              updatePercent = Math.round((downloaded / contentLength) * 100);
              updateStatus = 'downloading';
              renderUpdateUI();
            }
            break;
          case 'Finished':
            updateStatus = 'downloadComplete';
            renderUpdateUI();
            break;
        }
      });
      await window.__TAURI__.process.relaunch();
    } catch (e) {
      updateStatus = 'failed';
      updateError = t('updateFailed');
      renderUpdateUI();
      invoke('open_github');
    }
  }

  renderUpdateUI();
  dialog.querySelector('#about-close').addEventListener('click', function() { overlay.remove(); });
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

// === Export / Import ===
var tauriDialog = window.__TAURI__.dialog;

async function exportApp(state) {
  try {
    var count = await invoke('get_mutation_count', { tabId: state.id });
    if (count === 0) { log(state, 'error', t('logNoMutations')); return; }

    var filePath = await tauriDialog.save({
      defaultPath: 'app.evolva.json',
      filters: [{ name: 'Evolva JSON', extensions: ['json'] }]
    });
    if (!filePath) return;

    var name = filePath.split(/[\/]/).pop().replace('.evolva.json', '').replace('.json', '');
    await invoke('export_app', { path: filePath, name: name, tabId: state.id });
    log(state, 'system', t('logExported', { count: count }));
  } catch (err) {
    log(state, 'error', t('logExportFailed') + String(err));
  }
}

async function importApp(state) {
  try {
    var count = await invoke('get_mutation_count', { tabId: state.id });
    if (count > 0) {
      var confirmed = await showConfirmDialog(count);
      if (!confirmed) return;
    }

    var selected = await tauriDialog.open({
      filters: [{ name: 'Evolva JSON', extensions: ['json'] }],
      multiple: false
    });
    if (!selected) return;

    var codes = await invoke('import_app', { path: selected, tabId: state.id });

    var iframeDoc = state.iframe.contentDocument;
    while (iframeDoc.body.firstChild) iframeDoc.body.removeChild(iframeDoc.body.firstChild);
    var headStyles = iframeDoc.head.querySelectorAll('style');
    headStyles.forEach(function(style, i) { if (i > 0) style.remove(); });

    setupMutationHelpers(state);

    for (var i = 0; i < codes.length; i++) {
      injectCode(state, codes[i]);
    }
    await invoke('auto_save', { tabId: state.id, tabName: state.name });
    updateContext(state);
    log(state, 'system', t('logImported', { count: codes.length }));
  } catch (err) {
    log(state, 'error', t('logImportFailed') + String(err));
  }
}

// === Confirm Dialog ===
function showConfirmDialog(count) {
  return new Promise(function(resolve) {
    var overlay = document.createElement('div');
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

// === Context Bar ===
async function updateContext(state) {
  if (!state || !state.mutationSpaceReady) return;
  try {
    var dom = state.iframe.contentDocument.documentElement.outerHTML;
    var est = await invoke('estimate_tokens', { dom: dom });
    state.contextFill.style.width = est.percentage + '%';
    var maxK = Math.round(est.max_tokens / 1000);
    state.contextText.textContent = 'context ' + est.tokens + ' / ' + maxK + 'k (' + est.percentage.toFixed(1) + '%)';
    state.contextFill.classList.remove('warning', 'danger');
    if (est.percentage > 96) state.contextFill.classList.add('danger');
    else if (est.percentage > 72) state.contextFill.classList.add('warning');
  } catch (_) {}
}

// === Sandbox Permission Management ===

var activePermissions = { network: false, fs_read: false, fs_write: false, storage: false, clipboard: false };

function defaultPermissions() {
  return { network: false, fs_read: false, fs_write: false, storage: false, clipboard: false };
}

async function loadPermissions() {
  try {
    var settings = await invoke('load_settings');
    if (settings.permissions) {
      activePermissions = settings.permissions;
    } else {
      activePermissions = defaultPermissions();
    }
  } catch (_) {
    activePermissions = defaultPermissions();
  }
}

function broadcastPermissions() {
  for (var tabId in tabs) {
    var win = tabs[tabId].iframe.contentWindow;
    if (win) {
      win.postMessage({ type: 'evolva-permissions', permissions: activePermissions }, '*');
    }
  }
}

// === Sandbox postMessage Handler ===

function sandboxSendResponse(source, id, success, data, error) {
  source.postMessage({
    type: 'evolva-response',
    id: id,
    success: success,
    data: data || null,
    error: error || null
  }, '*');
}

function handleSandboxFetch(source, id, payload) {
  console.log('[sandbox] fetch request:', payload.url, 'network permission:', activePermissions.network);
  if (!activePermissions.network) {
    sandboxSendResponse(source, id, false, null, 'Permission denied: network');
    return;
  }
  // 通过 Rust 后端代理请求，绕过浏览器 CORS
  invoke('sandbox_proxy_fetch', {
    url: payload.url,
    method: payload.method || 'GET',
    headers: payload.headers || {},
    body: payload.body || null
  }).then(function (data) {
    console.log('[sandbox] fetch success:', data.status, data.body ? data.body.length : 0, 'chars');
    sandboxSendResponse(source, id, true, data);
  }).catch(function (err) {
    console.log('[sandbox] fetch error:', String(err));
    sandboxSendResponse(source, id, false, null, String(err));
  });
}

function handleSandboxImport(source, id, payload) {
  if (!activePermissions.network) {
    sandboxSendResponse(source, id, false, null, 'Permission denied: network');
    return;
  }
  var moduleName = payload.module;
  var url = 'https://esm.sh/' + moduleName + '?bundle';
  // 通过 Rust 后端下载模块源码，绕过 CORS
  invoke('sandbox_proxy_fetch', {
    url: url,
    method: 'GET',
    headers: {},
    body: null
  }).then(function (data) {
    if (!data.ok) throw new Error('Module not found: ' + moduleName);
    sandboxSendResponse(source, id, true, { source: data.body });
  }).catch(function (err) {
    sandboxSendResponse(source, id, false, null, String(err));
  });
}

function handleSandboxInvoke(source, id, payload) {
  // 白名单过滤：只允许安全的命令（无需额外权限开关，白名单本身就是安全边界）
  var allowedCommands = {
    'get_app_info': true,
    'estimate_tokens': true,
    'sandbox_read_file': true,
    'sandbox_write_file': true,
    'sandbox_proxy_fetch': true,
    'sandbox_store_get': true,
    'sandbox_store_set': true
  };
  var cmd = payload.command;
  if (!allowedCommands[cmd]) {
    sandboxSendResponse(source, id, false, null, 'Command not allowed: ' + cmd);
    return;
  }
  invoke(cmd, payload.args).then(function (result) {
    sandboxSendResponse(source, id, true, result);
  }).catch(function (err) {
    sandboxSendResponse(source, id, false, null, String(err));
  });
}

function handleSandboxFsRead(source, id, payload) {
  if (!activePermissions.fs_read) {
    sandboxSendResponse(source, id, false, null, 'Permission denied: fs-read');
    return;
  }
  invoke('sandbox_read_file', { path: payload.path }).then(function (result) {
    sandboxSendResponse(source, id, true, result);
  }).catch(function (err) {
    sandboxSendResponse(source, id, false, null, String(err));
  });
}

function handleSandboxFsWrite(source, id, payload) {
  if (!activePermissions.fs_write) {
    sandboxSendResponse(source, id, false, null, 'Permission denied: fs-write');
    return;
  }
  invoke('sandbox_write_file', { path: payload.path, content: payload.content }).then(function () {
    sandboxSendResponse(source, id, true, null);
  }).catch(function (err) {
    sandboxSendResponse(source, id, false, null, String(err));
  });
}

function handleSandboxStorage(source, id, payload) {
  if (!activePermissions.storage) {
    sandboxSendResponse(source, id, false, null, 'Permission denied: storage');
    return;
  }
  var tabId = activeTabId;
  if (payload.action === 'get') {
    invoke('sandbox_store_get', { tabId: tabId, key: payload.key }).then(function (result) {
      sandboxSendResponse(source, id, true, result);
    }).catch(function (err) {
      sandboxSendResponse(source, id, false, null, String(err));
    });
  } else if (payload.action === 'set') {
    invoke('sandbox_store_set', { tabId: tabId, key: payload.key, value: payload.value }).then(function () {
      sandboxSendResponse(source, id, true, null);
    }).catch(function (err) {
      sandboxSendResponse(source, id, false, null, String(err));
    });
  } else if (payload.action === 'delete') {
    invoke('sandbox_store_set', { tabId: tabId, key: payload.key, value: null }).then(function () {
      sandboxSendResponse(source, id, true, null);
    }).catch(function (err) {
      sandboxSendResponse(source, id, false, null, String(err));
    });
  }
}

function handleSandboxClipboard(source, id, payload) {
  if (!activePermissions.clipboard) {
    sandboxSendResponse(source, id, false, null, 'Permission denied: clipboard');
    return;
  }
  if (payload.action === 'read') {
    navigator.clipboard.readText().then(function (text) {
      sandboxSendResponse(source, id, true, text);
    }).catch(function (err) {
      sandboxSendResponse(source, id, false, null, String(err));
    });
  } else if (payload.action === 'write') {
    navigator.clipboard.writeText(payload.text).then(function () {
      sandboxSendResponse(source, id, true, null);
    }).catch(function (err) {
      sandboxSendResponse(source, id, false, null, String(err));
    });
  }
}

// parent 端 postMessage 监听
window.addEventListener('message', function (event) {
  var data = event.data;
  if (!data || data.type !== 'evolva-request') return;

  var source = event.source;
  var id = data.id;
  var channel = data.channel;
  var payload = data.payload;

  switch (channel) {
    case 'fetch': handleSandboxFetch(source, id, payload); break;
    case 'import': handleSandboxImport(source, id, payload); break;
    case 'invoke': handleSandboxInvoke(source, id, payload); break;
    case 'fs-read': handleSandboxFsRead(source, id, payload); break;
    case 'fs-write': handleSandboxFsWrite(source, id, payload); break;
    case 'storage': handleSandboxStorage(source, id, payload); break;
    case 'clipboard': handleSandboxClipboard(source, id, payload); break;
    default:
      sandboxSendResponse(source, id, false, null, 'Unknown channel: ' + channel);
  }
});

// === Script Injection ===
function injectCode(state, code) {
  // 文本替换：仅替换 import() 和 require()，它们无法在运行时拦截
  // fetch() 由 sandbox.js 透明代理，无需替换
  var safeCode = code
    .replace(/(?<!\.)\bimport\s*\(/g, 'evolva.import(')
    .replace(/(?<!\.)\brequire\s*\(/g, 'evolva.import(');

  var iframeDoc = state.iframe.contentDocument;
  var script = iframeDoc.createElement('script');
  script.textContent = '(async () => {\n' + safeCode + '\n})();';
  iframeDoc.body.appendChild(script);
  script.remove();
}

// === Mutation Loop ===
async function mutate(state) {
  if (!state || state.processing || !state.mutationSpaceReady) return;

  var userMsg = state.promptEl.value.trim();
  if (!userMsg) return;

  state.processing = true;
  state.sendBtn.classList.add('loading');
  state.sendArrow.style.display = 'none';
  state.sendSpinner.style.display = 'inline';
  state.promptEl.value = '';
  state.promptEl.disabled = true;

  try {
    log(state, 'user', userMsg);

    var dom = state.iframe.contentDocument.documentElement.outerHTML;
    log(state, 'system', t('logDomCaptured', { tokens: Math.round(dom.length / 4), chars: dom.length }));

    var result = await invoke('call_llm', {
      req: { dom: dom, instruction: userMsg },
    });

    log(state, 'system', t('logLlmResponded', {
      chars: result.raw.length,
      code: result.code ? result.code.length + ' chars' : 'none'
    }));

    if (!result.code) {
      log(state, 'error', t('logNoCode'));
      console.log('LLM raw response:', result.raw);
      return;
    }

    try {
      injectCode(state, result.code);
      log(state, 'system', t('logInjected'));
    } catch (injectErr) {
      log(state, 'error', t('logInjectionFailed') + String(injectErr));
      console.log('Failed code:', result.code);
      return;
    }

    await invoke('save_mutation', { tabId: state.id, instruction: userMsg, code: result.code });
    await invoke('auto_save', { tabId: state.id, tabName: state.name });
    log(state, 'system', t('logMutationApplied'));
    state.promptEl.style.height = 'auto';
    updateContext(state);
  } catch (err) {
    log(state, 'error', String(err));
  } finally {
    state.processing = false;
    state.sendBtn.classList.remove('loading');
    state.sendArrow.style.display = 'inline';
    state.sendSpinner.style.display = 'none';
    state.promptEl.disabled = false;
  }
}

// === Restore Dialog ===
function showRestoreDialog(count) {
  return new Promise(function(resolve) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';

    var dialog = document.createElement('div');
    dialog.style.cssText = 'background:var(--bg-window);border:1px solid var(--border);border-radius:10px;padding:20px;max-width:360px;text-align:center;font-family:inherit;color:var(--text-primary);';
    dialog.innerHTML = '<p style="margin-bottom:16px;font-size:13px;line-height:1.5;">' + t('confirmRestoreAll', { count: count }) + '</p>' +
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

// === Keyboard Shortcuts ===
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault();
    createTab().then(function(s) { if (s) switchTab(s.id); });
  }
  if (e.ctrlKey && e.key === 'w') {
    e.preventDefault();
    if (activeTabId) closeTab(activeTabId);
  }
  if (e.ctrlKey && e.key === 'Tab') {
    e.preventDefault();
    var ids = Object.keys(tabs);
    if (ids.length <= 1) return;
    var idx = ids.indexOf(activeTabId);
    var next = e.shiftKey ? (idx - 1 + ids.length) % ids.length : (idx + 1) % ids.length;
    switchTab(ids[next]);
  }
});

// === Tab Bar Buttons ===
document.getElementById('tab-new').addEventListener('click', function() {
  createTab().then(function(s) { if (s) switchTab(s.id); });
});
document.getElementById('tab-settings').addEventListener('click', function() {
  showSettingsDialog();
});
document.getElementById('tab-about').addEventListener('click', showAboutDialog);

// === Init ===
(async function() {
  // 从后端设置加载主题和语言（以配置文件为准）
  try {
    var savedSettings = await invoke('load_settings');
    if (savedSettings.language) {
      currentLang = savedSettings.language;
      localStorage.setItem('evolva_lang', currentLang);
    }
    if (savedSettings.theme) {
      applyTheme(savedSettings.theme === 'light');
    }
  } catch (_) {}

  // 加载沙盒权限配置
  await loadPermissions();

  applyLanguage();

  // 尝试恢复上次会话
  try {
    var savedTabs = await invoke('list_saved_tabs');
    if (savedTabs && savedTabs.length > 0) {
      var restore = await showRestoreDialog(savedTabs.length);
      if (restore) {
        for (var i = 0; i < savedTabs.length; i++) {
          var saved = savedTabs[i];
          var st = await createTab(saved.name);
          if (!st) continue;
          switchTab(st.id);
          try {
            var codes = await invoke('auto_load', { tabId: saved.tab_id });
            if (codes && codes.length > 0) {
              for (var j = 0; j < codes.length; j++) {
                injectCode(st, codes[j]);
              }
              updateContext(st);
            }
            log(st, 'system', t('logAutoLoaded', { count: codes ? codes.length : 0 }));
          } catch (err) {
            log(st, 'error', t('logImportFailed') + String(err));
          }
        }
        switchTab(Object.keys(tabs)[0]);
      } else {
        await createTab(t('tabDefault', { n: 1 }));
        var skipState = getActiveState();
        if (skipState) log(skipState, 'system', t('logAutoLoadSkipped'));
      }
    } else {
      await createTab(t('tabDefault', { n: 1 }));
    }
  } catch (_) {
    await createTab(t('tabDefault', { n: 1 }));
  }

  var initState = getActiveState();
  if (initState) {
    switchTab(initState.id);
    initState.promptEl.focus();
    log(initState, 'system', t('logInit'));
  }
})();
