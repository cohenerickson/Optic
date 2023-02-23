export function incoming(headers: Headers): Headers {
  [
    "content-security-policy",
    "cache-control",
    "clear-site-data",
    "content-encoding",
    "content-length",
    "cross-origin-opener-policy",
    "cross-origin-opener-policy-report-only",
    "report-to",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options"
  ].forEach((header) => {
    headers.delete(header);
  });
  return headers;
}

export function outgoing(headers: Headers): Headers {
  return headers;
}
