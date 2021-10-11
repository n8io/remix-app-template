import { Profile } from "@prisma/client";
import { createCookieSessionStorage, LoaderFunction, redirect } from "remix";
import { ProcessEnv, readRequired } from "../config";
import { Environment } from "../constants/environment";
import { Header } from "../constants/header";
import { Route } from "../constants/route";
import { CookieProvider } from "../providers/cookie/index.server";
import { UserProfileProvider } from "../providers/userProfile";
import { UserSessionProvider } from "../providers/userSession";
import { db } from "../services/db.server";

type SessionId = string;

interface ClientUserSession {
  now: Date;
  profile: Profile;
}

const isDevelopment = process.env.NODE_ENV === Environment.DEVELOPMENT;

const { commitSession, getSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      expires: new Date("2099-12-31"),
      httpOnly: true,
      // maxAge: 30, // TODO: Set to a user preferred value
      name: "__s",
      path: "/",
      sameSite: "lax",
      secrets: [readRequired(ProcessEnv.AUTH_SECRET)],
      secure: !isDevelopment,
    },
  });

const userProfileProvider = new UserProfileProvider({ db });
const userSessionProvider = new UserSessionProvider({ db });

const ensureAuthenticated = async (
  request: Request,
  next: (session: ClientUserSession) => ReturnType<LoaderFunction>
) => {
  const sessionId = await CookieProvider.readData<SessionId>(request);

  if (!sessionId) {
    return redirect(Route.LOGIN.pathname);
  }

  const session = await userSessionProvider.find(sessionId);

  if (!session) {
    const cookie = await CookieProvider.writeData<string>(request, "");

    return redirect(
      Route.LOGIN.pathname,
      CookieProvider.makeRequestInit(cookie)
    );
  }

  const { userId } = session;

  await userSessionProvider.touch(sessionId);

  const profile = await userProfileProvider.findByUserId(userId);

  const clientUserSession: ClientUserSession = {
    now: new Date(),
    profile: profile as Profile,
  };

  return next(clientUserSession);
};

const readSession = (request: Request) =>
  getSession(request.headers.get(Header.COOKIE));

export {
  destroySession as clearSession,
  ensureAuthenticated,
  commitSession,
  getSession,
  readSession,
};
