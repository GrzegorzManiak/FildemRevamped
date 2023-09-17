import { flog } from '../log';
import { ui } from '@girs/gnome-shell';
const Main = ui.main;

export default class MenuBar {
    private static _instance: MenuBar;
    private _uuid: string;

    private _panel_events: Array<number> = [];

    private constructor(uuid: string) {
        flog('INFO', 'MenuBar constructor');
        this._uuid = uuid;

        // -- Add the event listeners
        this._add_event_listeners();
    }



    /**
     * @name get_instance
     * Gets the instance of the extension
     * 
     * @param {string} uuid - The uuid of the extension
     * 
     * @returns {GlobalExtension} The instance of the extension
     */
    public static get_instance(
        uuid: string
    ): MenuBar {
        if (!MenuBar._instance) MenuBar._instance = new MenuBar(uuid);
        return MenuBar._instance;
    }



    /**
     * @name _add_event_listeners
     * Adds the event listeners to the menu bar
     * 
     * @returns {void} Nothing
     */
    private _add_event_listeners(): void {
        flog('INFO', 'Adding event listeners to the menu bar');
        this._panel_events.push(Main.panel.connect('enter-event', this._on_enter.bind(this)));
        this._panel_events.push(Main.panel.connect('leave-event', this._on_leave.bind(this)));
    }



    // 
    // -- Event Listeners
    //

    private _on_enter(): void {
        flog('INFO', 'Mouse entered the menu bar');
    }

    private _on_leave(): void {
        flog('INFO', 'Mouse left the menu bar');
    }
}