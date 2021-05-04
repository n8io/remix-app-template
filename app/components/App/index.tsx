import { Outlet } from "react-router-dom";
import { LinksFunction, LoaderFunction, useRouteData } from "remix";
import { Document } from "../Document";
import stylesHref from "./index.css";

const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesHref }];
const loader: LoaderFunction = async () => ({ date: new Date() });

const App = () => {
  const data = useRouteData();

  return (
    <Document>
      <Outlet />
      <footer>
        <p>This page was rendered at {data.date.toLocaleString()}</p>
      </footer>
    </Document>
  );
};

export { App, links, loader };
