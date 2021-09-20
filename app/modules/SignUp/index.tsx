import { Session } from "@prisma/client";
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
import { UserProvider as UserProvider } from "../../providers/user";
import { UserSessionProvider } from "../../providers/userSession";
import { db } from "../../services/db.server";
import { logFactory } from "../../utils/logFactory";
import stylesUrl from "./index.css";

const PASSWORD_MIN_LENGTH = 8;

enum UiSignUpError {
  EMAIL_REQUIRED = "Email is required",
  FIRST_NAME_REQUIRED = "First name is required",
  LAST_NAME_REQUIRED = "Last name is required",
  PASSWORD_REQUIRED = "Password is required",
  WEAK_PASSWORD = "Your password sucks. Try again.",
  PASSWORD_CONFIRMATION_REQUIRED = "Password confirmation is required",
  PASSWORD_MISMATCH = "Password does not match",
}

interface FormData {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  passwordConfirm?: string;
}

interface GenericErrors {
  generic?: string;
}

type FormErrors = Partial<Record<keyof FormData, string>> & GenericErrors;

interface FormSession {
  data?: FormData;
  errors?: FormErrors;
}

const userProvider = new UserProvider({ db });
const userSession = new UserSessionProvider({ db });

const action: ActionFunction = async ({ request }) => {
  const log = logFactory("sign-up", "action");

  const data: FormData = Object.fromEntries(
    new URLSearchParams(await request.text())
  );

  const errors: FormErrors = {};

  if (!data?.email) {
    errors.email = UiSignUpError.EMAIL_REQUIRED;
  }

  if (!data?.firstName) {
    errors.firstName = UiSignUpError.FIRST_NAME_REQUIRED;
  }

  if (!data?.lastName) {
    errors.lastName = UiSignUpError.LAST_NAME_REQUIRED;
  }

  const password = data?.password;
  const passwordConfirm = data?.passwordConfirm;

  // Don't pass these back over the wire
  data.password = undefined;
  data.passwordConfirm = undefined;

  if (!password) {
    errors.password = UiSignUpError.PASSWORD_REQUIRED;
  } else if (password?.length < PASSWORD_MIN_LENGTH) {
    errors.password = UiSignUpError.WEAK_PASSWORD;
  }

  if (password) {
    if (!passwordConfirm) {
      errors.passwordConfirm = UiSignUpError.PASSWORD_CONFIRMATION_REQUIRED;
    } else if (passwordConfirm !== password) {
      errors.passwordConfirm = UiSignUpError.PASSWORD_MISMATCH;
    }
  }

  if (Object.keys(errors).length) {
    const formSession: FormSession = { data, errors };

    const cookie = await CookieProvider.writeFlashData<FormSession>(
      request,
      formSession
    );

    console.error(
      `👎 Invalid form. ${Object.keys(errors).length} error(s) found`,
      Object.values(errors)
    );

    return redirect(
      Route.SIGN_UP.pathname,
      CookieProvider.makeRequestInit(cookie)
    );
  }

  const familyName = data?.firstName as string;
  const givenName = data?.lastName as string;
  const email = data.email!.toLowerCase().trim();

  const newUser = {
    email,
    familyName,
    givenName,
  };

  try {
    const user = await userProvider.create({
      ...newUser,
      clearTextPassword: password as string,
    });

    const { id: sessionId }: Session = await userSession.create(
      user?.id as string
    );

    const cookie = await CookieProvider.writeData<string>(request, sessionId);

    return redirect(
      Route.ROOT.pathname,
      CookieProvider.makeRequestInit(cookie)
    );
  } catch (error) {
    console.error(`🛑 Failed to create new user`, newUser, error);

    const formSession: FormSession = {
      data,
      errors: { generic: `Sign up failed. Sorry` },
    };

    const cookie = await CookieProvider.writeFlashData<FormSession>(
      request,
      formSession
    );

    return redirect(
      Route.SIGN_UP.pathname,
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
  title: `${App.NAME}: Sign Up`,
  description: "Sign up for a new account",
});

const SignUp = () => {
  const { data, errors } = useRouteData<FormSession>();

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h1>Sign Up</h1>
      <Form method="post">
        <div>
          <label>
            Email Address:
            <br />
            <input
              className={errors?.email && "error"}
              defaultValue={data?.email ?? "a@a.a"}
              name="email"
              type="email"
            />
            <br />
            <InputError error={errors?.email} />
          </label>
        </div>
        <div>
          <label>
            First Name:
            <br />
            <input
              className={errors?.firstName && "error"}
              defaultValue={data?.firstName ?? "Nate"}
              name="firstName"
              type="text"
            />
            <br />
            <InputError error={errors?.firstName} />
          </label>
        </div>
        <div>
          <label>
            Last Name:
            <br />
            <input
              className={errors?.lastName && "error"}
              defaultValue={data?.lastName ?? "Clark"}
              name="lastName"
              type="text"
            />
            <br />
            <InputError error={errors?.lastName} />
          </label>
        </div>
        <div>
          <label>
            Password:
            <br />
            <input
              className={errors?.password && "error"}
              name="password"
              type="password"
            />
            <br />
            <InputError error={errors?.password} />
          </label>
        </div>
        <div>
          <label>
            Confirm Password:
            <br />
            <input
              className={errors?.passwordConfirm && "error"}
              name="passwordConfirm"
              type="password"
            />
            <InputError error={errors?.passwordConfirm} />
          </label>
        </div>
        <InputError error={errors?.generic} />
        <button type="submit">Sign Up</button>
        <p>
          <Link to={Route.LOGIN.pathname}>Log In</Link>
        </p>
      </Form>
    </div>
  );
};

export { SignUp, action, links, loader, meta };
