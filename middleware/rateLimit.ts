import {NextFunction, Request, RequestHandler, Response} from "express";
import { checkRateLimt } from "../repository/rateLimit";

const reqCeiling: number = 60; 
const interval: number = 60; //60 seconds

let rateLimit : RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const srcRemoteIp = req.ip || req.connection.remoteAddress;

    try{
        const checkResult:number|null = await checkRateLimt(srcRemoteIp!, reqCeiling, interval);
        if(checkResult === null) return res.send("Error");
        return res.send(checkResult);
    }catch(error) {
        return res.send("Error");
    }
}
export = rateLimit;