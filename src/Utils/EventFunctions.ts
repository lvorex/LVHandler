import EventHandler from "../Handlers/EventHandler";

export default class EventFunctions {
    private _eventHandler: EventHandler
    constructor(eventHandler: EventHandler) {
        this._eventHandler = eventHandler
    }

    public refreshEvents = async () => {
        await this._eventHandler.startHandler()
        return true
    }
}