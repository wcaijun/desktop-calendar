const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const evernoteSync = require('./renderer/evernote-sync');

function hwndOf(win) {
  try {
    const buf = Buffer.from(win.getNativeWindowHandle());
    return buf.readBigUInt64LE(0).toString();
  } catch (e) {
    return null;
  }
}

function attachWorkerW(hwndStr, cb) {
  const script = [
    "$code = @'",
    'using System;',
    'using System.Runtime.InteropServices;',
    'public class DeskWall {',
    '  [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern IntPtr FindWindowW(string cls, string win);',
    '  [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern IntPtr FindWindowExW(IntPtr parent, IntPtr after, string cls, string win);',
    '  [DllImport("user32.dll")] static extern IntPtr SendMessageTimeoutW(IntPtr h, uint m, IntPtr w, IntPtr l, uint f, uint t, out IntPtr r);',
    '  public delegate bool EnumProc(IntPtr h, IntPtr l);',
    '  [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb, IntPtr l);',
    '  [DllImport("user32.dll")] static extern IntPtr SetParent(IntPtr child, IntPtr parent);',
    '  public static IntPtr FindWorker() {',
    '    IntPtr w = IntPtr.Zero;',
    '    EnumWindows(delegate(IntPtr h, IntPtr l) {',
    '      if (FindWindowExW(h, IntPtr.Zero, "SHELLDLL_DefView", null) != IntPtr.Zero) {',
    '        w = FindWindowExW(IntPtr.Zero, h, "WorkerW", null);',
    '      }',
    '      return true;',
    '    }, IntPtr.Zero);',
    '    return w;',
    '  }',
    '  public static IntPtr Attach(IntPtr child) {',
    '    IntPtr progman = FindWindowW("Progman", null);',
    '    if (progman == IntPtr.Zero) return IntPtr.Zero;',
    '    IntPtr res;',
    '    SendMessageTimeoutW(progman, 0x052C, IntPtr.Zero, IntPtr.Zero, 2, 1000, out res);',
    '    IntPtr w = FindWorker();',
    '    if (w == IntPtr.Zero) return IntPtr.Zero;',
    '    if (SetParent(child, w) == IntPtr.Zero) return IntPtr.Zero;',
    '    return w;',
    '  }',
    '}',
    "'@",
    'Add-Type -TypeDefinition $code',
    "$w = [DeskWall]::Attach([IntPtr]::Parse('" + hwndStr + "'))",
    'Write-Output $w'
  ].join('\n');

  execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
    windowsHide: true,
    timeout: 15000
  }, (error, stdout) => {
    const out = stdout ? stdout.trim() : '';
    const ok = !error && out !== '' && out !== '0';
    cb(ok);
  });
}

function sendToBottom(hwndStr) {
  if (!hwndStr) return;
  const script = [
    "$code = @'",
    'using System;',
    'using System.Runtime.InteropServices;',
    'public class WPos {',
    '  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);',
    '}',
    "'@",
    'Add-Type -TypeDefinition $code',
    "[WPos]::SetWindowPos([IntPtr]::Parse('" + hwndStr + "'), [IntPtr]1, 0, 0, 0, 0x13) | Out-Null"
  ].join('\n');

  execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
    windowsHide: true,
    timeout: 10000
  }, () => {});
}

function dataFile() { return path.join(app.getPath('userData'), 'calendar-data.json'); }
function stateFile() { return path.join(app.getPath('userData'), 'window-state.json'); }

function loadData() {
  try { return fs.readFileSync(dataFile(), 'utf-8'); }
  catch (e) { return null; }
}

function saveData(json) {
  try {
    try {
      if (fs.existsSync(dataFile())) {
        const old = fs.readFileSync(dataFile(), 'utf-8');
        if (old && old !== json) {
          fs.writeFileSync(path.join(app.getPath('userData'), 'calendar-data.backup.json'), old, 'utf-8');
        }
      }
    } catch (e2) {}
    fs.writeFileSync(dataFile(), json, 'utf-8');
    return true;
  }
  catch (e) { return false; }
}

function loadWinState() {
  try { return JSON.parse(fs.readFileSync(stateFile(), 'utf-8')); }
  catch (e) { return {}; }
}

function saveWinState() {
  try { fs.writeFileSync(stateFile(), JSON.stringify(winState, null, 2), 'utf-8'); }
  catch (e) {}
}

let winState = loadWinState();
let mainWindow = null;
let boundsTimer = null;

function createWindow() {
  const dm = !!winState.desktopMode;
  const b = winState.bounds || {};
  const win = new BrowserWindow({
    width: b.width || 1380,
    height: b.height || 920,
    x: typeof b.x === 'number' ? b.x : undefined,
    y: typeof b.y === 'number' ? b.y : undefined,
    minWidth: 900,
    minHeight: 560,
    title: '桌面校历',
    autoHideMenuBar: true,
    frame: !dm,
    transparent: dm,
    backgroundColor: dm ? '#00000000' : undefined,
    skipTaskbar: dm,
    maximizable: !dm,
    fullscreenable: !dm,
    show: !dm,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (dm) {
    win.once('ready-to-show', () => {
      const hwndStr = hwndOf(win);
      if (hwndStr) {
        attachWorkerW(hwndStr, (ok) => {
          if (!ok) {
            try { win.setAlwaysOnTop(false); } catch (e) {}
            sendToBottom(hwndStr);
          }
          try { win.showInactive(); } catch (e) { try { win.show(); } catch (e2) {} }
        });
      } else {
        try { win.showInactive(); } catch (e) { try { win.show(); } catch (e2) {} }
      }
    });
    win.on('minimize', (e) => {
      e.preventDefault();
      if (mainWindow && !mainWindow.isDestroyed()) {
        try { mainWindow.showInactive(); } catch (e2) { mainWindow.show(); }
        const hs = hwndOf(mainWindow);
        if (hs) sendToBottom(hs);
      }
    });
  } else {
    win.once('ready-to-show', () => win.show());
  }

  const persistBounds = () => {
    clearTimeout(boundsTimer);
    boundsTimer = setTimeout(() => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isMinimized() || mainWindow.isMaximized()) return;
      winState.bounds = mainWindow.getBounds();
      saveWinState();
    }, 500);
  };
  win.on('moved', persistBounds);
  win.on('resized', persistBounds);

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow = win;
}

app.whenReady().then(() => {
  ipcMain.handle('data:load', () => loadData());
  ipcMain.handle('data:save', (e, json) => saveData(json));
  ipcMain.handle('win:is-desktop', () => !!winState.desktopMode);
  ipcMain.handle('win:set-desktop-mode', (e, enabled) => {
    winState.desktopMode = !!enabled;
    saveWinState();
    app.relaunch();
    app.exit(0);
  });
  ipcMain.handle('win:quit', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
    app.quit();
  });
  ipcMain.handle('win:focus', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  /* ================= 课表导入 / 导出 / 数据文件 ================= */

  ipcMain.handle('dialog:import-timetable', async () => {
    const r = await dialog.showOpenDialog(mainWindow, {
      title: '导入课表',
      filters: [
        { name: '课表文件（Excel / CSV / JSON）', extensions: ['xlsx', 'xls', 'csv', 'json'] }
      ],
      properties: ['openFile']
    });
    if (r.canceled || !r.filePaths || !r.filePaths.length) return { ok: false };
    const fp = r.filePaths[0];
    try {
      if (/\.xlsx?$/i.test(fp)) {
        let XLSX = null;
        try { XLSX = require('xlsx'); } catch (e) { XLSX = null; }
        if (!XLSX) return { ok: false, msg: '缺少 xlsx 解析模块，请在项目目录执行 npm install' };
        const wb = XLSX.readFile(fp);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        if (!sheet) return { ok: false, msg: 'Excel 文件中没有工作表' };
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        return { ok: true, rows };
      }
      const content = fs.readFileSync(fp, 'utf-8');
      return { ok: true, content };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  });

  ipcMain.handle('dialog:save-file', async (e, defaultName) => {
    const r = await dialog.showSaveDialog(mainWindow, {
      defaultPath: path.join(app.getPath('documents'), String(defaultName || '课表导出.xlsx')),
      filters: [
        { name: 'Excel 表格', extensions: ['xlsx'] },
        { name: 'CSV 表格', extensions: ['csv'] },
        { name: 'JSON', extensions: ['json'] }
      ]
    });
    if (r.canceled || !r.filePath) return { ok: false };
    return { ok: true, path: r.filePath };
  });

  ipcMain.handle('fs:write-text', (e, filePath, content) => {
    try {
      fs.writeFileSync(filePath, String(content), 'utf-8');
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  });

  ipcMain.handle('file:write-xlsx-timetable', (e, filePath, timetable) => {
    try {
      const XLSX = require('xlsx');
      if (!XLSX) return { ok: false, msg: '缺少 xlsx 模块' };
      const headers = ['起始时间', '结束时间', '星期', '单双周', '上课时间', '课程名称', '教师姓名', '教学楼', '场地名称', '专业', '教学班', '年级', '课程性质', '开课学院'];
      const rows = (timetable || []).map(c => ({
        '起始时间': c.startDate || '',
        '结束时间': c.endDate || '',
        '星期': '星期' + (['一', '二', '三', '四', '五', '六', '日'][(Number(c.dayNum) || 1) - 1] || ''),
        '单双周': c.weekKind || '每周',
        '上课时间': c.time || '',
        '课程名称': c.course || '',
        '教师姓名': c.teacher || '',
        '教学楼': c.building || '',
        '场地名称': c.room || '',
        '专业': c.major || '',
        '教学班': c.klass || '',
        '年级': c.grade || '',
        '课程性质': c.courseType || '',
        '开课学院': c.college || ''
      }));
      const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '课表');
      XLSX.writeFile(wb, filePath);
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  });

  ipcMain.handle('shell:open-data-folder', async () => {
    const dir = app.getPath('userData');
    try { await shell.openPath(dir); } catch (e) {}
    return { ok: true, path: dir };
  });

  /* ================= 印象笔记同步 ================= */

  ipcMain.handle('evernote:get-state', () => {
    const raw = loadData();
    if (!raw) return null;
    try {
      const d = JSON.parse(raw);
      return evernoteSync.getSyncState(d);
    } catch (e) {
      return null;
    }
  });

  ipcMain.handle('evernote:set-token', (e, token, noteStoreUrl) => {
    const raw = loadData();
    if (!raw) return { ok: false, msg: '数据加载失败' };
    try {
      const d = JSON.parse(raw);
      const state = evernoteSync.getSyncState(d);
      state.token = token;
      state.noteStoreUrl = noteStoreUrl;
      state.connected = !!(token && noteStoreUrl);
      evernoteSync.setSyncState(d, state);
      saveData(JSON.stringify(d));
      return { ok: true, state };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  });

  ipcMain.handle('evernote:clear-token', () => {
    const raw = loadData();
    if (!raw) return { ok: false, msg: '数据加载失败' };
    try {
      const d = JSON.parse(raw);
      const state = evernoteSync.getSyncState(d);
      state.token = null;
      state.noteStoreUrl = null;
      state.connected = false;
      evernoteSync.setSyncState(d, state);
      saveData(JSON.stringify(d));
      return { ok: true, state };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  });

  ipcMain.handle('evernote:push-date', async (e, dateStr, todos) => {
    const raw = loadData();
    if (!raw) return { ok: false, msg: '数据加载失败' };
    try {
      const d = JSON.parse(raw);
      const result = await evernoteSync.pushDateTodos(d, dateStr, todos);
      const state = evernoteSync.getSyncState(d);
      evernoteSync.setSyncState(d, state);
      saveData(JSON.stringify(d));
      return { ok: true, result, state };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  });

  ipcMain.handle('evernote:pull-date', async (e, dateStr) => {
    const raw = loadData();
    if (!raw) return { ok: false, msg: '数据加载失败' };
    try {
      const d = JSON.parse(raw);
      const result = await evernoteSync.pullDateTodos(d, dateStr);
      if (result) {
        d.todos[dateStr] = result.todos;
      }
      const state = evernoteSync.getSyncState(d);
      evernoteSync.setSyncState(d, state);
      saveData(JSON.stringify(d));
      return { ok: true, result, state };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  });

  ipcMain.handle('evernote:full-sync', async () => {
    const raw = loadData();
    if (!raw) return { ok: false, msg: '数据加载失败' };
    try {
      const d = JSON.parse(raw);
      const result = await evernoteSync.fullSync(d);
      if (result.todosByDate) {
        for (const dateStr in result.todosByDate) {
          d.todos[dateStr] = result.todosByDate[dateStr];
        }
      }
      const state = evernoteSync.getSyncState(d);
      evernoteSync.setSyncState(d, state);
      saveData(JSON.stringify(d));
      return { ok: true, result, state };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  });

  ipcMain.handle('evernote:parse-enml', (e, enmlContent) => {
    try {
      return evernoteSync.parseENML(enmlContent);
    } catch (err) {
      return [];
    }
  });

  ipcMain.handle('evernote:test-connection', async () => {
    const raw = loadData();
    if (!raw) return { ok: false, msg: '数据加载失败' };
    try {
      const d = JSON.parse(raw);
      const result = await evernoteSync.testConnection(d);
      return { ok: true, result };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

if (process.platform === 'win32') {
  const gotSingleLock = app.requestSingleInstanceLock();
  if (!gotSingleLock) {
    dialog.showMessageBoxSync({
      type: 'info',
      title: '桌面校历',
      message: '桌面校历已经在运行中。',
      detail: '一个桌面校历窗口已经打开，请勿重复启动。\n\n如需切换到已打开的窗口，请在任务栏或系统托盘中查找。',
      buttons: ['知道了，关闭本窗口']
    });
    app.exit(0);
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
