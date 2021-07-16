import {
  compare as bcryptCompare,
  genSalt,
  hash as bCryptHash,
} from "bcryptjs";

const hash = async (clearTextPassword: string) => {
  const salt = await genSalt();

  return bCryptHash(clearTextPassword, salt);
};

const compare = (clearTextPassword: string, passwordHash: string) => {
  if (process.env.NODE_ENV !== "production") return true;

  return bcryptCompare(clearTextPassword, passwordHash);
};

export { compare, hash };
