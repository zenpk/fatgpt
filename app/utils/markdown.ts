import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

export function generateMd(raw: string) {
  const md = new MarkdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (e) {
          console.log(e);
        }
      }
      return "";
    },
  });
  return md.render(raw);
}
