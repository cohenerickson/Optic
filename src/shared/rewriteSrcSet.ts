import scopeURL from "./scopeURL";

export default function rewriteSrcset(value: string, meta: URL | Location): string {
  const urls = value.split(/ [0-9]+x,? ?/g);
  if (!urls) return "";
  const sufixes = value.match(/ [0-9]+x,? ?/g);
  if (!sufixes) return "";
  const rewrittenUrls = urls.map((url, i) => {
    if (url && sufixes[i]) return scopeURL(url, meta) + sufixes[i];
  });
  return rewrittenUrls.join("");
}
