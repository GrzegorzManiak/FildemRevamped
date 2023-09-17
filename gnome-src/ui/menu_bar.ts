import { flog } from '../log';
import { ui } from '@girs/gnome-shell';
import MenuItem from './menu_btn';
import MenuProxy from '../proxy';

const Main = ui.main;
const WinTracker = imports.gi.Shell.WindowTracker.get_default();
const Shell = imports.gi.Shell;

export default class MenuBar {
    private static _instance: MenuBar;
    private _uuid: string;

    // -- Store the event listeners so that they can be removed later
    private _panel_events: Array<number> = [];
    private _menu_btns: Array<MenuItem> = [];
    private _mouse_over: boolean = false;

    private _enabled: boolean = true;
    private _window_switch_listener_id: number = 0;

    private _menu_proxy: MenuProxy;
    
    private constructor(uuid: string) {
        flog('INFO', 'MenuBar constructor');
        this._uuid = uuid;
        this._menu_proxy = MenuProxy.get_instance(uuid);

        // -- Add the event listeners
        this._add_event_listeners();
        this._on_window_switch();
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
        this._window_switch_listener_id = WinTracker.connect('notify::focus-app', this._on_window_switch.bind(this));
        this._menu_proxy.add_send_top_level_menus_listener(this._process_top_level_menus.bind(this));
    }



    /**
     * @name _process_top_level_menus
     * Processes the top level menus
     * 
     * @param {Array<string>} opts - The top level menus
     * 
     * @returns {void} Nothing
     */
    private _process_top_level_menus(
        opts: Array<string>
    ): void {
        flog('INFO', 'Processing top level menus');
        this.remove_all_menu_btns();

        // -- Loop through the top level menus and add them to the menu bar
        opts.forEach((opt) => {
            // -- If the first character is a _, then remove it
            if (opt.startsWith('_')) opt = opt.slice(1);
            flog('INFO', 'Adding top level menu: ', opt);
            this.add_menu_btn(opt);
        });
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



    /**
     * @name remove_all_menu_btns
     * Removes all the menu buttons from the menu bar
     * 
     * @returns {void} Nothing
     */
    public remove_all_menu_btns(): void {
        flog('INFO', 'Removing all menu buttons from the menu bar');
        this._menu_btns.forEach((menu_btn) => menu_btn.destroy());
        this._menu_btns = [];
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

    private _on_window_switch(): void {
        flog('INFO', 'Window switch');
        this.remove_all_menu_btns();

        // -- Get the focused window
        const focused_window = WinTracker.focus_app;

        // -- If there is no focused window, then return
        if (!focused_window) return;

        // -- Get the window
        flog('INFO', 'Focused window: ', focused_window);
        const win = focused_window.get_windows()[0];
        let xid = 0;

        // -- Attempt to get the xid, TODO: Find a better way to do this
        try { xid = parseInt(win.get_description().match(/0x[0-9a-f]+/)[0]); } 
        catch (e) { flog('ERROR', 'Failed to parse xid'); }

        
        let win_data = { xid: xid.toString() };
        for (let p in win) {
            // -- Pass only gtk related properties
            if (p.startsWith('gtk_') && win[p] != null) win_data[p] = win[p];
        }

        // -- Ask for the top level menus
        Object.keys(win_data).forEach((key) => 
            flog('INFO', 'KV: ', key, ', ', win_data[key]));
        this._menu_proxy.window_switched(win_data);
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