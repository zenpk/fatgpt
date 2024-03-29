import MarkdownIt from "markdown-it";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import texMath from "markdown-it-texmath";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import katex from "katex";
import hljs from "highlight.js";

export function generateMd(raw: string) {
  const md = new MarkdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (e) {
          return (e as Error).message;
        }
      }
      return "";
    },
  }).use(texMath, {
    engine: katex,
    delimiters: "brackets",
    katexOptions: { macros: { "\\RR": "\\mathbb{R}" } },
  });
  return md.render(raw);
}
