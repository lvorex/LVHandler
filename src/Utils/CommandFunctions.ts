import CommandHandler from "../Handlers/CommandHandler";
import LVHandler from "../typings";

export default class CommandFunctions {
    private _instance: LVHandler
    private _commandHandler: CommandHandler
    constructor(options: { instance: LVHandler, commandHandler: CommandHandler }) {
        this._instance = options.instance
        this._commandHandler = options.commandHandler
    }

    public restartCommand = async (name: string) => {
        await this._commandHandler.deleteCommand(name)
        await this._commandHandler.createCommand(name)
    }
}