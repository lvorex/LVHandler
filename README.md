<a href='https://github.com/lvorex/LVHandler' target='_blank'>![GitHub Repo](https://img.shields.io/github/stars/lvorex/LVHandler?style=social)</a>

# LVHandler

LVHandler is a discord command/event handler. It is very easy to use and makes it easy to create commands and events. 
It also automatically integrates the files in the command/event folder you specify into your bot.
You can better understand what I have explained with the following examples.

## Example Usage

**Install NPM Package:**
```css
npm install lvhandler
```

**Setup LVHandler:**
> _index.ts_
```ts
import { Client, Events, IntentsBitField } from "discord.js";
import LVHandler from "lvhandler";
import path from "path";

const client = new Client({ intents: [/* Your Intents */] })

client.on(Events.ClientReady, () => {
    new LVHandler({
        client: client, // Your client instance
        commandDir: path.join(__dirname, "Commands"), // Bots command dir.
        eventDir: path.join(__dirname, "Events"), // Bots event dir.
        autoDelete: true, // Auto delete slash command when file not exists.
        defaultPrefix: "!" // Default prefix for non-slash (regular) commands.
    })
})

client.login("TOKEN")
```

**Command Creation:**
> _Commands/ping.ts_
```ts
import { LVCommand } from "lvhandler";
import { TypeOfCommand } from "lvhandler";

export default {
    description: "Replies With Pong.", // Command Description.
    type: TypeOfCommand.SLASH, // Command Type. (BOTH, SLASH, REGULAR)
    options: [], // Command Options.

    execute: async ({ interaction }) => {
        if (!interaction) return
        await interaction.reply({ content: "Pong!" })
    }
} as LVCommand
```

**Event Creation:**
> _Events/replyToHi.ts_
```ts
import { Events } from "discord.js";
import { LVEvent } from "lvhandler";

export default {
    execute: (client) => {
        client.on(Events.MessageCreate, async (message) => {
            if (message.content.toLowerCase() === "hi") {
                await message.reply("Hi!")
            }
        })
    }
} as LVEvent
```
