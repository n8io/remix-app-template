import { Profile, Role } from '@prisma/client';
import {
  createCookieSessionStorage,
  LoaderFunction,
  redirect,
  Request
} from "remix";
import { ProcessEnv, readRequired } from "../config";
import { RequestHeader } from '../constants/requestHeader';
import { Route } from "../constants/route";
import { makeRequestInit, readData, writeData } from "./cookie.server";
import { prisma } from "./db.server";
import { logFactory } from "./logFactory";

type SessionId = string;

interface UserProfile {
  familyName: string
  givenName: string
  id: string
  role: Role
  userId: string
}

interface UserSession {
  now: Date;
  profile: Partial<Profile>;
}

const { commitSession, getSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      expires: new Date("9999-12-31"),
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

const readUserProfile = async (request: Request): Promise<UserProfile | undefined> => {
  const log = logFactory('session', 'readUserProfile')
  const sessionId = await readData<SessionId>(request);

  if (!sessionId) {
    log(`👎 No session id in cookie. Redirecting to ${Route.LOGIN.pathname}...`)

    return;
  }

  log(`🔎 Looking up session ${sessionId}...`)

  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session) {
    log(`👎 No session found. Redirecting to ${Route.LOGIN.pathname}...`)

    return;
  }


  const { userId } = session;

  log(`👍 Session found: ${userId}`);

  log(`🔎 Looking up user: ${userId}`);

  const foundUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!foundUser) {
    log(`👎 No user found. Redirecting to ${Route.LOGIN.pathname}...`)

    return;
  }

  const { role } = foundUser;

  log(`👍 User found: ${userId}`, { role });

  log(`🔎 Looking up user's profile: ${userId}`);

  const foundProfile = await prisma.profile.findUnique({ where: { userId } });

  if (!foundProfile) {
    log(`👎 No user profile found. Redirecting to ${Route.LOGIN.pathname}...`)

    return;
  }

  const { familyName, givenName, id } = foundProfile;

  log(`👍 User profile found: ${id}`, { familyName, givenName, userId });

  return { familyName, givenName, id, userId, role }
}

const ensureAuthenticated = async (
  request: Request,
  next: (session: UserSession) => ReturnType<LoaderFunction>
) => {
  const log = logFactory('session', 'ensureAuthenticated')
  const profile = await readUserProfile(request);

  if (!profile) {
    const cookie = await writeData<string>(request, "");

    log(`👎 No user profile found. Redirecting to ${Route.LOGIN.pathname}...`)

    return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
  }

  const userSession = { now: new Date(), profile };

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
  readUserProfile,
};
