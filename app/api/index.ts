import { Route } from "../constants/route";
import { handler as healthCheck } from "./healthCheck";
import { MiddlewareFunction } from "./types";

const api: Record<string, MiddlewareFunction> = {
  [Route.HEALTH_CHECK.pathname]: healthCheck,
};

export { api };
