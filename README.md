# LVHandler

LVHandler automatically integrates the commands in the script folder and the events in the events folder into your bot, making it easy to create commands. Examples are given below.

## Example Usage

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