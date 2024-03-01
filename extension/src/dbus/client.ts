import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Logger from '../logger/log';
import {get_active_display, get_all_displays, get_focused_window, get_open_windows} from '../core/core';
import Window from '../core/window';
import Type from '../logger/type';
import Display from '../core/display';

export default class DBusClient {

    public static readonly INTERFACE: string = 'dev.grzegorzmaniak.gggm.server';
    public static readonly OBJECT_PATH: string = '/dev/grzegorzmaniak/Gggm/server';

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
        this.get_directories();
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
        this.get_directories();
    }



    private _on_name_vanished(
        connection: Gio.DBusConnection,
        name: string
    ) {
        Logger.info('Name vanished: ' + name);
    }



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
    }

    /**
     * @name getInstance
     * Returns the instance of the DBusClient object
     *
     * @returns {DBusClient} - The instance of the DBusClient object
     */
    public static getInstance = (): DBusClient => {
        if (!DBusClient._instance) new DBusClient();
        return DBusClient._instance;
    }



    /**
     * @name get_directories
     * Gets the directories from the server on where
     * we are meant to store the files
     *
     * @returns {{
     *     screenshots: string,
     *     recordings: string
     *     temp: string
     * }}
     */
    public get_directories = (): {
        screenshots: string,
        recordings: string,
        temp: string
    } => {
        Logger.info('Getting directories from the server');

        if (!this._connected) {
            Logger.error('Not connected to the server');
            return {
                screenshots: '',
                recordings: '',
                temp: ''
            };
        }

        try {
            Logger.info('Getting directories from the server');
            let directories = this._proxy.call_sync(
                'get_directories',
                null,
                Gio.DBusCallFlags.NONE,
                -1,
                null
            );

            return {
                screenshots: directories[0],
                recordings: directories[1],
                temp: directories[2]
            };
        }

        catch (error) {
            Logger.error('Error getting directories from the server: ' + error.message);
            return {
                screenshots: '',
                recordings: '',
                temp: ''
            };
        }
    };
}