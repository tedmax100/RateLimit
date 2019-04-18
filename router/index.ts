import { Request, Response, Router } from "express";

export class IndexRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    public init() {
        this.router.get("" ,this.index);
        return this;
    }

    private index = async (req: Request, res: Response) => {
        res.setHeader("X-RateLimit-Limit", req.conext.limit);
        res.setHeader("X-RateLimit-Remaining", req.conext.limit - req.conext.cnt!);
        if(req.conext.reset !== undefined) { 
            res.setHeader("X-RateLimit-Reset", req.conext.reset!); 
            return res.json("Error"); }
        // console.log(req.conext.cnt);
        return res.json(req.conext.cnt!);
    }
}

export const indexRouter: Router = new IndexRoutes().init().router;
