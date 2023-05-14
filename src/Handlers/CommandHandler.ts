import fs from "fs/promises"
import LVHandler from "../LVHandler"
import { Client } from "discord.js"
import { Dirent } from "fs"

export default class CommandHandler extends LVHandler { 
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
    }
}