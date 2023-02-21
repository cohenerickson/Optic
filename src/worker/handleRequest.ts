import BareClient from "@tomphttp/bare-client";
import OpticConfig from "~/types/OpticConfig";

export default async function handleResponse(
  event: FetchEvent,
  bareClient: BareClient,
  config: OpticConfig
): Promise<Response> {
  return new Response("Hello World");
}
