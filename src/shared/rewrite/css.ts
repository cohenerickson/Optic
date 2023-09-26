export function css(css: string, meta: URL | Location): string {
  return css.replace(/(?:@import\s?|url\(?)['"]?(.*?)['")]/gim, (...args) => {
    return args[0].replace(args[3], __$optic.rewrite.url(args[3], meta));
  });
}
