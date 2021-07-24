import { Debug } from 'debug';
import { ActionFunction, LoaderFunction, Request, redirect } from 'remix';
import { Route } from "../../constants/route";
import {
  makeRequestInit,
  readData,
  writeData,
  writeFlashData
} from "../../utils/cookie.server";
import { prisma } from "../../utils/db.server";
import { logFactory } from "../../utils/logFactory";
import { ensureAuthenticated, readUserProfile } from '../../utils/session.server';
import debug from 'debug';
import { PrismaErrorCode } from '../../constants/prismaErrorCode';

type SessionId = string;

interface FlashData {
  message: string;
}

const killSessionAndRedirectToLogin = async (request: Request, log: debug.Debugger) => {
  const sessionId = await readData<SessionId>(request);

  if (sessionId) {
    try {
      log(`🔥 Deleting existing session: ${sessionId}...`)
      await prisma.session.delete({ where: { id: sessionId } });
      log(`🔥 Session deleted: ${sessionId}`)
    } catch (error) {
      if (error.code === PrismaErrorCode.RECORD_NOT_FOUND) {
        log(`🔥 Session "${sessionId}" no longer not exists. Nothing to do.`)
      } else {
        console.error(`🔴 Failed to delete user session: ${sessionId}`, error)
      }
    }
  }

  await writeData(request, "");

  const cookie = await writeFlashData<FlashData>(request, {
    message: "You have been successfully logged out",
  });

  log(`🔀 Redirecting to ${Route.LOGIN.pathname}...`)

  return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
}

const action: ActionFunction = async ({ request }) => {
  const log = logFactory("logout", "action");

  return killSessionAndRedirectToLogin(request, log)
};

const loader: LoaderFunction = async ({ request }) =>{
  const log = logFactory("logout", "loader");

  return killSessionAndRedirectToLogin(request, log)
}

const Logout = () => null;

export { Logout, action, loader };
