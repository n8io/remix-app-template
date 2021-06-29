import ReactDOMServer from "react-dom/server";
import type { EntryContext } from "remix";
import { RemixServer } from "remix";
import { Header } from "./constants/enums";

enum ContentType {
  HTML = "text/html",
}

const handleRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) => {
  const markup = ReactDOMServer.renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  const body: BodyInit = `<!DOCTYPE html>${markup}`;

  const headers: HeadersInit = {
    ...Object.fromEntries(responseHeaders),
    [Header.CONTENT_TYPE]: ContentType.HTML,
  };

  const init: ResponseInit = {
    status: responseStatusCode,
    headers,
  };

  return new Response(body, init);
};

export default handleRequest;
