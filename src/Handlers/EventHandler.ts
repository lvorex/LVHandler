import { Client, Events } from "discord.js";
import LVHandler from "../LVHandler";
import fs from "fs/promises";
import p from "path";
import CommandFunctions from "../Utils/CommandFunctions";
import EventFunctions from "../Utils/EventFunctions";

export default class EventHandler {
    private instance: LVHandler
    private events: LVEventFile[] = []

    constructor(instance: LVHandler) {
        this.instance = instance
    }

    private readFolder = async (path: string, folderName: string) => {
        const folderPath = p.join(path, folderName)
        const folderFiles = await fs.readdir(folderPath, { withFileTypes: true })
        for await (const folderFile of folderFiles) {
            if (
                !folderFile.name.endsWith(".js") &&
                !folderFile.name.endsWith(".ts")
            ) {
                const eventVariables = require(p.join(folderPath, folderFile.name))
                if (!eventVariables.default.execute) {
                    console.log(`LVHandler > Event "${folderFile.name.split(".")[0]}" don't have execute variable.`)
                    continue
                }
                this.events.push({
                    name: folderFile.name,
                    exec: eventVariables.default.execute
                })
            }
        }

        return true
    }

    private getEvents = async () => {
        if (!this.instance.eventDir) return false
        const files = await fs.readdir(this.instance.eventDir, { withFileTypes: true })
        for await (const file of files) {
            if (
                file.isDirectory()
            ) {
                await this.readFolder(this.instance.eventDir, file.name)
                continue
            } else if (
                !file.name.endsWith(".js") &&
                !file.name.endsWith(".ts")
            ) continue

            const eventVariables = require(p.join(this.instance.eventDir, file.name))
            if (!eventVariables.default.execute) {
                console.log(`LVHandler > Event "${file.name.split(".")[0]}" don't have execute variable.`)
                continue
            }
            this.events.push({
                name: file.name,
                exec: eventVariables.default.execute
            })
        }

        return true
    }

    private startEvent = async (execute: (client: Client, lvhandler: { commandFunctions: CommandFunctions, eventFunctions: EventFunctions }) => void) => {
        execute(this.instance.client, this.instance.LVHandlerFunctions)
    }

    public startHandler = async () => {
        await this.getEvents()

        for await (const event of this.events) {
            await this.startEvent(event.exec)
            console.log(`LVHandler > Event "${event.name.split(".")[0]}" Ready.`)
            continue
        }
    }
}

export interface LVEventFile {
    name: string
    exec: (obj : any) => undefined
}