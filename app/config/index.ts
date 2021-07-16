enum ProcessEnv {
  AUTH_SECRET = "AUTH_SECRET",
  DATABASE_URL = "DATABASE_URL",
  PRIMARY_REGION = "PRIMARY_REGION",
}

const { env } = process;

const read = (processEnvKey: ProcessEnv) => env[processEnvKey];

const readRequired = (processEnvKey: ProcessEnv) => {
  const value = read(processEnvKey);

  if (typeof value !== "undefined") return value;

  throw new Error(`Environment variable ${processEnvKey} is not provided`);
};

export { ProcessEnv, read, readRequired };
