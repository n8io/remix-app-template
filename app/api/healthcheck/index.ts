import { json } from "remix";
import { MiddlewareFunction } from "../types";

const handler: MiddlewareFunction = async () => {
  const info = {
    message: "OK",
    timestamp: new Date(),
  };

  return json(info);
};

export { handler };
