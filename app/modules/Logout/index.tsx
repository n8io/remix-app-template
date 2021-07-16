import { ActionFunction, redirect } from "remix";
import { Route } from "../../constants/route";
import {
  makeRequestInit,
  readData,
  writeData,
  writeFlashData,
} from "../../utils/cookie.server";
import { prisma } from "../../utils/db.server";

type SessionId = string;

interface FlashData {
  message: string;
}

const action: ActionFunction = async ({ request }) => {
  const sessionId = await readData<SessionId>(request);

  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } });
  }

  await writeData(request, "");

  const cookie = await writeFlashData<FlashData>(request, {
    message: "You have been successfully logged out",
  });

  return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
};

const Logout = () => null;

export { Logout, action };
