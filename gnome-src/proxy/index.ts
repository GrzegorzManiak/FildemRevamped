import { flog } from "../log";
import { get_bus_name_path, path_regex, read_iface_file } from "./reader";

import { Gio as GioTypes } from '@girs/gio-2.0';
const Gio = imports.gi.Gio;

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


        // -- DBus
        flog('INFO', 'Creating DBus proxy');
        const wrapper = Gio.DBusProxy.makeProxyWrapper(this._iface_raw);
        this._dbus_proxy = wrapper(
            Gio.DBus.session, 
            this.bus_name, 
            this.bus_path,
            this._on_proxy_read.bind(this)
        );
        flog('INFO', 'DBus proxy created');


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
        this._dbus_proxy = null;
        MenuProxy._instance = null;
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



    private async _on_send_top_level_menus(
        proxy: GioTypes.DBusProxy,
        sender_name: string,
        args: unknown[],
        invocation: GioTypes.DBusMethodInvocation
    ): Promise<void> {
        flog('INFO', `send_top_level_menus: ${sender_name}, ${args}, ${invocation}`);
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
    }
}