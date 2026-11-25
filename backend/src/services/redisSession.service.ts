import redisClient from "../config/redis.js";

export interface RedisSessionData {
  userId: string;
  role: string;
  restaurantId?: string;
}

const SESSION_PREFIX = "auth:refresh:";

export class RedisSessionService {
  async createSession(
    sessionId: string,
    data: RedisSessionData,
    expiresInSeconds: number
  ): Promise<void> {
    const key = `${SESSION_PREFIX}${sessionId}`;

    await redisClient.set(key, JSON.stringify(data), {
      EX: expiresInSeconds,
    });
  }

  async getSession(
    sessionId: string
  ): Promise<RedisSessionData | null> {
    const key = `${SESSION_PREFIX}${sessionId}`;

    const session = await redisClient.get(key);

    if (!session) {
      return null;
    }

    return JSON.parse(session) as RedisSessionData;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `${SESSION_PREFIX}${sessionId}`;

    await redisClient.del(key);
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    const key = `${SESSION_PREFIX}${sessionId}`;

    const exists = await redisClient.exists(key);

    return exists === 1;
  }
}

export const redisSessionService = new RedisSessionService();