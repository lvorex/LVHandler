import fs from "fs/promises"
import LVHandler from "../LVHandler"
import { ApplicationCommandOption, Client, Events } from "discord.js"
import { Dirent } from "fs"
import { TypeOfCommand } from "../Utils/TypeOfCommand"
import p from "path"
import { CommandObjects } from "../typings"

export default class CommandHandler { 
    private instance: LVHandler

    constructor(instance: LVHandler) {
        this.instance = instance
    }

    private regularCommands: {
        name: string,
        execute: (options: CommandObjects) => { content?: string, ephemeral?: boolean } | undefined
    }[] = []
    private slashCommands: {
        name: string,
        execute: (options: CommandObjects) => { content?: string, ephemeral?: boolean } | undefined
    }[] = []

    private getCommands = async () => {
        const client = this.instance.client

        const commands = client.application?.commands
        await commands?.fetch()
        return commands
    }

    private readFolders = async (path: string, folderName: string): Promise<LVFile[]> => {
        const commandFolder = await fs.readdir(p.join(path, folderName), { withFileTypes: true })
        const foundCommands: LVFile[] = []
        for await (const commandFile of commandFolder) {
            if (
                commandFile.isFile() &&
                commandFile.name.endsWith(".ts") ||
                commandFile.name.endsWith(".js")
            ) {
                foundCommands.push({
                    name: commandFile.name,
                    path: p.join(path, commandFile.name)
                })
            }
        }

        return foundCommands
    }

    private findCommandFile = async (commandName: string) => {
        const commandFolder = await fs.readdir(this.instance.commandDir, { withFileTypes: true })
        let resultCommand: LVFile | null = null
        for await (const command of commandFolder) {
            if (
                command.isDirectory()
            ) {
                const commandFiles = await this.readFolders(this.instance.commandDir, command.name)
                for await (const commandFile of commandFiles) {
                    if (commandFile.name === commandName) {
                        resultCommand = commandFile
                    } else continue
                }
            } else {
                if (command.name === commandName) {
                    resultCommand = {
                        name: command.name,
                        path: p.join(this.instance.commandDir, command.name)
                    }
                }
            }
        }
        if (!resultCommand) return null
        const commandRequirement = require(resultCommand.path)
        return commandRequirement
    }

    private getFiles = async () => {
        const commandFolder = await fs.readdir(this.instance.commandDir, { withFileTypes: true })
        const CommandFiles: LVFile[] = []
        for await (const command of commandFolder) {
            if (command.isDirectory()) {
                const folderFiles = await this.readFolders(this.instance.commandDir, command.name)
                folderFiles.forEach(commandFile => {
                    CommandFiles.push(commandFile)
                })
            } else if (
                !command.name.endsWith(".ts") &&
                !command.name.endsWith(".js")
            ) continue

            CommandFiles.push({
                name: command.name,
                path: p.join(this.instance.commandDir, command.name)
            })
        }

        return CommandFiles
    }

    public createCommand = async (name: string, description: string | undefined, options: ApplicationCommandOption[] | undefined, type: TypeOfCommand) => {
        const commandName: string = name.split(".")[0]
        if (
            type === "REGULAR" ||
            type === "BOTH"
        ) {
            const requirement = await this.findCommandFile(name)
            if (!requirement.default.execute) {
                console.log(`LVHandler > Command "${this.instance.defaultPrefix}${commandName}" don't have "execute" variable.`)
                return
            }
            this.regularCommands.push({
                name: commandName,
                execute: requirement.default.execute
            })
            console.log(`LVHandler > Command "${this.instance.defaultPrefix}${commandName}" Ready.`)
            return true
        }
        if (!description) return false
        const commands = await this.getCommands()
        const requirement = await this.findCommandFile(name)
        if (!requirement.default.execute) {
            console.log(`LVHandler > Command "/${commandName}" don't have "execute" variable.`)
            return
        }
        this.slashCommands.push({
            name: commandName,
            execute: requirement.default.execute
        })
        commands?.create({
            name: commandName,
            description,
            options
        })
        console.log(`LVHandler > Command "/${commandName}" Ready.`)
        return true
    }

    public deleteCommand = async (name: string) => {
        const commands = await this.getCommands()
        const commandsFetch = await commands?.fetch()
        const command = commandsFetch?.find(cmd => cmd.name === name)
        if (!command) return false
        commands?.delete(command)
        console.log(`LVHandler > Command "${name}" Deleted.`)
        return true
    }

    public checkCommands = async () => {
        const commandFiles = await this.getFiles()
        for await (const command of commandFiles) {
            const commandRequirement = require(command.path)
            await this.createCommand(command.name, commandRequirement.default.description, commandRequirement.default.options, commandRequirement.default.type)
        }
    }

    public startRegular = async () => {
        this.instance.client.on(Events.MessageCreate, async (message) => {
            if (message.content.startsWith(this.instance.defaultPrefix)) {
                for await (const command of this.regularCommands) {
                    if (message.content.startsWith(`!${command}`)) {
                        command.execute({ interaction: null, channel: message.channel, guild: message.guild, message: message })
                    }
                }
            }
        })
    }

    public startSlash = async () => {
        this.instance.client.on(Events.InteractionCreate, async (interaction) => {
            if (interaction.isCommand()) {
                for await(const command of this.slashCommands) {
                    if (interaction.command?.name === command.name) {
                        command.execute({ interaction: interaction, channel: interaction.channel, guild: interaction.guild, message: null })
                    }
                }
            }
        })
    }
}

export interface LVFile {
    name: string
    path: string
}