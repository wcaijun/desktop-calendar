const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (json) => ipcRenderer.invoke('data:save', json),
  isDesktopMode: () => ipcRenderer.invoke('win:is-desktop'),
  setDesktopMode: (enabled) => ipcRenderer.invoke('win:set-desktop-mode', enabled),
  quit: () => ipcRenderer.invoke('win:quit'),
  /* 课表导入 / 导出 / 数据文件夹 */
  importTimetableFile: () => ipcRenderer.invoke('dialog:import-timetable'),
  saveFileDialog: (defaultName) => ipcRenderer.invoke('dialog:save-file', defaultName),
  writeTextFile: (filePath, content) => ipcRenderer.invoke('fs:write-text', filePath, content),
  writeXlsxTimetable: (filePath, timetable) => ipcRenderer.invoke('file:write-xlsx-timetable', filePath, timetable),
  openDataFolder: () => ipcRenderer.invoke('shell:open-data-folder'),
  /* 印象笔记同步 */
  evernoteGetState: () => ipcRenderer.invoke('evernote:get-state'),
  evernoteSetToken: (token, noteStoreUrl) => ipcRenderer.invoke('evernote:set-token', token, noteStoreUrl),
  evernoteClearToken: () => ipcRenderer.invoke('evernote:clear-token'),
  evernotePushDate: (dateStr, todos) => ipcRenderer.invoke('evernote:push-date', dateStr, todos),
  evernotePullDate: (dateStr) => ipcRenderer.invoke('evernote:pull-date', dateStr),
  evernoteFullSync: () => ipcRenderer.invoke('evernote:full-sync'),
  evernoteParseENML: (enml) => ipcRenderer.invoke('evernote:parse-enml', enml),
  evernoteTestConnection: () => ipcRenderer.invoke('evernote:test-connection')
});
