let markdownEditor;
window.onload = async () => {
  // markdown editor
  markdownEditor = ace.edit("markdown-editor")
  markdownEditor.getSession().setMode("ace/mode/markdown");
  markdownEditor.setTheme("ace/theme/chrome");
  markdownEditor.getSession().on('change', async () => {
    let s = markdownEditor.getSession().getValue();
    value = await window.getApi.htmlText(s);
    document.getElementById('markdown-preview').innerHTML = value;  
  });


  // データベースにあるスニペットを展開します。
  const snippets = await window.getApi.snippets();
  snippets_dict = {};
  for (let snippet of snippets) {
    lang = snippet.language;
    if (!(lang in snippets_dict)) {
      snippets_dict[lang] = []
    }
    snippets_dict[lang].push(snippet)
  }

  let snippetListElement = document.getElementById('language-list');
  for (let lang in snippets_dict) {
    let li = document.createElement('li');
    li.id = "snippet-list-" + lang;
    li.innerHTML = lang;
    
    let ul = document.createElement('ul');
    for (let snippet of snippets_dict[lang]) {
      let li2 = document.createElement('li');
      li2.id = "snippet-list-" + lang + "-" + lang.title; // TODO
      li2.innerHTML = snippet.title;
      ul.appendChild(li2);
    }
    li.appendChild(ul);

    snippetListElement.appendChild(li);
  }

  document.getElementById('add-snippet-button').addEventListener('click', () => {
    alert('clicked');
    window.postApi.addSnippet('title', 'cpp');
  });
};

require.config({ paths: { vs: "../node_modules/monaco-editor/min/vs" } });

let snippetEditor;
require(["vs/editor/editor.main"], async () => {
  // snippet
  snippetThemeName = await window.getApi.currentSnippetEditorColorTheme();
  snippetThemeJson = await window.getApi.snippetEditorColorThemeJson(snippetThemeName);
  monaco.editor.defineTheme('snippetTheme', snippetThemeJson);

  language = 'cpp';
  value = await window.getApi.snippetTemplate(language);

  snippetEditor = monaco.editor.create(
    document.getElementById("snippet-editor"),
    {
      value: value,
      language: language,
      automaticLayout: true,
      minimap: { enabled: false },
      theme: 'snippetTheme'
    }
  );
});

window.subscribeApi.changeSnippetEditorColorTheme((event, themeJson) => {
  monaco.editor.defineTheme('snippetTheme', themeJson);
  snippetEditor._themeService.setTheme("snippetTheme");
});

window.subscribeApi.changeMarkdownEditorColorTheme((event, themeJson) => {
  monaco.editor.defineTheme('markdownTheme', themeJson);
  markdownEditor._themeService.setTheme("markdownTheme");
});

window.subscribeApi.addSnippet((event, snippet) => {
  let snippetListElement = document.getElementById('snippet-list');
  let li = document.createElement('li');
  li.innerHTML = snippet.title;
  snippetListElement.appendChild(li);
});