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
  LOGOUT: {
    pathname: "/logout",
  },
  ROOT: {
    pathname: "/",
  },
  SIGN_UP: {
    pathname: "/sign-up",
  },
});

export { Route };
