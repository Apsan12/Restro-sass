import redisClient from "../config/redis.js";

export const setRedisValue = async (
  key: string,
  value: string,
  expirationInSeconds?: number
): Promise<void> => {
  if (expirationInSeconds) {
    await redisClient.set(key, value, {
      EX: expirationInSeconds,
    });
    return;
  }

  await redisClient.set(key, value);
};

export const getRedisValue = async (
  key: string
): Promise<string | null> => {
  return redisClient.get(key);
};

export const deleteRedisValue = async (
  key: string
): Promise<void> => {
  await redisClient.del(key);
};