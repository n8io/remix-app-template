import { Header } from "../../constants/header";
import { commitSession, readSession } from "../../utils/session.server";

enum CookieKey {
  FLASH = "flash",
  SESSION = "session",
}

type Cookie = string;

interface FlashDataReadResponse<FlashData> {
  cookie: string;
  data?: FlashData;
}

class CookieProvider {
  constructor() {}

  static makeRequestInit(cookie: string): RequestInit {
    return {
      headers: {
        [Header.SET_COOKIE]: cookie,
      },
    };
  }

  static async readData<Data>(request: Request): Promise<Data> {
    const session = await readSession(request);
    const raw = await session.get(CookieKey.SESSION);
    const data = raw ? JSON.parse(raw) : undefined;

    return data;
  }

  static async readFlashData<FlashData>(
    request: Request
  ): Promise<FlashDataReadResponse<FlashData>> {
    const session = await readSession(request);
    const raw = await session.get(CookieKey.FLASH);
    const data = raw ? JSON.parse(raw) : undefined;
    const cookie = await commitSession(session);

    return { cookie, data };
  }

  static async writeData<Data>(request: Request, data: Data): Promise<Cookie> {
    const session = await readSession(request);

    session.set(CookieKey.SESSION, JSON.stringify(data));

    return commitSession(session);
  }

  static async writeFlashData<SessionFlashData>(
    request: Request,
    data: SessionFlashData
  ): Promise<Cookie> {
    const session = await readSession(request);

    session.flash(CookieKey.FLASH, JSON.stringify(data));

    return commitSession(session);
  }
}

export { CookieProvider };
