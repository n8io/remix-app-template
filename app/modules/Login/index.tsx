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
import { ErrorsSummary } from "../../components/ErrorsSummary";
import { App } from "../../constants/enums";
import { Route } from "../../constants/routes";
import {
  makeRequestInit,
  readFlashData as readFlashDataFromCookie,
  writeFlashData as writeFlashDataToCookie,
  writeUser as writeUserToCookie,
} from "../../utils/cookie";
import stylesUrl from "./index.css";

interface FormData {
  email?: string;
  password?: string;
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

  const { email, password } = data;
  const errors: FormErrors = {};

  if (!email) {
    errors.email = "Email is required";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length) {
    const formSession: FormSession = { data, errors };
    const cookie = await writeFlashDataToCookie<FormSession>(
      request,
      formSession
    );

    return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
  }

  const cookie = await writeUserToCookie<string>(request, email!);

  return redirect(Route.ROOT.pathname, makeRequestInit(cookie));
};

const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesUrl }];

const loader: LoaderFunction = async ({ request }) => {
  const { cookie, data = {} } = await readFlashDataFromCookie<FormSession>(
    request
  );

  return json(data, makeRequestInit(cookie));
};

const meta: MetaFunction = () => ({
  title: `${App.NAME}: Login`,
  description: "Login with your credentials",
});

const Login = () => {
  const { data, errors } = useRouteData<FormSession>();

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h1>Login</h1>
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
          </label>
        </p>
        <ErrorsSummary errors={errors} />
        <button type="submit">Log In</button>
        <p>
          <Link to={Route.SIGN_UP.pathname}>Sign Up</Link>
        </p>
      </Form>
    </div>
  );
};

export { Login, action, links, loader, meta };
