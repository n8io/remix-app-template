import { PrismaClient } from "@prisma/client";
import { ProcessEnv, readRequired } from "../config";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      prisma?: PrismaClient;
    }
  }
}

const DATABASE_URL = readRequired(ProcessEnv.DATABASE_URL);
const connectionString = new URL(DATABASE_URL);

const db = new PrismaClient({
  datasources: {
    db: {
      url: connectionString.toString(),
    },
  },
});

export { db };
