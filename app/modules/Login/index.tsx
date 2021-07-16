import {
  ActionFunction,
  Form,
  Link,
  LinksFunction,
  MetaFunction,
  redirect,
  useRouteData,
} from "remix";
import { InputError } from "../../components/InputError";
import { App } from "../../constants/app";
import { Route } from "../../constants/route";
import {
  makeRequestInit,
  writeData as writeUserToCookie,
  writeFlashData as writeFlashDataToCookie,
} from "../../utils/cookie.server";
import { compare } from "../../utils/crypto.server";
import { prisma } from "../../utils/db.server";
import { logFactory } from "../../utils/logFactory";
import stylesUrl from "./index.css";

interface FormData {
  email?: string;
  password?: string;
}

interface GenericErrors {
  generic?: string;
}

const ErrorMessage = Object.freeze({
  EMAIL_REQUIRED: "Email is required",
  PASSWORD_REQUIRED: "Password is required",
  ERROR: "Sorry, could not login",
  INVALID: "Invalid username/password. Try again.",
});

type FormErrors = Partial<Record<keyof FormData, string>> & GenericErrors;

interface FormSession {
  data?: FormData;
  errors?: FormErrors;
  message?: string;
}

const action: ActionFunction = async ({ request }) => {
  const log = logFactory("login", "action");

  const data: FormData = Object.fromEntries(
    new URLSearchParams(await request.text())
  );

  const { email, password } = data;
  const errors: FormErrors = {};

  if (!email) {
    errors.email = ErrorMessage.EMAIL_REQUIRED;
  }

  if (!password) {
    errors.password = ErrorMessage.PASSWORD_REQUIRED;
  }

  if (Object.keys(errors).length) {
    const formSession: FormSession = { data, errors };
    const cookie = await writeFlashDataToCookie<FormSession>(
      request,
      formSession
    );

    return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
  }

  try {
    log(`🔐 Attempting to login as ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email: email!.trim().toLowerCase() },
    });

    if (!user) {
      log(`🔒 No user found: ${email}`);

      errors.generic = ErrorMessage.INVALID;

      const formSession: FormSession = { data, errors };

      const cookie = await writeFlashDataToCookie<FormSession>(
        request,
        formSession
      );

      return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
    }

    const { passwordHash } = user;
    const isValidPassword = await compare(password!, passwordHash);

    if (!isValidPassword) {
      log(`🔒 Invalid password given for user: ${email}`);

      errors.generic = ErrorMessage.INVALID;

      const formSession: FormSession = { data, errors };

      const cookie = await writeFlashDataToCookie<FormSession>(
        request,
        formSession
      );

      return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
    }

    log(`💚 User logged in successfully ${email}`);

    log(`✨ Creating new session for ${email}...`);

    const { id: sessionId } = await prisma.session.create({
      data: { userId: user.id },
    });

    log(`👍 New session created for ${email}`);

    const cookie = await writeUserToCookie<string>(request, sessionId);

    log(`↪️ Redirecting to ${Route.ROOT.pathname}...`);

    return redirect(Route.ROOT.pathname, makeRequestInit(cookie));
  } catch (error) {
    console.error(error);

    errors.generic = ErrorMessage.ERROR;

    const formSession: FormSession = { data, errors };

    const cookie = await writeFlashDataToCookie<FormSession>(
      request,
      formSession
    );

    return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
  }
};

const links: LinksFunction = () => [
  ...InputError.links,
  { rel: "stylesheet", href: stylesUrl },
];

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
              defaultValue={data?.email ?? "a@a.a"}
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
              defaultValue={data?.password ?? "123"}
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

export { Login, action, links, meta };
