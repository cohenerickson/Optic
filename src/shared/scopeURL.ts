export default function scopeURL(url: string, meta: URL | Location): string {
  if (
    !url ||
    /^(data|blob):/.test(url) ||
    new RegExp(`^${$optic.config.prefix}`).test(url)
  ) {
    return url;
  } else if (/^javascript:/.test(url)) {
    const js = decodeURIComponent(url.replace(/^javascript:/, ""));
    return $optic.rewriteJS(js, meta);
  }
  const newURL = new URL(url, meta.origin + meta.pathname);
  return `${$optic.config.prefix}${$optic.encode(newURL.href)}`;
}
