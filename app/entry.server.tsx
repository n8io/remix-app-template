import { renderToString } from "react-dom/server";
import type { EntryContext } from "remix";
import { RemixServer } from "remix";
import { api } from "./api";
import { ContentType } from "./constants/contentType";
import { RequestHeader } from "./constants/requestHeader";

const handleRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) => {
  const pathname = new URL(request.url).pathname.toLowerCase();

  if (api[pathname]) {
    return api[pathname]({
      remixContext,
      request,
      responseStatusCode,
      responseHeaders,
    });
  }

  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  const body: BodyInit = `<!DOCTYPE html>${markup}`;

  const headers: HeadersInit = {
    ...Object.fromEntries(responseHeaders),
    [RequestHeader.CONTENT_TYPE]: ContentType.HTML,
  };

  const init: ResponseInit = {
    status: responseStatusCode,
    headers,
  };

  return new Response(body, init);
};

export default handleRequest;
