import path from "path";
import {createLogger, transports, format} from "winston";

const logPath = path.resolve(__dirname, '../logs/');

const fileTransport = new transports.File({
    filename : path.resolve(logPath, "service.log"),
    handleExceptions: true,
    maxsize: 50000000,
    maxFiles: 10,
    tailable: true,
    level: 'debug',
    zippedArchive: true
});

const logger = createLogger({
    transports: [
        fileTransport
    ],
    exceptionHandlers: [
      new transports.File({
          filename: path.resolve(logPath, "error.log"),
        }),
    ],
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:fff'}),
        format.simple()
    )
});


export {logger, fileTransport};