import request from "supertest";
import app from "../app";
import {SetRateLimitParams} from "../middleware/rateLimit";
import redis from "redis";
import {logger} from "../logger";
import * as _winston from "winston";
import * as reateLimitFunc from "../repository/rateLimit";
import * as expressWinston from "express-winston";
import {GetConfig} from "../dataModel/Config";

const mockCreateLogger = jest.fn().mockImplementation(() => {
    log: jest.fn()
  });
const mockHandler = jest.fn();
const mockConsole = jest.fn().mockImplementation(() => () => {});
let option = {
    transports: [
        mockConsole
    ],
};
jest.spyOn(expressWinston, "logger").mockImplementation((option) => mockHandler);

describe("RateLimit test cases", () => {
    let client: redis.RedisClient = redis.createClient({
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
    });

    beforeAll(() => {
        jest.spyOn(logger, "debug").mockImplementation(
            () => _winston.createLogger( {transports:[]} )  
        );
        jest.spyOn(logger, "info").mockImplementation(
            () => _winston.createLogger( {transports:[]} )  
        );
        jest.spyOn(logger, "error").mockImplementation(
            () => _winston.createLogger( {transports:[]} )  
        );

        jest.spyOn(logger, "log").mockImplementation(
            () => _winston.createLogger( {transports:[]} )  
        );
        logger.remove(_winston.transports.File);

        jest.spyOn(expressWinston, "logger").mockImplementation(() => mockHandler);

        // set limit = 1 , interval = 1
        SetRateLimitParams(1, 1);
    });

    afterEach((done) => {
        // clear redis
        client.DEL("local", (_)=> {
            done();
        });
    });

    afterAll(() => {
        client.quit();
    })

    it("Success Request",  async () => {
        let rateLimitFuncSpy = jest.spyOn(reateLimitFunc, "checkRateLimt");
        const response = await request(app).get(`/`);
        expect(response.status).toBe(200);
        expect(response.body).toBe(0);
        expect(rateLimitFuncSpy).toBeCalled();
        expect(rateLimitFuncSpy).toBeCalledWith("local", 1, 1);
    });

    // exist req in the bucket
    test("First Success, Next Error", async () => {
        await request(app).get(`/`);
        const response = await request(app).get(`/`);
        expect(response.status).toBe(200);
        expect(response.body).toBe("Error");
    }); 

    // had 1 req in bucket, then wait 1.5 second, send req
    test("First error, next success", async (done)=> {
        await request(app).get(`/`);
        await setTimeout(() => {
            request(app).get(`/`).then(response => {
                expect(response.status).toBe(200);
                expect(response.body).toBe(0);
                done();
            });
            
        }, 1500);
    });


    test("GEt error when repository throw reject", async() => {
        jest.spyOn(reateLimitFunc, "checkRateLimt").mockRejectedValue("Error");
        const response = await request(app).get(`/`);
        expect(response.status).toBe(200);
        expect(response.body).toBe("Error");
    })
});