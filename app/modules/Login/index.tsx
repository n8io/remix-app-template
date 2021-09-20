import { Session } from ".prisma/client";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useRouteData,
} from "remix";
import { InputError } from "../../components/InputError";
import { App } from "../../constants/app";
import { Route } from "../../constants/route";
import { CookieProvider } from "../../providers/cookie/index.server";
import { UserProvider } from "../../providers/user";
import { UserSessionProvider } from "../../providers/userSession";
import { db } from "../../services/db.server";
import { logFactory } from "../../utils/logFactory";
import stylesUrl from "./index.css";

interface FormData {
  email?: string;
  password?: string;
}

interface GenericErrors {
  generic?: string;
}

enum UiLoginErrorMessage {
  EMAIL_REQUIRED = "Email is required",
  ERROR = "Sorry, could not login",
  INVALID = "Invalid username/password. Try again.",
  PASSWORD_REQUIRED = "Password is required",
}

type FormErrors = Partial<Record<keyof FormData, string>> & GenericErrors;

interface FormSession {
  data?: FormData;
  errors?: FormErrors;
  message?: string;
}

const action: ActionFunction = async ({ request }) => {
  const log = logFactory("login", "action");
  const userProvider = new UserProvider({ db });
  const userSessionProvider = new UserSessionProvider({ db });

  const data: FormData = Object.fromEntries(
    new URLSearchParams(await request.text())
  );

  const errors: FormErrors = {};

  if (!data?.email) {
    errors.email = UiLoginErrorMessage.EMAIL_REQUIRED;
  }

  if (!data?.password) {
    errors.password = UiLoginErrorMessage.PASSWORD_REQUIRED;
  }

  data.password = undefined;

  if (Object.keys(errors).length) {
    const formSession: FormSession = { data, errors };
    const cookie = await CookieProvider.writeFlashData<FormSession>(
      request,
      formSession
    );

    return redirect(
      Route.LOGIN.pathname,
      CookieProvider.makeRequestInit(cookie)
    );
  }

  const email = data.email!.trim().toLowerCase();
  const password = data.password!;

  // Don't pass this back over the wire
  data.password = undefined;

  try {
    log(`🔐 Attempting to login as ${email}...`);

    const user = await userProvider.findByEmail(email);

    if (!user) {
      errors.generic = UiLoginErrorMessage.INVALID;

      const formSession: FormSession = { data, errors };

      const cookie = await CookieProvider.writeFlashData<FormSession>(
        request,
        formSession
      );

      return redirect(
        Route.LOGIN.pathname,
        CookieProvider.makeRequestInit(cookie)
      );
    }

    const isValidPassword = await userProvider.isValidPassword(
      user.email,
      password
    );

    if (!isValidPassword) {
      log(`🔒 Invalid password given for user: ${email}`);

      errors.generic = UiLoginErrorMessage.INVALID;

      const formSession: FormSession = { data, errors };

      const cookie = await CookieProvider.writeFlashData<FormSession>(
        request,
        formSession
      );

      return redirect(
        Route.LOGIN.pathname,
        CookieProvider.makeRequestInit(cookie)
      );
    }

    log(`💚 User logged in successfully ${email}`);

    const { id: sessionId }: Session = await userSessionProvider.create(
      user.id
    );

    const cookie = await CookieProvider.writeData<string>(request, sessionId);

    log(`↪️ Redirecting to ${Route.ROOT.pathname}...`);

    userSessionProvider.flushStale();

    return redirect(
      Route.ROOT.pathname,
      CookieProvider.makeRequestInit(cookie)
    );
  } catch (error) {
    console.error(error);

    errors.generic = UiLoginErrorMessage.ERROR;

    const formSession: FormSession = { data, errors };

    const cookie = await CookieProvider.writeFlashData<FormSession>(
      request,
      formSession
    );

    return redirect(
      Route.LOGIN.pathname,
      CookieProvider.makeRequestInit(cookie)
    );
  }
};

const links: LinksFunction = () => [
  ...InputError.links,
  { rel: "stylesheet", href: stylesUrl },
];

const loader: LoaderFunction = async ({ request }) => {
  const sessionId = await CookieProvider.readData<string>(request);

  if (sessionId) {
    return redirect(Route.ROOT.pathname);
  }

  const { cookie, data = {} } = await CookieProvider.readFlashData<FormSession>(
    request
  );

  return json(data, CookieProvider.makeRequestInit(cookie));
};

const meta: MetaFunction = () => ({
  title: `${App.NAME}: Login`,
  description: "Login with your credentials",
});

const Login = () => {
  const { data, errors, message } = useRouteData<FormSession>();

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h1>Login</h1>
      {message && (
        <>
          <br />
          <h3>{message}</h3>
        </>
      )}
      <Form method="post">
        <div>
          <label>
            Email Address:
            <br />
            <input
              className={errors?.email && "error"}
              defaultValue={data?.email}
              name="email"
              type="email"
            />
            <InputError error={errors?.email} />
          </label>
        </div>
        <div>
          <label>
            Password:
            <br />
            <input
              className={errors?.password && "error"}
              defaultValue={data?.password}
              name="password"
              type="password"
            />
            <InputError error={errors?.password} />
          </label>
        </div>
        <InputError error={errors?.generic} />
        <button type="submit">Log In</button>
        <p>
          <Link to={Route.SIGN_UP.pathname}>Sign Up</Link>
        </p>
      </Form>
    </div>
  );
};

export { Login, action, links, loader, meta };
