const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateQR: (text, options) => ipcRenderer.invoke('generate-qr', text, options),
  savePNG: (data) => ipcRenderer.invoke('save-png', data),
  saveSVG: (data) => ipcRenderer.invoke('save-svg', data)
});
