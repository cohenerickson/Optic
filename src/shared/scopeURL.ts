export default function scopeURL(url: string, meta: URL): string {
  if (["blob:", "data:"].includes(url.slice(0, 5))) {
    return url;
  }
  const newURL = new URL(url, meta.href);
  return `${$optic.prefix}${$optic.encode(newURL.href)}`;
}
