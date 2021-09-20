import { PrismaClient, Profile } from ".prisma/client";
import { logFactory } from "../../utils/logFactory";

interface Dependencies {
  db: PrismaClient;
}

type CreateUserProfile = Pick<Profile, "familyName" | "givenName" | "userId">;

const moduleName = "providers:UserProfile";

class UserProfileProvider {
  db: PrismaClient;

  constructor(dependencies: Dependencies) {
    this.db = dependencies.db;
  }

  async create(userProfile: CreateUserProfile) {
    const log = logFactory(moduleName, "create");

    log(`✨ Creating new user profile...`, userProfile.userId);

    const profile = await this.db.profile.create({ data: userProfile });

    log(`👍 Created a new user profile`, profile);

    return profile;
  }

  async findByUserId(userId: string) {
    const log = logFactory(moduleName, "findByUserId");

    log(`🔍 Finding profile by user id...`, userId);

    const profile = await this.db.profile.findUnique({ where: { userId } });

    if (profile) {
      log(`👍 Found user profile`, profile);
    } else {
      console.warn(`🤷‍♂️ Could not find user profile by user id: ${userId}`);
    }

    return profile;
  }
}

export { UserProfileProvider };
