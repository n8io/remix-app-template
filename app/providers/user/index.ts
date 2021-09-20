import { PrismaClient, Profile, Role, User } from ".prisma/client";
import { compare, hash } from "../crypto/index.server";
import { logFactory } from "../../utils/logFactory";

interface Dependencies {
  db: PrismaClient;
}

type CreateUser = Pick<User, "email"> &
  Pick<Profile, "familyName" | "givenName"> & {
    clearTextPassword: string;
    role?: Role;
  };

type SafeUser = Pick<User, "createdAt" | "email" | "id" | "role">;

type SafeUserResponse = Promise<SafeUser | null>;

const moduleName = "providers:User";

const safeUserSelect = {
  createdAt: true,
  email: true,
  id: true,
  profile: true,
  role: true,
};

class UserProvider {
  db: PrismaClient;

  constructor(dependencies: Dependencies) {
    this.db = dependencies.db;
  }

  async create(user: CreateUser): Promise<SafeUserResponse> {
    const log = logFactory(moduleName, "create");
    const { clearTextPassword, email, role, ...profile } = user;
    const passwordHash = await hash(clearTextPassword!);

    log(`✨ Creating new user...`, user.email);

    try {
      const created = await this.db.user.create({
        data: {
          email,
          passwordHash,
          profile: {
            create: profile,
          },
          role,
        },
        select: safeUserSelect,
      });

      log(`👍 Created new user`, created);

      return created;
    } catch (error: any) {
      if (error?.code === "P2002" && error?.meta?.target?.[0] === "email") {
        throw new Error(`Email already in use: ${email}`);
      }

      throw error;
    }
  }

  async isValidPassword(
    email: string,
    clearTextPassword: string
  ): Promise<boolean> {
    const log = logFactory(moduleName, "isValidPassword");

    log(`🔐 Evaluating user password...`, email);

    const user = await this.db.user.findUnique({
      where: { email },
      select: { passwordHash: true },
    });

    if (!user) return false;

    const { passwordHash } = user;

    const isValid = await compare(clearTextPassword, passwordHash);

    isValid
      ? log(`👍 Password is correct`, email)
      : log(`👎 Password is NOT correct`, email);

    return isValid;
  }

  async findByEmail(email: string): SafeUserResponse {
    const log = logFactory(moduleName, "findByEmail");

    log(`🔍 Finding user by email...`, email);

    const user = await this.db.user.findUnique({
      where: { email },
      select: safeUserSelect,
    });

    user ? log(`👍 Found user`, user) : log(`👎 No user found`, email);

    return user;
  }

  async find(userId: string): SafeUserResponse {
    const log = logFactory(moduleName, "findByEmail");

    log(`🔍 Finding user...`, userId);

    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        email: true,
        id: true,
        role: true,
      },
    });

    log(`👍 Found user`, user);

    return user;
  }
}

export { UserProvider };
