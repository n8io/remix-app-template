import { ActionFunction, redirect } from "remix";
import { Route } from "../../constants/route";
import { CookieProvider } from "../../providers/cookie/index.server";
import { UserSessionProvider } from "../../providers/userSession";
import { db } from "../../services/db.server";

type SessionId = string;

interface FlashData {
  message: string;
}

const userSessionProvider = new UserSessionProvider({ db });

const action: ActionFunction = async ({ request }) => {
  const sessionId = await CookieProvider.readData<SessionId>(request);

  if (sessionId) {
    try {
      await userSessionProvider.expire(sessionId);
    } catch {
      // TODO: What do we do when this fails??
    }
  }

  await CookieProvider.writeData(request, "");

  const cookie = await CookieProvider.writeFlashData<FlashData>(request, {
    message: "You have been successfully logged out",
  });

  return redirect(Route.LOGIN.pathname, CookieProvider.makeRequestInit(cookie));
};

const Logout = () => null;

export { Logout, action };
