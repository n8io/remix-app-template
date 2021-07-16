import { Profile } from "@prisma/client";
import {
  createCookieSessionStorage,
  LoaderFunction,
  redirect,
  Request,
} from "remix";
import { ProcessEnv, readRequired } from "../config";
import { RequestHeader } from "../constants/requestHeader";
import { Route } from "../constants/route";
import { makeRequestInit, readData, writeData } from "./cookie.server";
import { prisma } from "./db.server";

type SessionId = string;

interface UserSession {
  now: Date;
  profile: Profile;
}

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
      secure: process.env.NODE_ENV !== "development",
    },
  });

const getUserSession = () => ({ now: new Date() });

const ensureAuthenticated = async (
  request: Request,
  next: (session: UserSession) => ReturnType<LoaderFunction>
) => {
  const sessionId = await readData<SessionId>(request);

  if (!sessionId) {
    return redirect(Route.LOGIN.pathname);
  }

  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session) {
    const cookie = await writeData<string>(request, "");

    return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
  }

  const { userId } = session;
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const userSession = { now: new Date(), profile: profile as Profile };

  return next(userSession);
};

const readSession = (request: Request) =>
  getSession(request.headers.get(RequestHeader.COOKIE));

export {
  destroySession as clearSession,
  ensureAuthenticated,
  commitSession,
  getSession,
  getUserSession,
  readSession,
};
