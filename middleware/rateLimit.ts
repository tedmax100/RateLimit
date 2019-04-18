import {NextFunction, Request, RequestHandler, Response} from "express";
import { checkRateLimt } from "../repository/rateLimit";
import { RateLimitContext } from "../dataModel/RateLimit";
import { logger } from "../logger";
import * as circularjson from "circular-json"
import { isArray } from "util";

let reqCeiling: number = 60; 
let interval: number = 60; //60 seconds

let SetRateLimitParams = (cnt: number, interval: number) => {
    SetReqCntCeiling(cnt);
    SetPerSecondRateInterval(interval);
}
let SetReqCntCeiling = (_cnt: number) => reqCeiling = _cnt;
let SetPerSecondRateInterval = (_interval: number) => interval = _interval;

let getReqIp = (req: Request) => {
    if(req.headers['x-forwarded-for'] === undefined) return "local";
    else if (isArray(req.headers['x-forwarded-for'])) return req.headers['x-forwarded-for']![0];
    else return req.headers['x-forwarded-for']! as string;
}

let RateLimit : RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const checkResult:RateLimitContext = await checkRateLimt(getReqIp(req), reqCeiling, interval);
        if(checkResult === null) return res.json("Error");
        checkResult.limit = reqCeiling;
        req.conext = checkResult;
        return next();
    }catch(error) {
        return res.json("Error");
    }
}

export {
    RateLimit,
    SetRateLimitParams
};