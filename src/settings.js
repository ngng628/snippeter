
window.onload = async () => {
  snippetEditorColorTheme = document.getElementById('snippet-editor-color-theme');
  themeNames = await window.getApi.snippetEditorColorThemeList();
  currentThemeName = await window.getApi.currentSnippetEditorColorTheme();
  for (let themeName of themeNames) {
    opt = document.createElement('option');
    opt.text = themeName;
    opt.value = themeName;
    opt.selected = (themeName === currentThemeName);
    snippetEditorColorTheme.appendChild(opt);
  }
}

document.getElementById("snippet-editor-color-theme").addEventListener('change', async () => {
  themeName = document.getElementById("snippet-editor-color-theme").value;
  window.postApi.changeSnippetEditorColorTheme(themeName);
});