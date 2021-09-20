import { PrismaClient, Session } from ".prisma/client";
import { logFactory } from "../../utils/logFactory";

interface Dependencies {
  db: PrismaClient;
}

const moduleName = "providers:UserSession";
const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
const thirtyDaysAgo = (): Date => new Date(new Date().getTime() - thirtyDaysMs);

class UserSessionProvider {
  db: PrismaClient;

  constructor(dependencies: Dependencies) {
    this.db = dependencies.db;
  }

  async create(userId: string) {
    const log = logFactory(moduleName, "create");

    log(`✨ Creating new session for user... ${userId}`);

    const session = await this.db.session.create({
      data: { userId },
    });

    log(`👍 New session created for user (${userId}): ${session.id}`);

    return session;
  }

  async expire(sessionId: string) {
    const log = logFactory(moduleName, "expire");

    log(`🏁 Expiring session... ${sessionId}`);

    await this.db.session.delete({ where: { id: sessionId } });

    log(`👍 Expired session: ${sessionId}`);
  }

  async find(sessionId: string) {
    const log = logFactory(moduleName, "find");

    log(`🔍 Finding user session... ${sessionId}`);

    const session = await this.db.session.findUnique({
      where: { id: sessionId },
    });

    session
      ? log(`👍 Found user session`, session)
      : log(`👎 No user session found`, sessionId);

    return session;
  }

  async flushStale() {
    const log = logFactory(moduleName, "flushStale");

    log("🚽 Flushing stale sessions...");

    const { count } = await this.db.session.deleteMany({
      where: {
        updatedAt: { lte: thirtyDaysAgo() },
      },
    });

    log(`🚽 Flushed ${count} stale session(s)`);
  }

  async touch(sessionId: string) {
    const log = logFactory(moduleName, "touch");

    log(`👆 Touching active session: ${sessionId}...`);

    await this.db.session.update({
      data: { updatedAt: new Date() },
      where: { id: sessionId },
    });

    log(`👍 Touched active session: ${sessionId}`);
  }
}

export { UserSessionProvider };
