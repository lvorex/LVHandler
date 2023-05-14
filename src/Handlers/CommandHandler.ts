import fs from "fs/promises"
import LVHandler from "../LVHandler"
import { ApplicationCommandOption, Client, Events } from "discord.js"
import { Dirent } from "fs"
import { TypeOfCommand } from "../Utils/TypeOfCommand"

export default class CommandHandler extends LVHandler { 
    private regularCommands: {
        name: string,
        execute: () => { content?: string, ephemeral?: boolean } | undefined
    }[] = []
    private slashCommands: {
        name: string,
        execute: () => { content?: string, ephemeral?: boolean } | undefined
    }[] = []

    private getCommands = async () => {
        const client = this.client

        const commands = client.application?.commands
        await commands?.fetch()
        return commands
    }

    private readFolders = async (command: Dirent): Promise<Dirent[]> => {
        const commandFolder = await fs.readdir(command.path, { withFileTypes: true })
        const foundCommands: Dirent[] = []
        for await (const commandFile of commandFolder) {
            if (
                commandFile.isFile() &&
                commandFile.name.endsWith(".ts") ||
                commandFile.name.endsWith(".js")
            ) {
                foundCommands.push(commandFile)
            }
        }

        return foundCommands
    }

    private findCommandFile = async (commandName: string) => {
        const commandFolder = await fs.readdir(this.commandDir, { withFileTypes: true })
        let resultCommand: Dirent | null = null
        for await (const command of commandFolder) {
            if (
                command.isDirectory()
            ) {
                const commandFiles = await this.readFolders(command)
                for await (const commandFile of commandFiles) {
                    if (commandFile.name === commandName) {
                        resultCommand = commandFile
                    } else continue
                }
            } else {
                if (command.name === commandName) {
                    resultCommand = command
                }
            }
        }
        if (!resultCommand) return null
        const commandRequirement = require(resultCommand.path)

        return commandRequirement
    }

    private getFiles = async () => {
        const commandFolder = await fs.readdir(this.commandDir, { withFileTypes: true })
        const CommandFiles: Dirent[] = []
        for await (const command of commandFolder) {
            if (command.isDirectory()) {
                const folderFiles = await this.readFolders(command)
                folderFiles.forEach(commandFile => {
                    CommandFiles.push(commandFile)
                })
            } else if (
                !command.name.endsWith(".ts") ||
                !command.name.endsWith(".js")
            ) continue

            CommandFiles.push(command)
        }

        return CommandFiles
    }

    public createCommand = async (name: string, description: string | null, options: ApplicationCommandOption[] | null, type: TypeOfCommand) => {
        if (
            type === TypeOfCommand.REGULAR ||
            type === TypeOfCommand.BOTH
        ) {
            const requirement = await this.findCommandFile(name)
            if (!requirement.execute) {
                console.log(`LVHandler > Command "${this.defaultPrefix}${name}" don't have "execute" variable.`)
                return
            }
            this.regularCommands.push({
                name,
                execute: requirement.execute
            })
            console.log(`LVHandler > Command "${this.defaultPrefix}${name}" Ready.`)
            return true
        }
        if (!options || !description) return false
        const commands = await this.getCommands()
        const requirement = await this.findCommandFile(name)
        if (!requirement.execute) {
            console.log(`LVHandler > Command "/${name}" don't have "execute" variable.`)
            return
        }
        this.slashCommands.push({
            name,
            execute: requirement.execute
        })
        commands?.create({
            name,
            description,
            options
        })
        console.log(`LVHandler > Command "/${name}" Ready.`)
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
            await this.createCommand(commandRequirement.name, commandRequirement.description, commandRequirement.options, commandRequirement.type)
        }
    }

    public startRegular = async () => {
        this.client.on(Events.MessageCreate, async (message) => {
            if (message.content.startsWith(this.defaultPrefix)) {
                for await (const command of this.regularCommands) {
                    if (message.content.startsWith(`!${command}`)) {
                        command.execute()
                    }
                }
            }
        })
    }

    public startSlash = async () => {
        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (interaction.isCommand()) {
                for await(const command of this.slashCommands) {
                    if (interaction.command?.name === command.name) {
                        command.execute()
                    }
                }
            }
        })
    }
}