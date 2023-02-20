export default async function handleResponse(
  event: FetchEvent
): Promise<Response> {
  return new Response("Hello World");
}
