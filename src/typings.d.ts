import { ApplicationCommandOption, Client, CommandInteraction, Guild, Message, TextBasedChannel } from "discord.js"


export enum TypeOfCommand {
    SLASH = "SLASH",
    REGULAR = "REGULAR",
    BOTH = "BOTH"
}

export interface LVCommand {
    execute: (options: CommandObjects) => { content?: string, ephemeral?: boolean } | undefined
    description: string
    type: TypeOfCommand
    options?: ApplicationCommandOption[]
}

export default class LVHandler {
    private _client: Client
    private _commandDir: string
    private _eventDir: string | undefined = undefined
    private _defaultPrefix: string = "!"
    private _autoDelete: boolean = false

    constructor(options: LVHandlerOptions) {
        this._client = options.client
        this._commandDir = options.commandDir
        this._eventDir = options.eventDir
        this._autoDelete = options.autoDelete
        this._defaultPrefix = options.defaultPrefix
        this.configureSystems(options)
    }

    private configureSystems = async (options: LVHandlerOptions) => {
        const commandHandler = new CommandHandler(this as LVHandler)
        const eventHandler = new EventHandler(this as LVHandler)
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

export interface CommandObjects {
    interaction: CommandInteraction | null
    guild: Guild | null
    message: Message<boolean> | null
    channel: TextBasedChannel | null
    client: Client
}

export interface LVEvent {
    execute: (client: Client) => undefined | Promise<undefined>
}