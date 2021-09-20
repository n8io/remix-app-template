import debug, { Debugger } from "debug";
import { App } from "../constants/app";

const loggers: Record<string, Debugger> = {};

const logFactory = (module: string, method: string): Debugger => {
  const key = `${App.CODE_NAME}:${module}${method ? `:${method}` : ""}`;
  let logger = loggers[key];

  if (!logger) {
    logger = debug(key);
    loggers[key] = logger;
  }

  return logger;
};

export { logFactory };
