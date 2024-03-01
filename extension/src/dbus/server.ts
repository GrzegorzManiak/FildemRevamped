import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Logger from '../logger/log';
import Type from '../logger/type';

export default class DBusServer {

    public static readonly INTERFACE: string = 'dev.grzegorzmaniak.gggm';
    public static readonly OBJECT_PATH: string = '/dev/grzegorzmaniak/gggm';
    public static readonly XML_INTERFACE: string = 'iface.xml';

    private static _instance: DBusServer;
    private readonly _dbus: Gio.DBusExportedObject;
    private readonly _iface: string;

    private _bus_id: number = 0;
    private _service_id: number = 0;

    /**
     * @name constructor
     * Creates a new instance of the DBus object
     *
     * This class is responsible for creating the DBus object and exporting it
     * to the session bus. It will be used by the server to get the list of open
     * windows from the gnome-shell.
     *
     * @private
     */
    private constructor() {
        DBusServer._instance = this;


        // -- Load the XML interface
        const decoder = new TextDecoder();
        const path = GLib.filename_from_uri(GLib.uri_resolve_relative(
            import.meta.url,    // -- Base path
            DBusServer.XML_INTERFACE, // -- Relative path
            GLib.UriFlags.NONE
        ))[0];
        Logger.info('Path: ' + path);


        // -- Read the file and decode it
        const [, buffer] = GLib.file_get_contents(path);
        this._iface = decoder.decode(buffer);
        GLib.free(buffer);

        this._dbus = Gio.DBusExportedObject.wrapJSObject(
            this._iface,
            this._methods
        );
    }



    /**
     * @name getInstance
     * Returns the instance of the DBus object
     *
     * @returns {DBus} - The instance of the DBus object
     */
    public static getInstance = (): DBusServer => {
        if (!DBusServer._instance) new DBusServer();
        return DBusServer._instance;
    }



    /**
     * @name acquire_bus
     * Acquires the bus and exports the object
     *
     * @returns {void}
     */
    public acquire_bus = (): void => {
        // -- Release the bus if it was acquired
        this.release_bus();

        Logger.info('Acquiring bus');
        this._bus_id = Gio.bus_own_name(
            Gio.BusType.SESSION,
            DBusServer.INTERFACE,
            Gio.BusNameOwnerFlags.NONE,
            this.on_bus_acquired,
            this.on_name_acquired,
            this.on_name_lost,
        );

        Logger.info('Bus ID: ' + this._bus_id);
    }



    private on_bus_acquired = (
        connection: Gio.DBusConnection,
        name: string,
        user_data: any
    ): void => {
        Logger.info('Bus acquired', name);
        this._dbus.export(Gio.DBus.session, DBusServer.OBJECT_PATH);
    };



    private on_name_acquired = (
        connection: Gio.DBusConnection,
        name: string,
        user_data: any
    ): void => {
        Logger.info('Bus name acquired', name);
        this._service_id = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            5,
            () => {
                this._methods.emmit_service_started();
                return GLib.SOURCE_CONTINUE;
            }
        );
    };



    private on_name_lost = (
        connection: Gio.DBusConnection,
        name: string,
        user_data: any
    ): void => {
        Logger.error('Bus name lost', name);
        if (this._service_id > 0) GLib.source_remove(this._service_id);
        this._service_id = 0;
    }



    /**
     * @name release_bus
     * This method is responsible for destroying the DBus object
     * and releasing the bus, if it was acquired of course.
     *
     * @returns {void}
     */
    public release_bus = (): void => {
        Logger.warn('Releasing bus');
        if (this._service_id > 0) GLib.source_remove(this._service_id);
        if (this._bus_id > 0) Gio.bus_unown_name(this._bus_id);
        if (this._dbus) this._dbus.unexport();
    }


    /**
     * @name is_acquired
     * Returns true if the bus was acquired
     *
     * @returns {boolean} - True if the bus was acquired
     */
    public is_acquired = (): boolean => {
        return (
            this._bus_id > 0 &&
            this._service_id > 0
        );
    };



    /**
     * @name dbus_log
     * Logs a message through the dbus using signals
     *
     * @param {Type} type - The type of log
     * @param {String} timestamp - The timestamp of the log
     * @param {String} message - The message to log
     */
    public dbus_log = (
        type: Type,
        timestamp: string,
        message: string
    ): void => {
        if (!this.is_acquired()) return;
        this._dbus.emit_signal(
            'log',
            new GLib.Variant('(sss)', [type, timestamp, message])
        );
    };



    private _methods = {


        emmit_service_started: (): void => {
            this._dbus.emit_signal(
                'service_running',
                new GLib.Variant('(s)', ['GGGM Service running'])
            );
        },
    };
}