type ProcessEnv = {
  AUTH_SECRET: string;
};

const config: ProcessEnv = {
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.npm_package_name!,
};

export { config };
