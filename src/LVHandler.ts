import { Client } from "discord.js";

export default class LVHandler {
    private _client: Client
    private _commandDir: string
    private _eventDir: string
    private _defaultPrefix = "!"

    constructor(options: LVHandlerOptions) {
        this._client = options.client
        this._commandDir = options.commandDir
        this._eventDir = options.eventDir
        if (options.defaultPrefix.includes(" ")) {
            console.log("LVHandler > Prefix can't include spaces.")
            process.exit()
        }
        if (options.defaultPrefix) {
            this._defaultPrefix = options.defaultPrefix
        }
    }

    public get client(): Client {
        return this._client
    }
    public get commandDir(): string {
        return this._commandDir
    }
    public get eventDir(): string {
        return this._eventDir
    }
    public get defaultPrefix(): string {
        return this._defaultPrefix
    }
}

export interface LVHandlerOptions {
    client: Client
    commandDir: string
    defaultPrefix: string
    eventDir: string
}