import type { ReactNode } from "react";
import { Links, LiveReload, Meta, Scripts } from "remix";

const Document = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <link rel="icon" href="/favicon.png" type="image/png" />
      <Meta />
      <Links />
    </head>
    <body>
      {children}
      <Scripts />
      {process.env.NODE_ENV === "development" && <LiveReload />}
    </body>
  </html>
);

export { Document };
