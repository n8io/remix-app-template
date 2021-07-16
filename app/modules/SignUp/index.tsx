import { Profile, Session, User } from "@prisma/client";
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
import {
  makeRequestInit,
  readFlashData as readFlashDataFromCookie,
  writeData as writeDataToCookie,
  writeFlashData as writeFlashDataToCookie,
} from "../../utils/cookie.server";
import { hash } from "../../utils/crypto.server";
import { prisma } from "../../utils/db.server";
import { logFactory } from "../../utils/logFactory";
import stylesUrl from "./index.css";

const PASSWORD_MIN_LENGTH = 8;

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

const action: ActionFunction = async ({ request }) => {
  const log = logFactory("sign-up", "action");

  const data: FormData = Object.fromEntries(
    new URLSearchParams(await request.text())
  );

  const { email, firstName, lastName, password, passwordConfirm } = data;
  const errors: FormErrors = {};

  if (!email) {
    errors.email = "Email is required";
  }
  if (!firstName) {
    errors.firstName = "First name is required";
  }

  if (!lastName) {
    errors.lastName = "Last name is required";
  }

  if (!firstName) {
    errors.firstName = "First name is required";
  }

  if (!lastName) {
    errors.lastName = "Last name is required";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = "Your password sucks. Try again.";
  }

  if (password) {
    if (!passwordConfirm) {
      errors.passwordConfirm = "Password confirmation is required";
    } else if (passwordConfirm !== password) {
      errors.passwordConfirm = "Password does not match";
    }
  }

  if (Object.keys(errors).length) {
    const formSession: FormSession = { data, errors };

    const cookie = await writeFlashDataToCookie<FormSession>(
      request,
      formSession
    );

    console.error(
      `👎 Invalid form. ${Object.keys(errors).length} error(s) found`,
      Object.values(errors)
    );

    return redirect(Route.SIGN_UP.pathname, makeRequestInit(cookie));
  }

  try {
    const newUser: Partial<User> = {
      email: data.email!.toLowerCase().trim(),
      passwordHash: await hash(data.password!),
    };

    const { id: userId } = await prisma.user.create({
      data: newUser as any,
      select: { id: true },
    });

    const newProfile: Partial<Profile> = {
      familyName: lastName,
      givenName: firstName,
      userId,
    };

    await prisma.profile.create({ data: newProfile as any });

    const newSession: Partial<Session> = { userId };

    const { id: sessionId } = await prisma.session.create({
      data: newSession as any,
      select: { id: true },
    });

    const cookie = await writeDataToCookie<string>(request, sessionId);

    return redirect(Route.ROOT.pathname, makeRequestInit(cookie));
  } catch (error) {
    console.error(error);

    const formSession: FormSession = {
      data,
      errors: { generic: `Sign up failed. Sorry` },
    };

    const cookie = await writeFlashDataToCookie<FormSession>(
      request,
      formSession
    );

    return redirect(Route.SIGN_UP.pathname, makeRequestInit(cookie));
  }
};

const links: LinksFunction = () => [
  ...InputError.links,
  { rel: "stylesheet", href: stylesUrl },
];

const loader: LoaderFunction = async ({ request }) => {
  const { cookie, data = {} } = await readFlashDataFromCookie<FormSession>(
    request
  );

  return json(data, makeRequestInit(cookie));
};

const meta: MetaFunction = () => ({
  title: `${App.NAME}: Sign Up`,
  description: "Sign up for a new account",
});

const SignUp = () => {
  const { data, errors } = useRouteData<FormSession>();

  console.log({ errors });

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
              defaultValue={data?.password ?? "12345678"}
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
              defaultValue={data?.passwordConfirm ?? "12345678"}
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
