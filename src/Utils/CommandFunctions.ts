import CommandHandler from "../Handlers/CommandHandler";
import LVHandler from "../typings";

export default class CommandFunctions {
    private _commandHandler: CommandHandler
    constructor(commandHandler: CommandHandler) {
        this._commandHandler = commandHandler
    }

    public restartCommand = async (name: string): Promise<boolean> => {
        let result = await this._commandHandler.deleteCommand(name)
        if (result === false) return result
        result = await this._commandHandler.createCommand(name)
        return result
    }

    public deleteCommand = async (name: string): Promise<boolean> => {
        const result = await this._commandHandler.deleteCommand(name)
        return result
    }
}