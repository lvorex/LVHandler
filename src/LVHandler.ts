import { Client } from "discord.js";
import CommandHandler from "./Handlers/CommandHandler";

export default class LVHandler {
    private _client: Client
    private _commandDir: string
    private _eventDir: string | undefined = undefined
    private _defaultPrefix: string = "!"

    constructor(options: LVHandlerOptions) {
        this._client = options.client
        this._commandDir = options.commandDir
        this._eventDir = options.eventDir
        if (options.defaultPrefix) {
            this._defaultPrefix = options.defaultPrefix
        }
        this.configureSystems(options)
    }

    private configureSystems = async (options: LVHandlerOptions) => {
        const commandHandler = new CommandHandler(this as LVHandler)
        await commandHandler.checkCommands()
        await commandHandler.startRegular()
        await commandHandler.startSlash()
    }

    public get client(): Client {
        return this._client
    }
    public get commandDir(): string {
        return this._commandDir
    }
    public get eventDir(): string | undefined {
        return this._eventDir
    }
    public get defaultPrefix(): string {
        return this._defaultPrefix
    }
}

export interface LVHandlerOptions {
    client: Client
    commandDir: string
    defaultPrefix?: string
    eventDir?: string
}