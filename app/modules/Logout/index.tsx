import { ActionFunction, redirect } from "remix";
import { Route } from "../../constants/routes";
import {
  makeRequestInit,
  readData,
  writeData,
  writeFlashData,
} from "../../utils/cookie.server";
import { prisma } from "../../utils/db.server";
import { logFactory } from "../../utils/logFactory";

type SessionId = string;

interface FlashData {
  message: string;
}

const action: ActionFunction = async ({ request }) => {
  const log = logFactory("logout", "action");
  const sessionId = await readData<SessionId>(request);

  if (sessionId) {
    log(`🔥 Deleting existing session: ${sessionId}...`)
    await prisma.session.delete({ where: { id: sessionId } });
    log(`🔥 Session deleted: ${sessionId}`)
  }

  await writeData(request, "");

  const cookie = await writeFlashData<FlashData>(request, {
    message: "You have been successfully logged out",
  });

  log(`🔀 Redirecting to ${Route.LOGIN.pathname}...`)

  return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
};

const Logout = () => null;

export { Logout, action };
