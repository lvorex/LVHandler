import { ApplicationCommandOption, Client, CommandInteraction, Guild, Message, TextBasedChannel } from "discord.js"
import { TypeOfCommand } from "./Utils/TypeOfCommand"

export interface LVCommand {
    execute: (options: CommandObjects) => { content?: string, ephemeral?: boolean } | undefined
    description: string
    type: TypeOfCommand
    options: ApplicationCommandOption[]
}

export interface CommandObjects {
    interaction: CommandInteraction | null
    guild: Guild | null
    message: Message<boolean> | null
    channel: TextBasedChannel | null
}

export interface LVEvent {
    execute: (client: Client) => undefined | Promise<undefined>
}