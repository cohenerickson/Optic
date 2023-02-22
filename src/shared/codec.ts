export function encode(url: string): string {
  return encodeURIComponent(url);
}

export function decode(encodedURL: string): string {
  return decodeURIComponent(encodedURL);
}
