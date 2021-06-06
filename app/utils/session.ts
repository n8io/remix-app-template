import {
  createCookieSessionStorage,
  LoaderFunction,
  redirect,
  Request,
} from "remix";
import { config } from "../config";
import { Header } from "../constants/enums";
import { Route } from "../constants/routes";
import { readUser } from "./cookie";

type User = string;

interface UserSession {
  user: User;
  now: Date;
}

const { commitSession, getSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__s",
      sameSite: "lax",
      secrets: [config.AUTH_SECRET],
    },
  });

const getUserSession = () => ({ now: new Date() });

const ensureAuthenticated = async (
  request: Request,
  next: (session: UserSession) => ReturnType<LoaderFunction>
) => {
  const user = await readUser<User>(request);

  if (!user) {
    return redirect(Route.LOGIN.pathname);
  }

  return next({ now: new Date(), user });
};

const readSession = (request: Request) =>
  getSession(request.headers.get(Header.COOKIE));

export {
  destroySession as clearSession,
  ensureAuthenticated,
  commitSession,
  getSession,
  getUserSession,
  readSession,
};
