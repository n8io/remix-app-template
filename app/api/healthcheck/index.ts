import { json } from "remix";
import { MiddlewareFunction } from "../types";

const handler: MiddlewareFunction = async () =>
  json({
    message: "OK",
    timestamp: new Date(),
  });

export { handler };
