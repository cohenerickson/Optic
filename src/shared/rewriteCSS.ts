import scopeURL from "./scopeURL";

export default function rewriteCSS(css: string, meta: URL): string {
  return css.replace(/(?<=url\("?'?)[^"'][\S]*[^"'](?="?'?\);?)/g, (match) => {
    return scopeURL(match, meta);
  });
}
