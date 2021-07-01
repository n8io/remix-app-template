import type { LinksFunction, LoaderFunction, MetaFunction } from "remix";
import { useRouteData } from "remix";
import { App } from "../../constants/enums";
import { ensureAuthenticated } from "../../utils/session";
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
      <h1>Welcome to Remix!</h1>
      <p>
        <a href="https://remix.run/dashboard/docs">Check out the docs</a> to get
        started.
      </p>
      <p>Message from the loader: {data.user}</p>
    </div>
  );
};

export { Root, links, loader, meta };
