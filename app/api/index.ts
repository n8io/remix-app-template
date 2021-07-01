import { Route } from "../constants/routes";
import { handler as healthCheck } from "./healthcheck";
import { MiddlewareFunction } from "./types";

const api: Record<string, MiddlewareFunction> = {
  [Route.HEALTH_CHECK.pathname]: healthCheck,
};

export { api };
