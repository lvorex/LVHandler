import { Events } from "discord.js";
import LVHandler from "../LVHandler";
import fs from "fs/promises";
import p from "path";
import { ClientEvents } from "discord.js";

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
                    type: eventVariables.default.type,
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
                type: eventVariables.default.type,
                exec: eventVariables.default.execute
            })
        }

        return true
    }

    private startEvent = async (eventType: string, execute: (obj: any) => undefined) => {
        this.instance.client.on(eventType, async (object: any) => {
            execute(object)
        })
    }

    public startHandler = async () => {
        await this.getEvents()

        for await (const event of this.events) {
            await this.startEvent(event.type, event.exec)
            console.log(`LVHandler > Event "${event.name}" Ready.`)
            continue
        }
    }
}

export interface LVEventFile {
    name: string
    type: Events
    exec: (obj : any) => undefined
}