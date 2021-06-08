import {
  ActionFunction,
  Form,
  json,
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
  readFlashData,
  writeFlashData,
  writeUser,
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

    const cookie = await writeFlashData<FormSession>(request, formSession);

    return redirect(Route.LOGIN.pathname, makeRequestInit(cookie));
  }

  const cookie = await writeUser<string>(request, email!);

  return redirect(Route.ROOT.pathname, makeRequestInit(cookie));
};

const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesUrl }];

const loader: LoaderFunction = async ({ request }) => {
  const { cookie, data = {} } = await readFlashData<FormSession>(request);

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
        <button type="submit">Log In</button>
      </Form>
    </div>
  );
};

export { Login, action, links, loader, meta };
