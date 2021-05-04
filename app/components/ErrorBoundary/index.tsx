import { Document } from "../Document";

const ErrorBoundary = ({ error }: { error: Error }) => (
  <Document>
    <h1>App Error</h1>
    <pre>{error.message}</pre>
    <p>
      Replace this UI with what you want users to see when your app throws
      uncaught errors.
    </p>
  </Document>
);

export { ErrorBoundary };
