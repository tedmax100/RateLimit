import * as fs from "fs";
import * as path from "path";
let configPath = path.resolve("./") +　"/config.json";

export class ConfigModel {
    public redis!:Redis;
}

export class Redis {
    public host!: string;
    public port!: number;
    public db!: string;
}

export let GetConfig = () : ConfigModel =>   {
    return  Object.assign(
        new ConfigModel(),
        JSON.parse(fs.readFileSync(configPath, "utf8")),
    );;
}