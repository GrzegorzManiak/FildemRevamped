import { flog } from "../log";
import { get_bus_name_path, path_regex, read_iface_file } from "./reader";

import { Gio as GioTypes } from '@girs/gio-2.0';
const Gio = imports.gi.Gio;

import { GLib as GLibTypes } from '@girs/glib-2.0';
const GLib = imports.gi.GLib;

/**
 * @class MenuProxy
 * This is a singleton class that is used to to communicate with the
 * python backend.
 * 
 * Its used to communicate the sate of applications and their menu
 * options.
 */
export default class MenuProxy {
    private static _instance: MenuProxy;
    public static readonly iface_file_name = 'iface.xml';
    public static readonly extension_path = '~/.local/share/gnome-shell/extensions/%uuid%';

    private _iface_raw: string;
    public readonly bus_name: string;
    public readonly bus_path: string;

    private _dbus_proxy: GioTypes.DBusProxy;
    private _handler_ids: number[] = [];

    private _send_top_level_menus_listeners: Array<(opts: Array<string>) => void> = [];
    private _menu_on_off_listeners: Array<(state: boolean) => void> = [];

    private constructor(
        public readonly uuid: string
    ) { 
        flog('INFO', 'MenuProxy constructor');


        // -- Iface
        flog('INFO', 'Reading iface file');
        this._iface_raw = read_iface_file(this.uuid);
        const names = get_bus_name_path(this._iface_raw);
        this.bus_name = names.bus_name;
        this.bus_path = names.path;
        flog('INFO', `Bus Name: ${this.bus_name}, Bus Path: ${this.bus_path}`);

        // -- Remove the path attribute
        this._iface_raw = this._iface_raw.replace(path_regex, '');
    }



    /**
     * @name get_instance
     * Gets the instance of the MenuProxy
     * 
     * @param {string} uuid - The uuid of the extension
     * 
     * @returns {MenuProxy} The instance of the MenuProxy
     */
    public static get_instance(
        uuid: string
    ): MenuProxy {
        if (!MenuProxy._instance) MenuProxy._instance = new MenuProxy(uuid);
        return MenuProxy._instance;
    }



    /**
     * @name destroy
     * Destroys the MenuProxy and disconnects all signals
     * 
     * @returns {void} Nothing
     */
    public destroy(): void {
        flog('INFO', 'Destroying MenuProxy');
        this._handler_ids.forEach(id => this._dbus_proxy.disconnectSignal(id));
    }



    /**
     * @name rebind
     * Rebinds the MenuProxy after it has been destroyed
     * 
     * @returns {void} Nothing
     */
    public rebind(): void {
        flog('INFO', 'Rebinding MenuProxy');
        this._dbus_proxy = Gio.DBusProxy.makeProxyWrapper(this._iface_raw)(
            Gio.DBus.session,
            this.bus_name,
            this.bus_path,
            this._on_proxy_read.bind(this)
        );
    }



    /**
     * @name _on_proxy_read
     * Called when the proxy is read
     * 
     * @param {Gio.DBusProxy} initable
     * @param {unknown} error
     * 
     * @returns {void} Nothing
     */
    private _on_proxy_read(
        initable: GioTypes.DBusProxy,
        error: unknown
    ): void {

        // -- Log and throw if there was an error
        flog('INFO', 'Proxy read: ', initable);
        if (error) {
            flog('ERROR', 'There was an error reading the proxy: ', error);
            throw new Error(error as string);
        }

        // -- Connect the signals
        {
            const id = this._dbus_proxy.connectSignal('SendTopLevelMenus', 
                this._on_send_top_level_menus.bind(this));
            this._handler_ids.push(id);
        }

        {
            const id = this._dbus_proxy.connectSignal('SendTopLevelOptions', 
                this._on_send_top_level_options_signal.bind(this));
            this._handler_ids.push(id);
        }

        {
            const id = this._dbus_proxy.connectSignal('RequestWindowActionsSignal', 
                this._on_request_window_actions_signal.bind(this));
            this._handler_ids.push(id);
        }

        {
            const id = this._dbus_proxy.connectSignal('ActivateWindowActionSignal', 
                this._on_activate_window_action_signal.bind(this));
            this._handler_ids.push(id);
        }

        {
            const id = this._dbus_proxy.connectSignal('MenuOnOff', 
                this._on_menu_on_off.bind(this));
            this._handler_ids.push(id);
        }
    }



    /**
     * @name add_send_top_level_menus_listener
     * Adds a listener for when the top level menus are sent
     * 
     * @param {(opts: Array<string>) => void} listener - The listener to add
     * 
     * @returns {() => void} A function to remove the listener
     */
    public add_send_top_level_menus_listener(
        listener: (opts: Array<string>) => void
    ): () => void {
        flog('INFO', 'Adding send top level menus listener');
        this._send_top_level_menus_listeners.push(listener);

        // -- Return the function to remove the listener
        return () => {
            flog('INFO', 'Removing send top level menus listener');
            const index = this._send_top_level_menus_listeners.indexOf(listener);
            if (index > -1) this._send_top_level_menus_listeners.splice(index, 1);
        }
    }



    /**
     * @name add_menu_on_off_listener
     * Adds a listener for when the menu is turned on or off
     * 
     * @param {(state: boolean) => void} listener - The listener to add
     * 
     * @returns {() => void} A function to remove the listener
     */
    public add_menu_on_off_listener(
        listener: (state: boolean) => void
    ): () => void {
        flog('INFO', 'Adding menu on off listener');
        this._menu_on_off_listeners.push(listener);

        // -- Return the function to remove the listener
        return () => {
            flog('INFO', 'Removing menu on off listener');
            const index = this._menu_on_off_listeners.indexOf(listener);
            if (index > -1) this._menu_on_off_listeners.splice(index, 1);
        }
    }



    /**
     * @name window_switched
     * Called by us when we detect that the window has switched
     * 
     * <method name="WindowSwitched">
	 *  <arg name="win_data" type="a{ss}" direction="in"/>
	 * </method>
     *
     * @param {Record<string, unknown>} win_data - The data of the window
     * 
     * @returns {void} Nothing
     */
    public window_switched(
        win_data: Record<string, unknown>
    ): void {
        flog('INFO', 'Window switched');
        this._dbus_proxy.call(
            'WindowSwitched',
            new GLib.Variant('(a{ss})', [win_data]),
            Gio.DBusCallFlags.NONE,
            -1,
            null,
            null
        );
    }



    /**
     * @name echo_signal
     * Sends a signal to the python backend, this function is called
     * when a menu item is clicked
     * 
     * <method name="EchoSignal">
	 *	<arg type="s" direction="in" name="menu"/>
	 *  <arg type="u" direction="in" name="x"/>
	 * </method>
     * 
     * @param {string} label - The label of the menu item
     * 
     * @returns {void} Nothing
     */
    public echo_signal(
        label: string
    ): void {
        flog('INFO', 'Echoing signal');
        this._dbus_proxy.call(
            'EchoSignal',
            new GLib.Variant('(su)', [label, 0]),
            Gio.DBusCallFlags.NONE,
            -1,
            null,
            null
        );
    }
                


    private async _on_send_top_level_menus(
        proxy: GioTypes.DBusProxy,
        sender_name: string,
        args: unknown[],
        invocation: GioTypes.DBusMethodInvocation
    ): Promise<void> {
        flog('INFO', `send_top_level_menus: ${sender_name}, ${args}, ${invocation}`);
    
        // -- Check if the args array is valid
        if (
            args.length !== 1 ||                            // -- Check if there's only one argument
            !Array.isArray(args[0]) ||                      // -- Check if the argument is an array
            args[0].some(arg => typeof arg !== 'string')    // -- Check if all elements of the array are strings
        ) {
            flog('ERROR', 'The args are not correct');
            return;
        }
    
        // -- Extract the array of strings from the args
        const menu_items: string[] = args[0] as string[];
    
        // -- Call the listeners with the array of strings as an argument
        this._send_top_level_menus_listeners.forEach(listener => listener(menu_items));
    }

    private async _on_send_top_level_options_signal(
        proxy: GioTypes.DBusProxy,
        sender_name: string,
        args: unknown[],
        invocation: GioTypes.DBusMethodInvocation
    ): Promise<void> {
        flog('INFO', `send_top_level_options_signal: ${sender_name}, ${args}, ${invocation}`);
    }
    
    private async _on_request_window_actions_signal(
        proxy: GioTypes.DBusProxy,
        sender_name: string,
        args: unknown[],
        invocation: GioTypes.DBusMethodInvocation
    ): Promise<void> {
        flog('INFO', `request_window_actions_signal: ${sender_name}, ${args}, ${invocation}`);
    }

    private async _on_activate_window_action_signal(
        proxy: GioTypes.DBusProxy,
        sender_name: string,
        args: unknown[],
        invocation: GioTypes.DBusMethodInvocation
    ): Promise<void> {
        flog('INFO', `activate_window_action_signal: ${sender_name}, ${args}, ${invocation}`);
    }

    private async _on_menu_on_off(
        proxy: GioTypes.DBusProxy,
        sender_name: string,
        args: unknown[],
        invocation: GioTypes.DBusMethodInvocation
    ): Promise<void> {
        flog('INFO', `menu_on_off: ${sender_name}, ${args}, ${invocation}`);

        // -- Ensure that the args are correct
        if (
            args.length !== 1 ||
            typeof args[0] !== 'boolean'
        ) {
            flog('ERROR', 'The args are not correct');
            throw new Error('The args are not correct');
        }

        // -- Call the listeners
        this._menu_on_off_listeners.forEach(listener => listener(args[0] as boolean));
    }
}