import { flog } from "../log";
import { get_bus_name_path, read_iface_file } from "./reader";

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
}