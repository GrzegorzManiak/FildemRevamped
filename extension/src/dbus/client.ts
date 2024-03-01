import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Logger from '../logger/log';


export default class DBusClient {

    public static readonly INTERFACE: string = 'com.canonical.AppMenu.Registrar';
    public static readonly OBJECT_PATH: string = '/com/canonical/AppMenu/Registrar';

    private static _instance: DBusClient;
    private readonly _DBusClient: Gio.DBusExportedObject;

    private _proxy: Gio.DBusProxy;
    private _connection: Gio.DBusConnection;
    private _connected: boolean = false;

    /**
     * @name constructor
     * Creates a new instance of the DBusClient object
     *
     * This class is responsible for interacting with the
     * Gggm server via the DBus interface. It will be used
     * to get configs etc.
     *
     * @private
     */
    private constructor() {
        Logger.info('Creating DBusClient');
        DBusClient._instance = this;

        this._connected = this._connect();
        this._start_watching();
    }


    private _start_watching() {
        Logger.info('Starting to watch for name');
        Gio.bus_watch_name(
            Gio.BusType.SESSION,
            DBusClient.INTERFACE,
            Gio.BusNameWatcherFlags.NONE,
            this._on_name_appeared,
            this._on_name_vanished
        )
    }



    private _on_name_appeared(
        connection: Gio.DBusConnection,
        name: string,
        name_owner: string
    ) {
        Logger.info('Name appeared: ' + name);
        this._connected = this._connect();
        // this.get_menu_for_window(0x800003);
    }



    private _on_name_vanished(
        connection: Gio.DBusConnection,
        name: string
    ) {
        Logger.info('Name vanished: ' + name);
    };



    private _connect(): boolean {
        Logger.info('Attempting to connect to the Server');

        try {

            Logger.info('Connecting to the Server');
            this._connection = Gio.bus_get_sync(
                Gio.BusType.SESSION,
                null
            );

            Logger.info('Creating proxy');
            this._proxy = Gio.DBusProxy.new_sync(
                this._connection,
                Gio.DBusProxyFlags.NONE,
                null,
                DBusClient.INTERFACE,
                DBusClient.OBJECT_PATH,
                DBusClient.INTERFACE,
                null
            );

            Logger.info('Connected to the Server');
            return true;
        }

        catch (error) {
            Logger.error('Error connecting to the Server: ' + error.message);
            return false;
        }
    };

    

    /**
     * @name getInstance
     * Returns the instance of the DBusClient object
     *
     * @returns {DBusClient} - The instance of the DBusClient object
     */
    public static getInstance = (): DBusClient => {
        if (!DBusClient._instance) new DBusClient();
        return DBusClient._instance;
    };



    public get_menu_for_window = (window_id: number): { 
        service: string, 
        menuObjectPath: string 
    } => {
        Logger.info('Getting menu for window: ' + window_id);

        if (!this._connected) {
            Logger.error('Not connected to the server');
            return { service: '', menuObjectPath: '' };
        }

        try {
            Logger.info('Getting menu for window from the server');
            const result = this._proxy.call_sync(
                'GetMenuForWindow',
                new GLib.Variant('(u)', [window_id]),
                Gio.DBusCallFlags.NONE,
                -1,
                null
            );

            const [service, menuObjectPath] = result.deep_unpack();
            return { service, menuObjectPath };
        }

        catch (error) {
            Logger.error('Error getting menu for window: ' + error.message);
            return { service: '', menuObjectPath: '' };
        }
    };
}