import { ApplicationCommandOption, CommandInteraction, Events, Guild, GuildChannel, Message } from "discord.js"
import { TypeOfCommand } from "./Utils/TypeOfCommand"

export interface LVCommand {
    execute: (options: CommandObjects) => { content?: string, ephemeral?: boolean } | undefined
    description: string
    type: TypeOfCommand
    options: ApplicationCommandOption[]
}

export interface CommandObjects {
    interaction: CommandInteraction
    guild: Guild
    message: Message
    channel: GuildChannel
}

export interface LVEvent {
    type: Events
}