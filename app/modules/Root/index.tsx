import type { LinksFunction, LoaderFunction, MetaFunction } from "remix";
import { useRouteData } from "remix";
import stylesUrl from "./index.css";

const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesUrl }];
const loader: LoaderFunction = async () => ({ message: "this is awesome 😎" });

const meta: MetaFunction = () => ({
  title: "Remix Starter",
  description: "Welcome to remix!",
});

const Root = () => {
  const data = useRouteData();

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Welcome to Remix!</h2>
      <p>
        <a href="https://remix.run/dashboard/docs">Check out the docs</a> to get
        started.
      </p>
      <p>Message from the loader: {data.message}</p>
    </div>
  );
};

export { Root, links, loader, meta };
