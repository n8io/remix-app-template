import { FadeIn } from "../../components/FadeIn";
import { InputError } from "../../components/InputError";
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
import { App } from "../../constants/enums";
import { Route } from "../../constants/routes";
import {
  makeRequestInit,
  readFlashData as readFlashDataFromCookie,
  writeFlashData as writeFlashDataToCookie,
  writeUser as writeUserToCookie,
} from "../../utils/cookie";
import stylesUrl from "./index.css";

const PASSWORD_MIN_LENGTH = 8;

interface FormData {
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

interface FormSession {
  data?: FormData;
  errors?: FormErrors;
}

const action: ActionFunction = async ({ request }) => {
  const data: FormData = Object.fromEntries(
    new URLSearchParams(await request.text())
  );

  const { email, password, passwordConfirm } = data;
  const errors: FormErrors = {};

  if (!email) {
    errors.email = "Email is required";
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

    return redirect(Route.SIGN_UP.pathname, makeRequestInit(cookie));
  }

  // TODO: Create user and attach session id
  const cookie = await writeUserToCookie<string>(request, email!);

  return redirect(Route.ROOT.pathname, makeRequestInit(cookie));
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

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h1>Sign Up</h1>
      <Form method="post">
        <p>
          <label>
            Email Address:
            <br />
            <input
              className={errors?.email && "error"}
              defaultValue={data?.email}
              name="email"
              type="email"
            />
            <br />
            {errors?.email && <InputError>{errors?.email}</InputError>}
          </label>
        </p>
        <p>
          <label>
            Password:
            <br />
            <input
              className={errors?.password && "error"}
              defaultValue={data?.password}
              name="password"
              type="password"
            />
            <br />
            {errors?.password && <InputError>{errors?.password}</InputError>}
          </label>
        </p>
        <p>
          <label>
            Confirm Password:
            <br />
            <input
              className={errors?.passwordConfirm && "error"}
              defaultValue={data?.passwordConfirm}
              name="passwordConfirm"
              type="password"
            />
            <br />
            {errors?.passwordConfirm && (
              <InputError>{errors?.passwordConfirm}</InputError>
            )}
          </label>
        </p>
        <button type="submit">Sign Up</button>
        <p>
          <Link to={Route.LOGIN.pathname}>Log In</Link>
        </p>
      </Form>
    </div>
  );
};

export { SignUp, action, links, loader, meta };
