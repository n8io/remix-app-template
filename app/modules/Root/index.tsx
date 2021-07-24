import {
  Form,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  useRouteData,
} from "remix";
import { App } from "../../constants/app";
import { Route } from "../../constants/route";
import { ensureAuthenticated } from "../../utils/session.server";
import stylesUrl from "./index.css";

const links: LinksFunction = () => [
  { rel: "author", href: "/humans.txt" },
  { rel: "stylesheet", href: stylesUrl },
];

const loader: LoaderFunction = async ({ request }) =>
  ensureAuthenticated(request, (userSession) => userSession);

const meta: MetaFunction = () => ({
  title: App.NAME,
  description: App.DESCRIPTION,
});

const Root = () => {
  const data = useRouteData();

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h1>{App.NAME}</h1>
      <p>
        Message from the loader:{" "}
        {`${data.profile?.givenName} ${data.profile?.familyName}`}
      </p>
      <p>
        <Form action={Route.LOGOUT.pathname} method="post">
          <button type="submit">log out</button>
        </Form>
      </p>
    </div>
  );
};

export { Root, links, loader, meta };
