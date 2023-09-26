export function url(url: string, meta: URL | Location): string {
  if (!url || new RegExp(`^${__optic$config.prefix}`).test(url)) {
    return url;
  } else if (/^blob:/.test(url)) {
    return url;
  } else if (/^data:/.test(url)) {
    if (/^data:application\/javascript/.test(url)) {
      const isBase64 = /^data:application\/javascript(;.+?)?base64,/;
      const data = url.split(/,/).splice(0, 1).join(",");
      if (isBase64) {
        return `${url.match(/^[^,]+/)},${atob(
          __$optic.rewrite.js(btoa(data), meta)
        )}`;
      } else {
        return `${url.match(/^[^,]+/)},${__$optic.rewrite.js(
          decodeURIComponent(data),
          meta
        )}`;
      }
    } else {
      return url;
    }
  } else if (/^javascript:/.test(url)) {
    const js = decodeURIComponent(url.replace(/^javascript:/, ""));
    return __$optic.rewrite.js(js, meta);
  }

  const newURL = new URL(url, meta.origin + meta.pathname);
  return `${__optic$config.prefix}${__$optic.codec.encode(newURL.href)}`;
}
