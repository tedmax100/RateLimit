import express from "express";
import * as bodyParser from "body-parser";

// Creates and configures an ExpressJS web server.
class App {
    public express: express.Application;

    /**
     * Configure Express middleware.
     */
    constructor() {
        // -->Init: routes
        this.express = express();
        
        this.middleware();
        this.routes();
        
        // todo: prepare your db here
    }
    private middleware(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.text());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    /**
     * Load all API endpoints
     *      -- create route endpoints here
     *      -- check the sample
     */
    private routes(): void {

    }
}
// tslint:disable-next-line:no-default-export
export default new App().express;
