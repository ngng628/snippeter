const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
// const storage = require('electron-json-storage');
const storage = require('electron-json-storage');
const utils = require('./utils/utils');
const Snippet = require('./utils/data/snippet');
const { throwDeprecation } = require('process');
const { resolve } = require('path');

const isMac = process.platform === 'darwin'

require('electron-reload')(__dirname, {
  electron: require(path.join(__dirname, '..', 'node_modules', 'electron'))
});

// Window
let mainWindow;
let settings;
app.whenReady().then(() => {
  storage.setDataPath(path.join(__dirname, '..', 'save'));

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    // autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      defaultFontFamily: {
        standard: '源ノ角ゴシック JP',
        serif: 'Noto Serif CJK JP',
        sansSerif: '源ノ角ゴシック JP',
        monospace: 'Comic Code'
      }
    },
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.webContents.openDevTools();

  settings = utils.getSettingsToml();

  /// postApi
  ipcMain.handle('post-change-snippet-editor-color-theme', async (event, themeName) => {
    themeJson = utils.getMonacoThemeJson(themeName);
    settings.theme.snippet.name = themeName;
    mainWindow.webContents.send('reply-change-snippet-editor-color-theme', themeJson);
  });

  ipcMain.handle('post-change-markdown-editor-color-theme', async (event, themeName) => {
    themeJson = utils.getMonacoThemeJson(themeName);
    settings.theme.snippet.name = themeName;
    mainWindow.webContents.send('reply-change-markdown-editor-color-theme', themeJson);
  });

  ipcMain.handle('post-add-snippet', async (event, title, language) => {
    let snippet = new Snippet(title, language);
    storage.set(title, snippet);
    mainWindow.webContents.send('reply-add-snippet', snippet);
  });

  /// getApi
  ipcMain.handle('get-monaco-editor-color-theme-list', async (event) => {
    themeNames = await Promise.all(utils.getFileNames(path.join(__dirname, '..', 'themes'), true, '.json').map(async fullpath => {
      dum = await path.basename(fullpath, '.json');
      return dum
    }));
    return themeNames;
  });

  ipcMain.handle('get-current-snippet-editor-color-theme', async (event) => {
    return settings.theme.snippet.name;
  });

  ipcMain.handle('get-monaco-editor-color-theme-json', async (event, themeName) => {
    themeJson = utils.getMonacoThemeJson(themeName);
    return themeJson;
  });
  
  ipcMain.handle('get-snippet-template', async (event, languageName) => {
    ext = utils.getExtention(languageName);
    templateCode = utils.getTemplate(languageName);
    return templateCode;
  });

  ipcMain.handle('get-current-markdown-editor-color-theme', async (event) => {
    return settings.theme.markdown.name;
  });

  ipcMain.handle('get-html-text', async (event, markdownText) => {
    return utils.getHTMLText(markdownText);
  });

   
  const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );

  ipcMain.handle('get-snippets', async (event) => {
    return new Promise(resolve => {
      storage.getAll((err, data) => {
        if (err) {
          throw err;
        }
        res = []
        for (let key in data) {
          res.push(data[key])
        }
        console.log(res);
        resolve(res);
      });
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// About
app.setAboutPanelOptions({
  applicationName: app.name,
  applicationVersion: process.platform === 'darwin'
    ? app.getVersion()
    : `v${app.getVersion()} (electron@${process.versions['electron']})`,
  copyright: 'Copyright 2022 ngng628 and other contributors',
  version: `electron@${process.versions['electron']}`,
  iconPath: path.join(__dirname, 'icon.png'), // TODO
});

// Menu
const template = Menu.buildFromTemplate([
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: "File",
    submenu: [
      { role:'close', label:'Close Window' },
      {
        role:'settings',
        accelerator: "Control+,",
        label:'Settings',
        click: () => {
          let settingsWindow = new BrowserWindow({
            width: 500,
            height: 300,
            webPreferences: {
              preload: path.join(__dirname, 'preload.js')
            }
          });
          settingsWindow.setMenuBarVisibility(false);
          settingsWindow.loadFile(path.join(__dirname, 'settings.html'));
          settingsWindow.on('close', () => {
            settingsWindow = null;
          });
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'about',
        click: () => app.showAboutPanel(),
      }
    ]
  },
]);
Menu.setApplicationMenu(template);