import path from "path";
import * as _winston from "winston";

/* import winston = require("winston");
const circularjson = require("circular-json");
 */
const logPath = path.resolve(__dirname, '../logs/');

const fileTransport = new _winston.transports.File({
    filename : path.resolve(logPath, "service.log"),
    handleExceptions: true,
    maxsize: 50000000,
    maxFiles: 10,
    tailable: true,
    level: 'debug',
    zippedArchive: true
});
/* const jsonFormatter = (item: any) => {
    item.timestamp = new Date().toISOString(); */
/*     item.meta.message = item.message;
    item.meta.timestamp = new Date().toISOString();
    item.meta.level = item.level; */
/*     try { */
        //console.dir(item);
        //console.dir(circularjson.stringify(item));
        
/*         return circularjson.stringify(item);
    }
    catch (exp) {
        return "";
    }
} */

const logger = _winston.createLogger({
    transports: [
        fileTransport
    ],
    exceptionHandlers: [
      new _winston.transports.File({
          filename: path.resolve(logPath, "error.log"),
        }),
    ],
    //format: winston.format(jsonFormatter)()
    format: _winston.format.combine(
        _winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:fff'}),
        _winston.format.simple()
    )
});


export {logger, fileTransport};