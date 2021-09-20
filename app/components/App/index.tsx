import { Outlet } from "react-router-dom";
import { json, LinksFunction, LoaderFunction, useRouteData } from "remix";
import { Document } from "../Document";
import stylesHref from "./index.css";

const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesHref }];
const loader: LoaderFunction = async () => json({ now: new Date() });

const App = () => {
  const { now } = useRouteData();

  return (
    <Document>
      <Outlet />
      <footer>
        <p>This page was rendered at {now.toLocaleString()}</p>
      </footer>
    </Document>
  );
};

export { App, links, loader };
