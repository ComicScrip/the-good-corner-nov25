import Redis from "ioredis";
import env from "./env";

const redis: Redis | null = env.REDIS_URL ? new Redis(env.REDIS_URL) : null;

export default redis;
