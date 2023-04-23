import scopeURL from "./scopeURL";

export default function rewriteCSS(css: string, meta: URL | Location): string {
  return css.replace(/(?<=url\("?'?)[^"'][\S]*[^"'](?="?'?\);?)/g, (match) => {
    return scopeURL(match, meta);
  });
}
