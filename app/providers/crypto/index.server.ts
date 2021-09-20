import {
  compare as bcryptCompare,
  genSalt,
  hash as bCryptHash,
} from "bcryptjs";
import { ProcessEnv, read } from "../../config";
import { Environment } from "../../constants/environment";

const hash = async (clearTextPassword: string) => {
  const salt = await genSalt();

  return bCryptHash(clearTextPassword, salt);
};

const compare = (clearTextPassword: string, passwordHash: string) => {
  const environment = read(ProcessEnv.NODE_ENV) as Environment;
  const isProduction = environment === Environment.PRODUCTION;

  // Skip password verification when not in production
  if (!isProduction) return true;

  return bcryptCompare(clearTextPassword, passwordHash);
};

export { compare, hash };
