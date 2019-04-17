import {NextFunction, Request, RequestHandler, Response} from "express";
import { checkRateLimt } from "../repository/rateLimit";
import { RateLimitContext } from "../dataModel/RateLimit";

let reqCeiling: number = 60; 
const interval: number = 60; //60 seconds

let SetRateLimitParams = (cnt: number, interval: number) => {
    SetReqCntCeiling(cnt);
    SetPerSecondRateInterval(interval);
}
let SetReqCntCeiling = (cnt: number) => reqCeiling = cnt;
let SetPerSecondRateInterval = (interval: number) => interval = interval;

let RateLimit : RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const srcRemoteIp = req.ip.split(':')[0] === "" ? "local" : req.ip.split(':')[0];
    try{
        const checkResult:RateLimitContext = await checkRateLimt(srcRemoteIp!, reqCeiling, interval);
        if(checkResult === null) return res.send("Error");
        checkResult.limit = reqCeiling;
        req.conext = checkResult;
        return next();//res.send(checkResult);
    }catch(error) {
        return res.send("Error");
    }
}
export {
    RateLimit,
    SetRateLimitParams
};