const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('postApi', {
  changeSnippetEditorColorTheme: async (themeName) => await ipcRenderer.invoke('post-change-snippet-editor-color-theme', themeName),
  changeMarkdownEditorColorTheme: async (themeName) => await ipcRenderer.invoke('post-change-markdown-editor-color-theme', themeName),
  addSnippet: async (title, language) => await ipcRenderer.invoke('post-add-snippet', title, language),
});

contextBridge.exposeInMainWorld('getApi', {
  snippetEditorColorThemeList: async () => await ipcRenderer.invoke('get-monaco-editor-color-theme-list'),
  currentSnippetEditorColorTheme: async () => await ipcRenderer.invoke('get-current-snippet-editor-color-theme'),
  snippetEditorColorThemeJson: async (themeName) => await ipcRenderer.invoke('get-monaco-editor-color-theme-json', themeName),

  snippetTemplate: async (languageName) => await ipcRenderer.invoke('get-snippet-template', languageName),

  markdownEditorColorThemeList: async () => await ipcRenderer.invoke('get-monaco-editor-color-theme-list'),
  currentMarkdownEditorColorTheme: async () => await ipcRenderer.invoke('get-current-markdown-editor-color-theme'),
  markdownEditorColorThemeJson: async (themeName) => await ipcRenderer.invoke('get-monaco-editor-color-theme-json', themeName),

  htmlText: async (markdownText) => await ipcRenderer.invoke('get-html-text', markdownText),

  snippets: async () => await ipcRenderer.invoke('get-snippets')
});

contextBridge.exposeInMainWorld('subscribeApi', {
  changeSnippetEditorColorTheme: (callback) => ipcRenderer.on('reply-change-snippet-editor-color-theme', callback),
  changeMarkdownEditorColorTheme: (callback) => ipcRenderer.on('reply-change-markdown-editor-color-theme', callback),
  addSnippet: (callback) => ipcRenderer.on('reply-add-snippet', callback),
});