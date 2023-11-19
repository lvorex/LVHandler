import { Client } from "discord.js";
import CommandHandler from "./Handlers/CommandHandler";
import EventHandler from "./Handlers/EventHandler";
import CommandFunctions from "./Utils/CommandFunctions";
import EventFunctions from "./Utils/EventFunctions";

export default class LVHandler {
    private _client: Client
    private _commandDir: string
    private _eventDir: string | undefined = undefined
    private _defaultPrefix: string = "!"
    private _autoDelete: boolean = false
    public LVHandlerFunctions: {
        commandFunctions: CommandFunctions,
        eventFunctions: EventFunctions
    }

    constructor(options: LVHandlerOptions) {
        this._client = options.client
        this._commandDir = options.commandDir
        this._eventDir = options.eventDir
        if (options.defaultPrefix) {
            this._defaultPrefix = options.defaultPrefix
        }
        if (options.autoDelete) {
            this._autoDelete = options.autoDelete
        }
        const commandHandler = new CommandHandler(this as LVHandler)
        const eventHandler = new EventHandler(this as LVHandler)
        this.LVHandlerFunctions = {
            commandFunctions: new CommandFunctions(commandHandler),
            eventFunctions: new EventFunctions(eventHandler)
        }

        this.configureSystems(commandHandler, eventHandler)
    }

    private configureSystems = async (commandHandler: CommandHandler, eventHandler: EventHandler) => {
        await commandHandler.checkCommands(this._autoDelete)
        await commandHandler.startRegular()
        await commandHandler.startSlash()
        await eventHandler.startHandler()
        console.log(`LVHandler > Bot is running now.`)
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
    autoDelete?: boolean
}