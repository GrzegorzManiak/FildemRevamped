import { flog } from '../log';
import { ui } from '@girs/gnome-shell';
import MenuItem from './menu_btn';
const Main = ui.main;

export default class MenuBar {
    private static _instance: MenuBar;
    private _uuid: string;

    // -- Store the event listeners so that they can be removed later
    private _panel_events: Array<number> = [];
    private _menu_btns: Array<MenuItem> = [];
    private _mouse_over: boolean = false;

    private _enabled: boolean = true;

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



    /**
     * @name _update_state
     * Updates the state of the menu bar
     * depending on if the menu bar is enabled or not
     * 
     * @returns {void} Nothing
     */
    private _update_state(): void {
        flog('INFO', 'Updating the state of the menu bar');
    }



    /**
     * @name add_menu_btn
     * Adds a menu button to the menu bar
     * 
     * @param {string} label - The label of the menu button
     * @param {number} [left_margin=0] - The margin to add to the menu button
     * 
     * @returns {MenuItem} The menu button
     */
    public add_menu_btn(
        label: string,
        left_margin: number = 0
    ): MenuItem {
        flog('INFO', 'Adding menu button to the menu bar');
        const new_button = new MenuItem(label, this);

        // -- Add the button to the menu bar
        this._menu_btns.push(new_button);

        // -- Add the button to the menu bar
        const time_in_ms = new Date().getTime();
        Main.panel.addToStatusArea(
            `${this._uuid}-menu-btn-${label}-${time_in_ms}`,
            new_button,
            left_margin,
            'left'
        );
        flog('INFO', 'Added: ', `${this._uuid}-menu-btn-${label}-${time_in_ms}`);
        
        // -- Return the new button
        return new_button;
    }



    // 
    // -- Event Listeners
    //

    private _on_enter(): void {
        // -- No need to do anything if we are already over
        if (this._mouse_over) return;
        this._mouse_over = true;
        
    }

    private _on_leave(): void {
        // -- No need to do anything if we are already not over
        if (!this._mouse_over) return;
        this._mouse_over = false;

    }



    //
    // -- Getters and Setters
    //
    public get mouse_over(): boolean {
        return this._mouse_over; }

    public get enabled(): boolean {
        return this._enabled; }

    public set enabled(value: boolean) {
        this._enabled = value; this._update_state(); }
}