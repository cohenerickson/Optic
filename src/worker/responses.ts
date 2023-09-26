export class InvalidURL extends Response {
  constructor(url: string) {
    super(
      `${url} is not a valid URL. Try again or check your configured codec.`,
      {
        headers: {
          "content-type": "text/html"
        }
      }
    );
  }
}

export class Blank extends Response {
  constructor(url: string) {
    super(__$optic.rewrite.html(``), {
      headers: {
        "content-type": "text/html"
      }
    });
  }
}
