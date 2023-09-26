import { Plugin } from "~/types/Plugin";

export function UserAgent(ua: string, chUa?: string): Plugin {
  return {
    name: "UserAgent",
    worker(worker) {
      worker.on("request", (request) => {
        request.headers.set("user-agent", ua);
        if (chUa) request.headers.set("sec-ch-ua", chUa);
      });
    },
    client() {
      Object.defineProperty(navigator, "userAgent", {
        get() {
          return ua;
        }
      });
    }
  };
}
