import debug, { Debugger } from "debug";
import { App } from "../constants/app";

const loggers: Record<string, Debugger> = {};

const logFactory = (module: string, method?: string): Debugger => {
  const key = `${App.CODE_NAME}:${module}${method ? `:${method}` : ""}`;

  if (!loggers[key]) {
    loggers[key] = debug(key);
  }

  return loggers[key];
};

export { logFactory };
