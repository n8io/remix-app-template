interface RouteType {
  pathname: string;
}

const Route: Record<string, RouteType> = Object.freeze({
  HEALTH_CHECK: {
    pathname: "/api/healthcheck",
  },
  LOGIN: {
    pathname: "/login",
  },
  ROOT: {
    pathname: "/",
  },
});

export { Route };
