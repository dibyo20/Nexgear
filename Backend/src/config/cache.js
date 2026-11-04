import Redis from "ioredis";
import { config } from "./config.js";

const redis = new Redis({
    url: config.REDIS_URI
});

redis.on("connect", () => {
    console.log("Connected to Redis");
});

redis.on("error", (err) => {
    console.log("Redis connection error:", err);
});

export default redis;