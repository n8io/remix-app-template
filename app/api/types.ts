import { EntryContext } from "remix";

interface MiddlewareFunction {
  (args: {
    remixContext: EntryContext;
    request: Request;
    responseStatusCode: number;
    responseHeaders: Headers;
  }): Promise<Response> | Response | Promise<any> | any;
}

export type { MiddlewareFunction };
