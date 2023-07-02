import fs from "fs/promises"
import LVHandler from "../LVHandler"
import { ApplicationCommandOption, Client, Events, InteractionType } from "discord.js"
import { TypeOfCommand } from "../Utils/TypeOfCommand"
import p from "path"
import { RegularObjects, SlashObjects } from "../typings"

export default class CommandHandler { 
    private instance: LVHandler

    constructor(instance: LVHandler) {
        this.instance = instance
    }

    private regularCommands: {
        name: string,
        execute: (options: RegularObjects) => { content?: string, ephemeral?: boolean } | undefined
    }[] = []
    private slashCommands: {
        name: string,
        execute: (options: SlashObjects) => { content?: string, ephemeral?: boolean } | undefined
    }[] = []

    private getCommands = async () => {
        const client = this.instance.client

        const commands = client.application?.commands
        await commands?.fetch()
        return commands
    }

    private readFolders = async (path: string, folderName: string): Promise<LVFile[]> => {
        const commandFolder = await fs.readdir(p.join(path, folderName), { withFileTypes: true })
        const commandFolderPath = p.join(path, folderName)
        const foundCommands: LVFile[] = []
        for await (const commandFile of commandFolder) {
            if (
                commandFile.isFile() &&
                commandFile.name.endsWith(".ts") ||
                commandFile.name.endsWith(".js")
            ) {
                foundCommands.push({
                    name: commandFile.name,
                    path: p.join(commandFolderPath, commandFile.name)
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
                continue
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

    private isCommandMissing = async (autoDelete: boolean) => {
        const commands = await this.getCommands()
        const files = await this.getFiles()
        if (!commands?.cache.size) return false

        let a = 0
        let i = 0
        let missing = false

        function loop() {
            if (!commands) return
            const existingCommand = commands.cache.at(i)
            if (!existingCommand) return true
            const command = files[a]
            if (!command) {
                if (autoDelete === true) {
                    console.log(`LVHandler > Deleting Command "/${existingCommand?.name}".`)
                    commands.delete(existingCommand)
                }
                i++
                a = 0
                loop()
                return
            }
            const commandRequirement = require(command.path)
            if (
                commandRequirement.default.type !== "SLASH" &&
                commandRequirement.default.type !== "BOTH"
            ) {
                i++
                a = 0
                loop()
            }

            if (existingCommand?.name === command.name.split(".")[0]) {
                i++
                a = 0
                loop()
            } else {
                a++
                loop()
            }
        }
        loop()

        return true
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

    public checkCommands = async (autoDelete: boolean) => {
        const commandFiles = await this.getFiles()
        for await (const command of commandFiles) {
            const commandRequirement = require(command.path)
            await this.createCommand(command.name, commandRequirement.default.description, commandRequirement.default.options, commandRequirement.default.type)
            await this.isCommandMissing(autoDelete)
        }
    }

    public startRegular = async () => {
        this.instance.client.on(Events.MessageCreate, async (message) => {
            if (message.content.startsWith(this.instance.defaultPrefix)) {
                for await (const command of this.regularCommands) {
                    if (message.content.startsWith(`!${command.name}`)) {
                        command.execute({ channel: message.channel, guild: message.guild, message: message, client: message.client })
                    }
                }
            }
        })
    }

    public startSlash = async () => {
        this.instance.client.on(Events.InteractionCreate, async (interaction) => {
            if (interaction.isCommand()) {
                for await(const command of this.slashCommands) {
                    if (interaction.command?.name === command.name && interaction && interaction.isChatInputCommand() && interaction.type === InteractionType.ApplicationCommand) {
                        command.execute({ interaction: interaction, channel: interaction.channel, guild: interaction.guild, client: interaction.client })
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