import express from "express";
import * as bodyParser from "body-parser";
import {logger as expressLogger} from "express-winston";
import path from "path";
import mkdirp from "mkdirp";
import {fileTransport, logger} from "./logger";
import {RateLimit, SetRateLimitParams} from "./middleware/rateLimit";
import {indexRouter} from "./router/index";
import { RedisConnect } from "./repository/rateLimit";

// Creates and configures an ExpressJS web server.
class App {
    public express: express.Application;
    private fileBase: string = path.resolve(__dirname, '../logs/');
    /**
     * Configure Express middleware.
     */
    constructor() {
        // -->Init: routes
        this.createLogFolder();
        this.express = express();
        
        this.middleware();
        this.routes();
        // todo: prepare your db here
        RedisConnect();
        SetRateLimitParams(60, 60);
    }

    private createLogFolder = async () => {
        mkdirp(this.fileBase, (err) => {
            err ? logger.error(err) : logger.info(`${this.fileBase} have created`);
        });
    }
    private middleware(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.text());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(expressLogger({
            transports: [
                fileTransport
            ],
        }));

        this.express.use(RateLimit);
    }

    /**
     * Load all API endpoints
     *      -- create route endpoints here
     *      -- check the sample
     */
    private routes(): void {
        this.express.use("/", indexRouter);
    }
}
// tslint:disable-next-line:no-default-export
export default new App().express;
