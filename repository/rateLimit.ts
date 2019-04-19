import redis from "redis";
import {logger} from "../logger";
import { RateLimitContext } from "../dataModel/RateLimit";
import {GetConfig} from "../dataModel/Config";

let options: redis.ClientOpts = {
    host: GetConfig().redis.host,
    port:  GetConfig().redis.port,
    detect_buffers: true,
    db: GetConfig().redis.db,
    retry_strategy: options =>  {
        if(options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
        }
        return Math.min(options.attempt * 100, 3000);
    }
};
let client: redis.RedisClient;

export let SetRedisOption = (_options: redis.ClientOpts) => {
    options = _options; 
    client = redis.createClient(options)
    .on("error", (error) => {
        logger.error("redis", {error, param: options});
    })
    .on("reconnecting", () => {
        logger.warn("redis", {param: options, msg:"redis reconnecting"});
    })
    .on("ready", () => {
        logger.debug("redis", {msg:"redis redy"});
    })
}

export let RedisConnect = () => {
    client = redis.createClient(options)
    .on("error", (error) => {
        logger.error("redis", {error, param: options});
    })
    .on("reconnecting", () => {
        logger.warn("redis", {param: options, msg:"redis reconnecting"});
    })
    .on("ready", () => {
        logger.debug("redis", {msg:"redis redy"});
    })
}

const checkRateLimtLua: string = `
    redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1] - ARGV[2] * 1000) \
    local reqCnt = tonumber(redis.call('ZCARD', KEYS[1]));
    local result = {} \
    if reqCnt < tonumber(ARGV[3]) then \
        redis.call('ZADD', KEYS[1], ARGV[1], ARGV[1]) \ 
        result['cnt'] = reqCnt + 1 \ 
        return cjson.encode(result) \
    else \
        local firstReq = {} \
        firstReq = redis.call("ZRANGEBYSCORE", KEYS[1], ARGV[1] - ARGV[2] * 1000, ARGV[1], "WITHSCORES", "LIMIT", 0, 1) \
        result['cnt'] = reqCnt \ 
        result["reset"] = firstReq[2] \
        return cjson.encode(result)  \
    end \
`;

export let checkRateLimt = async (ip: string, ceiling: number, interval: number) => {
    return new Promise<RateLimitContext>((resolve, reject) => {
        client.eval(checkRateLimtLua, 1, ip, Date.now(), interval, ceiling, (error, reply) => {
            if(error) {
                logger.error("repository", {
                    error: error,
                    args: [ip, ceiling, interval]
                });
                return reject(error);
            }
            let result: RateLimitContext = new RateLimitContext();
            if(reply === null) return resolve(result);
            result = (Object as any).assign(
                result,
                JSON.parse(reply)
            );
            return resolve(result);
        })
    })
}