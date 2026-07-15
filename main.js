const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

ipcMain.handle('generate-qr', async (event, text, options) => {
  try {
    const qrData = QRCode.create(text, { errorCorrectionLevel: options.errorLevel });
    const size = qrData.modules.size;
    const modules = [];
    for (let y = 0; y < size; y++) {
      modules[y] = [];
      for (let x = 0; x < size; x++) {
        modules[y][x] = qrData.modules.get(x, y);
      }
    }
    return { modules, size };
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.handle('save-png', async (event, { dataUrl, fileName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: fileName || 'qrcode.png',
    filters: [{ name: 'PNG Image', extensions: ['png'] }]
  });

  if (!result.canceled && result.filePath) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(result.filePath, Buffer.from(base64Data, 'base64'));
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

ipcMain.handle('save-svg', async (event, { svgContent, fileName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: fileName || 'qrcode.svg',
    filters: [{ name: 'SVG Image', extensions: ['svg'] }]
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, svgContent, 'utf-8');
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
