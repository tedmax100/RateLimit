import redis from "redis";
import {logger} from "../logger";

let options: redis.ClientOpts = {
    host: "127.0.0.1",
    port:  6379,
    detect_buffers: true,
    db: 0,
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
    local reqCnt = tonumber(redis.call('ZCARD, KEYS[1]));
    if reqCnt < ARGV[3] then \
        redis.call('ZADD', KEYS[1], ARGV[1], ARGV[1]) \
        return reqCnt \
    else \
        return nil \
    end \
`;

export let checkRateLimt = async (ip: string, ceiling: number, interval: number) => {
    return new Promise<number|null>((resolve, reject) => {
        client.eval(checkRateLimtLua, 1, ip, Date.now(), interval, ceiling, (error, reply) => {
            if(error) {
                logger.error("repository", {
                    error: error,
                    args: [ip, ceiling, interval]
                });
                return reject(error);
            }
            if(reply === null) return resolve(null);
            return resolve(reply as number);
        })
    })
  /*   try{
        return await client.eval(checkRateLimtLua, 1, ip, Date.now(), interval, ceiling);
    }catch(error) {
        logger.error("repository", {
            error: error,
            args: [ip, ceiling, interval]
        });
        return false;
    } */

   /*  client.eval(checkRateLimtLua, 1, ip, Date.now(), interval, ceiling, (error, reply) => {
        if(error) {
            logger.error("repository", {
                error: error,
                args: [ip, ceiling, interval]
            });
            return 
        }
    }) */
}