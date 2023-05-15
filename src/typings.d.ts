import { ApplicationCommandOption, CommandInteraction, Events, Guild, GuildChannel, Message, TextBasedChannel } from "discord.js"
import { TypeOfCommand } from "./Utils/TypeOfCommand"

export interface LVCommand {
    execute: (options: CommandObjects) => { content?: string, ephemeral?: boolean } | undefined
    description: string
    type: TypeOfCommand
    options?: ApplicationCommandOption[]
}

export interface CommandObjects {
    interaction: CommandInteraction | null
    guild: Guild | null
    message: Message | null
    channel: TextBasedChannel | null
}

export interface LVEvent {
    type: Events
}