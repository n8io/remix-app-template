import { Request } from "node-fetch";
import { Header } from "../constants/enums";
import { commitSession, readSession } from "./session";

enum CookieKey {
  FORM = "form",
  USER = "user",
}

interface FlashDataReadResponse<FlashData> {
  cookie: string;
  data?: FlashData;
}

const makeRequestInit = (cookie: string) => ({
  headers: {
    [Header.SET_COOKIE]: cookie,
  },
});

const readFlashData = async <FlashData>(
  request: Request
): Promise<FlashDataReadResponse<FlashData>> => {
  const session = await readSession(request);
  const raw = await session.get(CookieKey.FORM);
  const data = raw ? JSON.parse(raw) : undefined;
  const cookie = await commitSession(session);

  return { cookie, data };
};

const writeFlashData = async <SessionFlashData>(
  request: Request,
  data: SessionFlashData
): Promise<string> => {
  const session = await readSession(request);

  session.flash(CookieKey.FORM, JSON.stringify(data));

  return commitSession(session);
};

const readUser = async <User>(request: Request): Promise<User> => {
  const session = await readSession(request);
  const raw = await session.get(CookieKey.USER);
  const data = raw ? JSON.parse(raw) : undefined;

  return data as User;
};

const writeUser = async <Data>(request: Request, data: Data) => {
  const session = await readSession(request);

  session.set(CookieKey.USER, JSON.stringify(data));

  return commitSession(session);
};

export { makeRequestInit, readFlashData, readUser, writeFlashData, writeUser };
