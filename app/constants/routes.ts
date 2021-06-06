interface RouteType {
  pathname: string;
}

const Route: Record<string, RouteType> = Object.freeze({
  LOGIN: {
    pathname: "/login",
  },
  ROOT: {
    pathname: "/",
  },
});

export { Route };
