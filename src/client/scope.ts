// location -> $optic.location
// localStorage -> $optic.localStorage
// sessionStorage -> $optic.sessionStorage
// x.postMessage(...) -> $optic.postMessage(x, ...)
// document.domain -> $optic.location.host
// document.URL -> $optic.location.href

window._$o = function (value: any): any {
  if (value instanceof Location) {
    return $optic.location;
  }
  return value;
};
