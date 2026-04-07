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
    providers: 'Providers',
    addProvider: 'Add Provider',
    removeProvider: 'Remove',
    providerName: 'Profile Name',
    activateProvider: 'Use',
    noProviders: 'No providers configured. Add one to get started.',
    providerActive: 'Active',
    editProvider: 'Edit',
    copyProvider: 'Copy',
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
    providers: '供应商',
    addProvider: '添加供应商',
    removeProvider: '删除',
    providerName: '配置名称',
    activateProvider: '使用',
    noProviders: '尚未配置供应商，请添加后开始使用。',
    providerActive: '当前使用',
    editProvider: '编辑',
    copyProvider: '复制',
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
  this.coreHidden = false;
  this.logEl = null;
  this.promptEl = null;
  this.sendBtn = null;
  this.sendArrow = null;
  this.sendSpinner = null;
  this.contextFill = null;
  this.contextText = null;
  this.errorRetryCount = 0;
  this.errorRetryTimer = null;
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

  // 初始化项目文件系统
  await invoke('init_project', { tabId: id });

  // 初始化 iframe 内容（从项目文件构建预览）
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
  state.coreEl.style.display = state.coreHidden ? 'none' : '';
  activeTabId = tabId;

  updateTabBarUI();
  rebuildDock();
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
            var st = tabs[tid];
            invoke('auto_save', { tabId: tid, tabName: val, windowStates: captureWindowStates(st) });
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

// 主页面 Dock 栏
function ensureMainDock() {
  var existing = document.getElementById('main-dock');
  if (existing) return existing;
  var dock = document.createElement('div');
  dock.id = 'main-dock';
  dock.className = 'evolva-dock';
  dock.style.display = 'none';
  document.body.appendChild(dock);
  return dock;
}

function updateMainDockVisibility() {
  var dock = document.getElementById('main-dock');
  if (!dock) return;
  var items = dock.querySelectorAll('.dock-item');
  dock.style.display = items.length > 0 ? '' : 'none';
}

function addCoreToDock(state) {
  var dock = ensureMainDock();
  var titleEl = state.coreEl.querySelector('.window-header h2');
  var title = titleEl ? titleEl.textContent : 'Evolva';
  var item = document.createElement('div');
  item.className = 'dock-item';
  item.textContent = title;
  item.addEventListener('click', function() {
    state.coreEl.style.display = '';
    state.coreHidden = false;
    item.remove();
    updateMainDockVisibility();
  });
  dock.appendChild(item);
  updateMainDockVisibility();
}

// 切换标签页时重建 Dock（仅显示当前标签页的窗口）
function rebuildDock() {
  var dock = document.getElementById('main-dock');
  if (dock) dock.innerHTML = '';
  var state = getActiveState();
  if (!state) { updateMainDockVisibility(); return; }
  // iframe 中隐藏的窗口
  if (state.mutationSpaceReady && state.iframe.contentWindow && state.iframe.contentWindow.addWindowToDock) {
    var iframeDoc = state.iframe.contentDocument;
    if (iframeDoc) {
      var windows = iframeDoc.querySelectorAll('.evolva-window');
      for (var i = 0; i < windows.length; i++) {
        if (windows[i].style.display === 'none') {
          state.iframe.contentWindow.addWindowToDock(windows[i]);
        }
      }
    }
  }
  // 主控面板隐藏
  if (state.coreHidden) {
    addCoreToDock(state);
  }
  updateMainDockVisibility();
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
      '<div class="window-controls">' +
        '<button class="window-ctrl-btn window-ctrl-minimize">&#x2500;</button>' +
        '<button class="window-ctrl-btn window-ctrl-maximize">&#x25A1;</button>' +
        '<button class="window-ctrl-btn window-ctrl-close">&#x2715;</button>' +
      '</div>' +
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

  // 绑定事件
  state.sendBtn.addEventListener('click', function() { mutate(state); });
  state.promptEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mutate(state); }
  });
  state.promptEl.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 140) + 'px';
  });

  // 窗口控制按钮
  core.querySelector('.window-ctrl-minimize').addEventListener('click', function() {
    core.style.display = 'none';
    state.coreHidden = true;
    addCoreToDock(state);
  });
  core.querySelector('.window-ctrl-maximize').addEventListener('click', function() {
    if (core.classList.contains('maximized')) {
      var rx = core.getAttribute('data-restore-x') || '0';
      var ry = core.getAttribute('data-restore-y') || '0';
      var rw = core.getAttribute('data-restore-w') || '460';
      var rh = core.getAttribute('data-restore-h') || '620';
      core.style.width = rw + 'px';
      core.style.height = rh + 'px';
      core.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      core.setAttribute('data-x', parseFloat(rx));
      core.setAttribute('data-y', parseFloat(ry));
      core.classList.remove('maximized');
    } else {
      core.setAttribute('data-restore-x', core.getAttribute('data-x') || '0');
      core.setAttribute('data-restore-y', core.getAttribute('data-y') || '0');
      core.setAttribute('data-restore-w', core.style.width || (core.offsetWidth + ''));
      core.setAttribute('data-restore-h', core.style.height || (core.offsetHeight + ''));
      core.classList.add('maximized');
    }
  });
  core.querySelector('.window-ctrl-close').addEventListener('click', function() {
    core.style.display = 'none';
    state.coreHidden = true;
    addCoreToDock(state);
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
  // 通过 build_preview 获取组装好的 HTML
  var previewHtml = await invoke('build_preview', { tabId: state.id });
  var doc = state.iframe.contentDocument;
  doc.open();
  doc.write(previewHtml);
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

  // 关闭窗口 → 添加到主页面 Dock 栏（统一管理）
  function addWindowToDock(winEl) {
    var dock = ensureMainDock();
    var titleEl = winEl.querySelector('.window-header h2');
    var title = titleEl ? titleEl.textContent : (winEl.id || 'Window');
    var item = document.createElement('div');
    item.className = 'dock-item';
    item.textContent = title;
    item.addEventListener('click', function() {
      winEl.style.display = '';
      item.remove();
      updateMainDockVisibility();
      win.bringToFront(winEl);
    });
    dock.appendChild(item);
    updateMainDockVisibility();
  }

  // 为窗口注入控制按钮（最小化/最大化/关闭）
  function injectWindowControls(el) {
    var header = el.querySelector('.window-header');
    if (!header || header.querySelector('.window-controls')) return;

    var controls = doc.createElement('div');
    controls.className = 'window-controls';

    var minBtn = doc.createElement('button');
    minBtn.className = 'window-ctrl-btn window-ctrl-minimize';
    minBtn.innerHTML = '&#x2500;';

    var maxBtn = doc.createElement('button');
    maxBtn.className = 'window-ctrl-btn window-ctrl-maximize';
    maxBtn.innerHTML = '&#x25A1;';

    var closeBtn = doc.createElement('button');
    closeBtn.className = 'window-ctrl-btn window-ctrl-close';
    closeBtn.innerHTML = '&#x2715;';

    controls.appendChild(minBtn);
    controls.appendChild(maxBtn);
    controls.appendChild(closeBtn);
    header.appendChild(controls);

    // 最小化 → 隐藏窗口并添加到 Dock 栏
    minBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      el.style.display = 'none';
      addWindowToDock(el);
    });

    // 最大化/还原
    maxBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (el.classList.contains('maximized')) {
        var rx = el.getAttribute('data-restore-x') || '0';
        var ry = el.getAttribute('data-restore-y') || '0';
        var rw = el.getAttribute('data-restore-w') || '400';
        var rh = el.getAttribute('data-restore-h') || '300';
        el.style.width = rw + 'px';
        el.style.height = rh + 'px';
        el.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        el.setAttribute('data-x', parseFloat(rx));
        el.setAttribute('data-y', parseFloat(ry));
        el.classList.remove('maximized');
      } else {
        el.setAttribute('data-restore-x', el.getAttribute('data-x') || '0');
        el.setAttribute('data-restore-y', el.getAttribute('data-y') || '0');
        el.setAttribute('data-restore-w', el.style.width || (el.offsetWidth + ''));
        el.setAttribute('data-restore-h', el.style.height || (el.offsetHeight + ''));
        el.classList.add('maximized');
      }
    });

    // 关闭 → 隐藏窗口并添加到 Dock 栏
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      el.style.display = 'none';
      addWindowToDock(el);
    });
  }

  win.setupDraggable = function(el) {
    injectWindowControls(el);

    win.interact(el)
      .draggable({
        allowFrom: '.window-header',
        inertia: true,
        modifiers: [win.interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })],
        listeners: {
          move: function(event) {
            var target = event.target;
            if (target.classList.contains('maximized')) return;
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
            if (target.classList.contains('maximized') || target.classList.contains('minimized')) return;
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

  // 暴露给父页面调用，确保代码注入后能扫描所有窗口
  win.injectWindowControls = injectWindowControls;
  win.addWindowToDock = addWindowToDock;

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
    // 转发全局快捷键到父页面
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      var st = getActiveState();
      if (st) exportApp(st);
      return;
    }
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      var st2 = getActiveState();
      if (st2) importApp(st2);
      return;
    }
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

  // MutationObserver：自动为新增的窗口注入控制按钮
  var ctrlObserver = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;
        if (node.classList && node.classList.contains('evolva-window')) {
          injectWindowControls(node);
        }
        if (node.querySelectorAll) {
          var wins = node.querySelectorAll('.evolva-window');
          for (var k = 0; k < wins.length; k++) {
            injectWindowControls(wins[k]);
          }
        }
        // header 后添加的情况
        if (node.classList && node.classList.contains('window-header')) {
          var winEl = node.parentElement;
          if (winEl && winEl.classList.contains('evolva-window')) {
            injectWindowControls(winEl);
          }
        }
      }
    }
  });
  ctrlObserver.observe(doc.body, { childList: true, subtree: true });
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

// 协议默认值表
var PROTOCOL_DEFAULTS = {
  openai:     { base_url: 'https://api.openai.com/v1', model: 'gpt-4o', label: 'OpenAI' },
  anthropic:  { base_url: 'https://api.anthropic.com', model: 'claude-sonnet-4-20250514', label: 'Anthropic' },
  deepseek:   { base_url: 'https://api.deepseek.com', model: 'deepseek-chat', label: 'DeepSeek' },
  gemini:     { base_url: 'https://generativelanguage.googleapis.com', model: 'gemini-2.5-flash', label: 'Google Gemini' },
  groq:       { base_url: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile', label: 'Groq' },
  mistral:    { base_url: 'https://api.mistral.ai/v1', model: 'mistral-large-latest', label: 'Mistral' },
  openrouter: { base_url: 'https://openrouter.ai/api/v1', model: 'anthropic/claude-sonnet-4-20250514', label: 'OpenRouter' },
  ollama:     { base_url: 'http://localhost:11434', model: 'llama3', label: 'Ollama (Local)' },
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function showSettingsDialog() {
  var state = getActiveState();
  invoke('load_settings').then(function(settings) {
    buildSettingsDialog(state, settings);
  }).catch(function() {
    buildSettingsDialog(state, { providers: [], active_provider_id: null, theme: '', language: '', permissions: null });
  });
}

function buildSettingsDialog(state, settings) {
  var overlay = document.createElement('div');
  overlay.className = 'settings-overlay';
  var dlg = document.createElement('div');
  dlg.className = 'settings-dialog';
  var isLight = document.body.classList.contains('light');

  // 当前状态（编辑过程中维护，保存时提交）
  var providers = (settings.providers || []).map(function(p) { return Object.assign({}, p); });
  var activeId = settings.active_provider_id || null;
  var editingId = null; // 正在编辑的供应商 ID

  function protocolLabel(p) { return (PROTOCOL_DEFAULTS[p] || {}).label || p; }

  function renderProviderList() {
    var listEl = dlg.querySelector('#provider-list');
    if (!listEl) return;
    if (providers.length === 0) {
      listEl.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px 0;">' + t('noProviders') + '</div>';
      return;
    }
    var html = '';
    providers.forEach(function(p) {
      var isActive = p.id === activeId;
      html += '<div class="provider-item' + (isActive ? ' active' : '') + '" data-id="' + p.id + '">' +
        '<div class="provider-info">' +
          '<div class="provider-name">' + (p.name || protocolLabel(p.protocol)) + '</div>' +
          '<div class="provider-protocol">' + protocolLabel(p.protocol) + ' &middot; ' + (p.model || '') + '</div>' +
        '</div>' +
        '<div class="provider-actions">' +
          (isActive ? '<span class="provider-active-badge">' + t('providerActive') + '</span>' :
            '<button class="provider-btn activate" data-id="' + p.id + '">' + t('activateProvider') + '</button>') +
          '<button class="provider-btn edit" data-id="' + p.id + '">' + t('editProvider') + '</button>' +
          '<button class="provider-btn copy" data-id="' + p.id + '">' + t('copyProvider') + '</button>' +
          '<button class="provider-btn remove" data-id="' + p.id + '">' + t('removeProvider') + '</button>' +
        '</div>' +
      '</div>';
    });
    listEl.innerHTML = html;

    // 绑定事件
    listEl.querySelectorAll('.provider-btn.activate').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        activeId = this.getAttribute('data-id');
        renderProviderList();
      });
    });
    listEl.querySelectorAll('.provider-btn.edit').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        startEdit(id);
      });
    });
    listEl.querySelectorAll('.provider-btn.remove').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        providers = providers.filter(function(p) { return p.id !== id; });
        if (activeId === id) activeId = providers.length > 0 ? providers[0].id : null;
        renderProviderList();
      });
    });
    listEl.querySelectorAll('.provider-btn.copy').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        var src = providers.find(function(p) { return p.id === id; });
        if (!src) return;
        var copy = Object.assign({}, src, { id: generateId(), name: src.name + ' (Copy)' });
        providers.push(copy);
        renderProviderList();
      });
    });
  }

  function startEdit(id) {
    var p = providers.find(function(x) { return x.id === id; });
    if (!p) return;
    editingId = id;
    showEditor(p);
  }

  // 打开独立的供应商编辑弹窗
  function showEditor(p) {
    var editorOverlay = document.createElement('div');
    editorOverlay.className = 'settings-overlay';
    editorOverlay.style.zIndex = '100000';
    var ed = document.createElement('div');
    ed.className = 'settings-dialog';
    ed.innerHTML =
      '<h3>' + (editingId ? t('editProvider') : t('addProvider')) + '</h3>' +
      '<label>' + t('providerName') + '</label>' +
      '<input type="text" id="ed-name" placeholder="My GPT-4o">' +
      '<label>' + t('protocol') + '</label>' +
      '<select id="ed-protocol">' +
        Object.keys(PROTOCOL_DEFAULTS).map(function(k) {
          return '<option value="' + k + '">' + PROTOCOL_DEFAULTS[k].label + '</option>';
        }).join('') +
      '</select>' +
      '<div id="ed-api-key-row">' +
        '<label>' + t('apiKey') + '</label>' +
        '<div style="position:relative"><input type="password" id="ed-api-key" placeholder="sk-..." style="width:100%;padding-right:32px"><span id="ed-key-toggle" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;opacity:0.5;font-size:13px;user-select:none">&#128065;</span></div>' +
      '</div>' +
      '<label>' + t('baseUrl') + '</label>' +
      '<input type="text" id="ed-base-url">' +
      '<label>' + t('model') + '</label>' +
      '<input type="text" id="ed-model">' +
      '<div style="display:flex;gap:8px;margin-top:6px">' +
        '<button id="ed-confirm" style="background:var(--accent);color:var(--accent-on);border:none;padding:7px 14px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">' + t('ok') + '</button>' +
        '<button id="ed-cancel" style="background:var(--btn-bg);color:var(--text-primary);border:1px solid var(--btn-border);padding:7px 14px;border-radius:5px;cursor:pointer;font-size:12px;">' + t('cancel') + '</button>' +
      '</div>';
    editorOverlay.appendChild(ed);
    document.body.appendChild(editorOverlay);

    // 填充值
    ed.querySelector('#ed-name').value = p ? p.name : '';
    ed.querySelector('#ed-protocol').value = p ? p.protocol : 'openai';
    ed.querySelector('#ed-api-key').value = p ? p.api_key : '';
    ed.querySelector('#ed-base-url').value = p ? p.base_url : (PROTOCOL_DEFAULTS['openai'] || {}).base_url || '';
    ed.querySelector('#ed-model').value = p ? p.model : (PROTOCOL_DEFAULTS['openai'] || {}).model || '';
    updateApiKeyVisibility(ed, p ? p.protocol : 'openai');
    ed.querySelector('#ed-name').focus();

    // 协议切换自动填充
    ed.querySelector('#ed-protocol').addEventListener('change', function() {
      var protocol = this.value;
      var defaults = PROTOCOL_DEFAULTS[protocol] || {};
      var baseInput = ed.querySelector('#ed-base-url');
      var modelInput = ed.querySelector('#ed-model');
      var isDefaultUrl = Object.values(PROTOCOL_DEFAULTS).some(function(d) { return d.base_url === baseInput.value; });
      var isDefaultModel = Object.values(PROTOCOL_DEFAULTS).some(function(d) { return d.model === modelInput.value; });
      if (isDefaultUrl || !baseInput.value) baseInput.value = defaults.base_url || '';
      if (isDefaultModel || !modelInput.value) modelInput.value = defaults.model || '';
      updateApiKeyVisibility(ed, protocol);
    });

    // API Key 显隐
    ed.querySelector('#ed-key-toggle').addEventListener('click', function() {
      var input = ed.querySelector('#ed-api-key');
      var isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      this.textContent = isPassword ? '\u{1F648}' : '\u{1F441}';
    });

    // 确认
    ed.querySelector('#ed-confirm').addEventListener('click', function() {
      var protocol = ed.querySelector('#ed-protocol').value;
      var defaults = PROTOCOL_DEFAULTS[protocol] || {};
      var data = {
        id: editingId || generateId(),
        name: ed.querySelector('#ed-name').value.trim() || protocolLabel(protocol),
        protocol: protocol,
        api_key: ed.querySelector('#ed-api-key').value.trim(),
        base_url: ed.querySelector('#ed-base-url').value.trim() || defaults.base_url || '',
        model: ed.querySelector('#ed-model').value.trim() || defaults.model || '',
      };
      if (editingId) {
        var idx = providers.findIndex(function(p) { return p.id === editingId; });
        if (idx >= 0) providers[idx] = data;
      } else {
        providers.push(data);
        if (providers.length === 1) activeId = data.id;
      }
      editingId = null;
      editorOverlay.remove();
      renderProviderList();
    });

    // 取消
    ed.querySelector('#ed-cancel').addEventListener('click', function() {
      editingId = null;
      editorOverlay.remove();
    });

    // 不响应遮罩点击，只能通过按钮关闭
  }

  function updateApiKeyVisibility(ed, protocol) {
    var row = ed.querySelector('#ed-api-key-row');
    if (row) row.style.display = protocol === 'ollama' ? 'none' : '';
  }

  dlg.innerHTML =
    '<h3>' + t('settings') + '</h3>' +
    '<div class="settings-tabs">' +
      '<button class="settings-tab active" data-tab="providers">' + t('providers') + '</button>' +
      '<button class="settings-tab" data-tab="general">' + t('settingsBasic') + '</button>' +
      '<button class="settings-tab" data-tab="security">' + t('settingsSecurity') + '</button>' +
    '</div>' +

    // 供应商标签页
    '<div class="settings-panel" id="panel-providers">' +
      '<button id="add-provider-btn" class="add-provider-btn">+ ' + t('addProvider') + '</button>' +
      '<div id="provider-list" class="provider-list"></div>' +
    '</div>' +

    // 通用标签页
    '<div class="settings-panel" id="panel-general" style="display:none">' +
      '<label>' + t('language') + '</label>' +
      '<select id="dlg-lang"><option value="zh">中文</option><option value="en">English</option></select>' +
      '<div class="theme-row"><label>' + t('theme') + '</label><div id="dlg-theme" class="theme-toggle' + (isLight ? ' light' : '') + '"></div></div>' +
    '</div>' +

    // 安全标签页
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

  dlg.querySelector('#dlg-lang').value = currentLang;

  // 渲染供应商列表
  renderProviderList();

  // 标签页切换
  dlg.querySelectorAll('.settings-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      dlg.querySelectorAll('.settings-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      var target = this.getAttribute('data-tab');
      dlg.querySelector('#panel-providers').style.display = target === 'providers' ? '' : 'none';
      dlg.querySelector('#panel-general').style.display = target === 'general' ? '' : 'none';
      dlg.querySelector('#panel-security').style.display = target === 'security' ? '' : 'none';
    });
  });

  // 主题切换
  dlg.querySelector('#dlg-theme').addEventListener('click', function() {
    var nowLight = !document.body.classList.contains('light');
    applyTheme(nowLight);
    this.classList.toggle('light', nowLight);
  });

  // 语言切换
  dlg.querySelector('#dlg-lang').addEventListener('change', function() {
    currentLang = this.value;
    localStorage.setItem('evolva_lang', currentLang);
    applyLanguage();
  });

  // 权限 toggle
  ['network', 'fs-read', 'fs-write', 'storage', 'clipboard'].forEach(function(key) {
    var toggle = dlg.querySelector('#perm-' + key);
    if (toggle) toggle.addEventListener('click', function() { this.classList.toggle('on'); });
  });

  // 添加供应商
  dlg.querySelector('#add-provider-btn').addEventListener('click', function() {
    editingId = null;
    showEditor(null);
  });

  // 保存
  dlg.querySelector('#dlg-save').addEventListener('click', async function() {
    try {
      await invoke('save_settings', {
        settings: {
          providers: providers,
          active_provider_id: activeId,
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

// 捕获 iframe 内所有窗口的位置/尺寸状态
function captureWindowStates(state) {
  var iframeDoc = state.iframe.contentDocument;
  if (!iframeDoc) return null;
  var windows = iframeDoc.querySelectorAll('.evolva-window');
  var result = [];
  for (var i = 0; i < windows.length; i++) {
    var w = windows[i];
    result.push({
      id: w.id || '',
      x: parseFloat(w.getAttribute('data-x')) || 0,
      y: parseFloat(w.getAttribute('data-y')) || 0,
      width: w.style.width || '',
      height: w.style.height || '',
      maximized: w.classList.contains('maximized'),
      display: w.style.display === 'none' ? 'none' : '',
      restore: {
        x: w.getAttribute('data-restore-x') || '',
        y: w.getAttribute('data-restore-y') || '',
        w: w.getAttribute('data-restore-w') || '',
        h: w.getAttribute('data-restore-h') || ''
      }
    });
  }
  return result.length > 0 ? result : null;
}

// 恢复 iframe 内窗口的位置/尺寸状态
function applyWindowStates(state, states) {
  if (!states || !Array.isArray(states)) return;
  var iframeDoc = state.iframe.contentDocument;
  if (!iframeDoc) return;
  for (var i = 0; i < states.length; i++) {
    var s = states[i];
    var el = s.id ? iframeDoc.getElementById(s.id) : null;
    if (!el) continue;
    if (s.x || s.y) {
      el.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px)';
      el.setAttribute('data-x', s.x);
      el.setAttribute('data-y', s.y);
    }
    if (s.width) el.style.width = s.width;
    if (s.height) el.style.height = s.height;
    if (s.maximized) {
      el.classList.add('maximized');
      if (s.restore) {
        if (s.restore.x) el.setAttribute('data-restore-x', s.restore.x);
        if (s.restore.y) el.setAttribute('data-restore-y', s.restore.y);
        if (s.restore.w) el.setAttribute('data-restore-w', s.restore.w);
        if (s.restore.h) el.setAttribute('data-restore-h', s.restore.h);
      }
    }
    if (s.display === 'none') {
      el.style.display = 'none';
      // 重建 Dock 条目
      if (state.iframe.contentWindow.addWindowToDock) {
        state.iframe.contentWindow.addWindowToDock(el);
      }
    }
  }
}

async function exportApp(state) {
  try {
    var debugInfo = await invoke('debug_project', { tabId: state.id });
    var fileCount = Object.keys(debugInfo).length;
    if (fileCount === 0) { log(state, 'error', t('logNoMutations')); return; }

    var filePath = await tauriDialog.save({
      defaultPath: 'app.evolva.json',
      filters: [{ name: 'Evolva JSON', extensions: ['json'] }]
    });
    if (!filePath) return;

    var name = filePath.split(/[\/]/).pop().replace('.evolva.json', '').replace('.json', '');
    var windowStates = captureWindowStates(state);
    await invoke('export_app', { path: filePath, name: name, tabId: state.id, windowStates: windowStates });
    log(state, 'system', t('logExported', { count: fileCount }));
  } catch (err) {
    log(state, 'error', t('logExportFailed') + String(err));
  }
}

async function importApp(state) {
  try {
    var debugInfo = await invoke('debug_project', { tabId: state.id });
    var fileCount = Object.keys(debugInfo).length;
    if (fileCount > 0) {
      var confirmed = await showConfirmDialog(fileCount);
      if (!confirmed) return;
    }

    var selected = await tauriDialog.open({
      filters: [{ name: 'Evolva JSON', extensions: ['json'] }],
      multiple: false
    });
    if (!selected) return;

    await invoke('import_app', { path: selected, tabId: state.id });

    // 通过 build_preview 重建预览
    var previewHtml = await invoke('build_preview', { tabId: state.id });
    loadPreviewHtml(state, previewHtml);

    var windowStates = captureWindowStates(state);
    await invoke('auto_save', { tabId: state.id, tabName: state.name, windowStates: windowStates });
    updateContext(state);
    log(state, 'system', t('logImported', { count: fileCount }));
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
    // 前端估算：约 4 字符 = 1 token
    var tokens = Math.round(dom.length / 4);
    var maxTokens = 128000;
    var percentage = Math.min((tokens / maxTokens) * 100, 100);
    state.contextFill.style.width = percentage + '%';
    var maxK = Math.round(maxTokens / 1000);
    state.contextText.textContent = 'context ' + tokens + ' / ' + maxK + 'k (' + percentage.toFixed(1) + '%)';
    state.contextFill.classList.remove('warning', 'danger');
    if (percentage > 96) state.contextFill.classList.add('danger');
    else if (percentage > 72) state.contextFill.classList.add('warning');
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
    'open_url': true,
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

// 处理 iframe 中的外部链接打开请求
window.addEventListener('message', function(event) {
  if (!event.data || event.data.type !== 'evolva-open-url') return;
  invoke('open_url', { url: event.data.url });
});

// 监听 iframe 预览错误 — 自动回传 LLM 修复（最多 2 次）
var MAX_ERROR_RETRIES = 2;
var ERROR_RETRY_WINDOW = 3000; // mutation 完成后 3 秒内的错误才触发自动修复

window.addEventListener('message', function(event) {
  if (!event.data || event.data.type !== 'evolva-preview-error') return;
  var st = getActiveState();
  if (!st) return;

  var msg = event.data.message || 'Unknown error';
  var line = event.data.line ? ' (line ' + event.data.line + ')' : '';
  var stack = event.data.stack || '';

  log(st, 'error', 'Preview error: ' + msg + line);
  if (stack) console.log('[Preview Error Stack]', stack);

  // 正在处理用户指令或自动修复中，不干扰
  if (st.processing) return;
  // 不在重试窗口内
  if (!st.errorRetryTimer) return;
  if (st.errorRetryCount >= MAX_ERROR_RETRIES) {
    log(st, 'system', 'Auto-fix retry limit reached (' + MAX_ERROR_RETRIES + '). Please fix manually.');
    return;
  }

  st.errorRetryCount++;
  log(st, 'system', 'Auto-fix attempt ' + st.errorRetryCount + '/' + MAX_ERROR_RETRIES + '...');

  var fixInstruction = 'Fix this runtime error in the preview:\n' +
    'Error: ' + msg + line + '\n' +
    (stack ? 'Stack:\n' + stack.split('\n').slice(0, 5).join('\n') : '') + '\n\n' +
    'Check the relevant file (likely app.js) and fix the bug. Do NOT change the overall design.';

  autoFixError(st, fixInstruction);
});

async function autoFixError(state, instruction) {
  clearTimeout(state.errorRetryTimer);
  state.processing = true;

  try {
    var result = await invoke('call_llm', {
      req: { instruction: instruction, tabId: state.id },
    });

    if (result.tool_calls && result.tool_calls.length > 0) {
      for (var i = 0; i < result.tool_calls.length; i++) {
        var tc = result.tool_calls[i];
        log(state, 'system', '🔧 ' + tc.tool + '(' + (tc.args.length > 80 ? tc.args.substring(0, 80) + '...' : tc.args) + ')');
      }
    }

    var previewHtml = await invoke('build_preview', { tabId: state.id });
    loadPreviewHtml(state, previewHtml);

    var winStates = captureWindowStates(state);
    await invoke('auto_save', { tabId: state.id, tabName: state.name, windowStates: winStates });
    updateContext(state);

    // 重开错误监听窗口（允许链式修复）
    state.errorRetryTimer = setTimeout(function() {
      state.errorRetryTimer = null;
    }, ERROR_RETRY_WINDOW);
  } catch (err) {
    log(state, 'error', 'Auto-fix failed: ' + String(err));
  } finally {
    state.processing = false;
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

// === Preview Loading ===
function loadPreviewHtml(state, html) {
  console.log('[loadPreviewHtml] html length=' + html.length + ', first 200:', html.substring(0, 200));
  var doc = state.iframe.contentDocument;
  doc.open();
  doc.write(html);
  doc.close();
  // 设置 mutation helpers
  setupMutationHelpers(state);
  state.mutationSpaceReady = true;
  // 全页替换后，主动为已存在的窗口注入控制按钮和拖拽
  var iframeWin = state.iframe.contentWindow;
  if (iframeWin && iframeWin.setupDraggable) {
    var existingWins = doc.querySelectorAll('.evolva-window');
    for (var i = 0; i < existingWins.length; i++) {
      iframeWin.setupDraggable(existingWins[i]);
    }
  }
  // 同步主题
  if (document.body.classList.contains('light')) {
    doc.documentElement.classList.add('light');
    doc.body.classList.add('light');
  }
  // 调试：检查 iframe body 内容
  setTimeout(function() {
    var bodyHtml = doc.body ? doc.body.innerHTML : 'NO BODY';
    console.log('[loadPreviewHtml] body content length=' + bodyHtml.length);
    if (bodyHtml.length < 10) {
      log(state, 'error', 'Preview body is empty! Check browser console for JS errors.');
      console.log('[loadPreviewHtml] Full HTML:', html);
    }
  }, 100);
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

    // 调用新的 agent 架构：发送指令 + tab_id
    var result = await invoke('call_llm', {
      req: { instruction: userMsg, tabId: state.id },
    });

    // 显示工具调用日志
    if (result.tool_calls && result.tool_calls.length > 0) {
      for (var i = 0; i < result.tool_calls.length; i++) {
        var tc = result.tool_calls[i];
        log(state, 'system', '🔧 ' + tc.tool + '(' + (tc.args.length > 80 ? tc.args.substring(0, 80) + '...' : tc.args) + ')');
      }
    }

    log(state, 'system', t('logLlmResponded', {
      chars: result.text.length,
      code: result.tool_calls ? result.tool_calls.length + ' tool calls' : 'none'
    }));

    // 重新构建预览并加载到 iframe
    var previewHtml = await invoke('build_preview', { tabId: state.id });
    loadPreviewHtml(state, previewHtml);

    log(state, 'system', t('logMutationApplied'));

    // 开启运行时错误自动修复窗口（3 秒内的错误会触发自动修复）
    state.errorRetryCount = 0;
    clearTimeout(state.errorRetryTimer);
    state.errorRetryTimer = setTimeout(function() {
      state.errorRetryTimer = null;
    }, ERROR_RETRY_WINDOW);
    var winStates = captureWindowStates(state);
    await invoke('auto_save', { tabId: state.id, tabName: state.name, windowStates: winStates });
    state.promptEl.style.height = 'auto';
    updateContext(state);
  } catch (err) {
    log(state, 'error', String(err));
    // 调试：输出项目文件状态
    try {
      var debugInfo = await invoke('debug_project', { tabId: state.id });
      console.log('[Debug] Project files:', JSON.stringify(debugInfo).substring(0, 500));
      log(state, 'system', 'Debug: files=' + Object.keys(debugInfo).join(', '));
    } catch (debugErr) {
      console.log('[Debug] Failed to get project info:', debugErr);
    }
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
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    var st = getActiveState();
    if (st) exportApp(st);
  }
  if (e.ctrlKey && e.key === 'o') {
    e.preventDefault();
    var st2 = getActiveState();
    if (st2) importApp(st2);
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
            var result = await invoke('auto_load', { tabId: saved.tab_id });
            if (result) {
              // 通过 build_preview 重建预览
              var previewHtml = await invoke('build_preview', { tabId: saved.tab_id });
              loadPreviewHtml(st, previewHtml);
              applyWindowStates(st, result.states);
              updateContext(st);
            }
            log(st, 'system', t('logAutoLoaded', { count: result ? 1 : 0 }));
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
