// === Evolva Sandbox — iframe 权限拦截层 ===
// 透明代理 fetch / localStorage，显式代理 import / invoke / fs / clipboard

(function () {
  'use strict';

  // --- 基础设施：postMessage 通信 ---

  var pendingRequests = {};
  var requestCounter = 0;

  // 在覆盖 parent 之前捕获 parent.postMessage
  var _parentPostMessage = window.parent.postMessage.bind(window.parent);

  function sendRequest(channel, payload) {
    return new Promise(function (resolve, reject) {
      var id = 'req-' + (requestCounter++);
      pendingRequests[id] = { resolve: resolve, reject: reject };
      try {
        _parentPostMessage({
          type: 'evolva-request',
          id: id,
          channel: channel,
          payload: payload
        }, '*');
      } catch (e) {
        delete pendingRequests[id];
        reject(e);
        return;
      }
      setTimeout(function () {
        if (pendingRequests[id]) {
          pendingRequests[id].reject(new Error('Sandbox request timeout: ' + channel));
          delete pendingRequests[id];
        }
      }, 30000);
    });
  }

  // 监听 parent 响应
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'evolva-response') return;
    var resp = event.data;
    var pending = pendingRequests[resp.id];
    if (pending) {
      delete pendingRequests[resp.id];
      if (resp.success) {
        pending.resolve(resp.data);
      } else {
        pending.reject(new Error(resp.error || 'Unknown sandbox error'));
      }
    }
  });

  // --- 硬删除：永远不可用的 API ---

  var _block = function (name) {
    return function () {
      throw new Error('[Evolva Sandbox] ' + name + ' is not available.');
    };
  };

  // 1. 删除 Tauri 访问
  try { delete window.__TAURI__; } catch (_) {}

  // 2. 覆盖 parent / top
  try {
    Object.defineProperty(window, 'parent', {
      get: _block('window.parent'),
      set: function () { throw new Error('[Evolva Sandbox] Cannot set window.parent.'); },
      configurable: false
    });
  } catch (_) {}
  try {
    Object.defineProperty(window, 'top', {
      get: _block('window.top'),
      set: function () { throw new Error('[Evolva Sandbox] Cannot set window.top.'); },
      configurable: false
    });
  } catch (_) {}

  // 3. 覆盖 opener / frames / length
  try {
    Object.defineProperty(window, 'opener', { get: function () { return null; }, configurable: false });
  } catch (_) {}
  try {
    Object.defineProperty(window, 'frames', { get: function () { return window; }, configurable: false });
  } catch (_) {}
  try {
    Object.defineProperty(window, 'length', { get: function () { return 0; }, configurable: false });
  } catch (_) {}

  // 4. 阻止打开新窗口 / 关闭窗口
  window.open = _block('window.open()');
  window.close = _block('window.close()');

  // 5. 阻止 XMLHttpRequest（现代代码用 fetch）
  window.XMLHttpRequest = _block('XMLHttpRequest');

  // --- 透明代理：fetch（LLM 无感知） ---

  window.fetch = function (input, init) {
    var url;
    if (typeof input === 'string') {
      url = input;
    } else if (input && typeof input.url === 'string') {
      url = input.url;
    } else {
      url = String(input);
    }
    var opts = init || {};
    var headersObj = {};
    if (opts.headers) {
      if (typeof Headers !== 'undefined' && opts.headers instanceof Headers) {
        opts.headers.forEach(function (v, k) { headersObj[k] = v; });
      } else if (typeof opts.headers === 'object' && opts.headers !== null) {
        for (var h in opts.headers) {
          if (Object.prototype.hasOwnProperty.call(opts.headers, h)) {
            headersObj[h] = opts.headers[h];
          }
        }
      }
    }
    return sendRequest('fetch', {
      url: url,
      method: opts.method || 'GET',
      headers: headersObj,
      body: opts.body || null
    }).then(function (data) {
      // 构造真正的 Response 对象，LLM 代码完全无感知
      var respInit = {
        status: data.status,
        statusText: data.statusText,
        headers: new Headers(data.headers || {})
      };
      return new Response(data.body, respInit);
    });
  };

  // --- 透明代理：localStorage / sessionStorage（内存模拟） ---

  function createStorage() {
    var data = {};
    return {
      getItem: function (key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
      setItem: function (key, value) { data[key] = String(value); },
      removeItem: function (key) { delete data[key]; },
      clear: function () { data = {}; },
      key: function (i) { var keys = Object.keys(data); return i >= 0 && i < keys.length ? keys[i] : null; },
      get length() { return Object.keys(data).length; }
    };
  }

  var _localStorage = createStorage();
  var _sessionStorage = createStorage();

  try {
    Object.defineProperty(window, 'localStorage', { get: function () { return _localStorage; }, configurable: false });
  } catch (_) {}
  try {
    Object.defineProperty(window, 'sessionStorage', { get: function () { return _sessionStorage; }, configurable: false });
  } catch (_) {}

  // --- 显式 API：evolva.* ---

  var moduleCache = {};

  window.evolva = {
    // 模块导入（import() 语法无法覆盖，必须显式调用）
    import: function (moduleName) {
      if (moduleCache[moduleName]) return Promise.resolve(moduleCache[moduleName]);
      return sendRequest('import', { module: moduleName }).then(function (data) {
        var blob = new Blob([data.source], { type: 'application/javascript' });
        var url = URL.createObjectURL(blob);
        return import(url).then(function (mod) {
          URL.revokeObjectURL(url);
          moduleCache[moduleName] = mod;
          return mod;
        }).catch(function (err) {
          URL.revokeObjectURL(url);
          throw err;
        });
      });
    },

    // Tauri 命令代理（浏览器原生不存在此 API）
    invoke: function (command, args) {
      return sendRequest('invoke', { command: command, args: args || {} });
    },

    // 文件读取（浏览器原生不存在此 API）
    readFile: function (path) {
      return sendRequest('fs-read', { path: path });
    },

    // 文件写入（浏览器原生不存在此 API）
    writeFile: function (path, content) {
      return sendRequest('fs-write', { path: path, content: content });
    },

    // 持久存储：store(key) 读 / store(key, value) 写 / store(key, null) 删
    store: function (key, value) {
      if (arguments.length === 1) {
        return sendRequest('storage', { action: 'get', key: key });
      } else if (value === null || value === undefined) {
        return sendRequest('storage', { action: 'delete', key: key });
      } else {
        return sendRequest('storage', { action: 'set', key: key, value: value });
      }
    },

    // 剪贴板代理
    clipboardRead: function () {
      return sendRequest('clipboard', { action: 'read' });
    },
    clipboardWrite: function (text) {
      return sendRequest('clipboard', { action: 'write', text: text });
    }
  };

  // 通知 parent sandbox 已就绪
  _parentPostMessage({ type: 'evolva-sandbox-ready' }, '*');

})();
