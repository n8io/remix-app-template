import type { MetaFunction } from "remix";

const meta: MetaFunction = () => ({ title: "Ain't nothing here" });

const NotFound = () => (
  <div>
    <h1>404</h1>
  </div>
);

export { NotFound, meta };
