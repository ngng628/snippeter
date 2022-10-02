const path = require('path');
const fs = require('fs');
const glob = require('glob');
const toml = require('toml');
const hljs = require('highlight.js');

const tm = require('markdown-it-texmath');
const md = require('markdown-it')({
  html: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs ' + lang + '">' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
}).use(tm, { engine: require('katex'),
              delimiters: 'dollars',
              katexOptions: { macros: {"\\RR": "\\mathbb{R}"} } });

/**
 * @breif 言語名からスニペットのテンプレートを取得します。
 * @param languageName 言語名
 * @returns テンプレートの文字列配列
 */
exports.getExtention = (languageName) => {
  return languageName;
};

/**
 * @breif テーマ名からMonacoのJsonデータを得ます。
 * @param themeName テーマ名
 * @returns Jsonのパースされたデータ
 */
exports.getMonacoThemeJson = (themeName) => {
  s = fs.readFileSync( path.join(__dirname, '..', '..', 'themes', themeName + '.json'), "utf8" );
  return JSON.parse(s);
};

/**
 * @breif 設定データを得ます。
 * @returns TomlのパースされたJsonObjectデータ
 */
exports.getSettingsToml = () => {
  s = fs.readFileSync( path.join(__dirname, '..', '..', 'settings.toml'), "utf8" );
  try {
    return toml.parse(s);
  }
  catch (e) {
    alert('Parsing error on line ' + e.line + ', column ' + e.column +
    ': ' + e.message)
  }
};

/**
 * @brief 指定したディレクトリのファイルをすべて取得します
 * @param dirPath ディレクトリへのパス
 * @param includeSubDir サブディレクトリ以下を含めるか
 * @param extension 拡張子
 * @returns ファイル一覧
 */
exports.getFileNames = (dirPath, includeSubDir=false, extension='') => {
  let pattern;
  if (includeSubDir) {
    if (extension === '') {
      pattern = path.join(dirPath, '**', '*' + extension);
    }
    else {
      pattern = path.join(dirPath, '**', '*' + extension);
    }
  }
  else {
    if (extension === '') {
      pattern = path.join(dirPath, '*' + extension);
    }
    else {
      pattern = path.join(dirPath, '*' + extension);
    }
  }
  return glob.sync(pattern);
}

/**
 * @breif 言語名からスニペットのテンプレートを取得します。
 * @param languageName 言語名
 * @returns テンプレートの文字列配列
 */
exports.getTemplate = (languageName) => {
  let filePath = path.join(__dirname, '..', '..', 'templates', 'snippet' + '.' + languageName);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8");
  }
  else {
    return "";
  }
};

/**
 * @breif MarkdownからHTMLテキストを取得します。
 * @param markdownText Markdownのテキストデータ
 * @returns HTMLテキスト
 */
exports.getHTMLText = (markdownText) => {
  return md.render(markdownText);
};