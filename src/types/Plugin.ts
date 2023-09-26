import Worker from "~/worker";

export type Plugin = {
  /** Unique name */
  name: string;
  /** Gets executed on the worker */
  worker?: (worker: Worker) => void;
  /** Gets executed on the client */
  client?: () => void;
};

export type Events = {
  /** Fired immediately after service worker fetch */
  fetch: (event: FetchEvent) => void;
  /** Fired before proxy requests data from bare */
  request: (request: Request, url: URL) => void;
  /** Fired before proxy responds to fetch event */
  response: (response: Response) => void;
};
