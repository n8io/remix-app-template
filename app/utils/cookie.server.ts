import { Request } from "node-fetch";
import { Header } from "../constants/enums";
import { commitSession, readSession } from "./session.server";

enum CookieKey {
  FLASH = "flash",
  SESSION = "session",
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
  const raw = await session.get(CookieKey.FLASH);
  const data = raw ? JSON.parse(raw) : undefined;
  const cookie = await commitSession(session);

  return { cookie, data };
};

const writeFlashData = async <SessionFlashData>(
  request: Request,
  data: SessionFlashData
): Promise<string> => {
  const session = await readSession(request);

  session.flash(CookieKey.FLASH, JSON.stringify(data));

  return commitSession(session);
};

const readData = async <Data>(request: Request): Promise<Data> => {
  const session = await readSession(request);
  const raw = await session.get(CookieKey.SESSION);
  const data = raw ? JSON.parse(raw) : undefined;

  return data as Data;
};

const writeData = async <Data>(request: Request, data: Data) => {
  const session = await readSession(request);

  session.set(CookieKey.SESSION, JSON.stringify(data));

  return commitSession(session);
};

export { makeRequestInit, readData, readFlashData, writeData, writeFlashData };
