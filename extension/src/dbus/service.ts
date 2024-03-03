import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Logger from '../logger/log';
import Type from '../logger/type';
import DBusClient from './client';

export default class DBusService {

    public readonly INTERFACE: string = 'com.canonical.dbusmenu';
    public readonly OBJECT_PATH: string = '/com/canonical/dbusmenu';
    public readonly XML_INTERFACE: string = 'dbusmenu.xml';

    protected _dbus: Gio.DBusExportedObject;
    private readonly _iface: string;

    private _bus_id: number = 0;
    private _service_id: number = 0;
    private _int_methods: { [key: string]: (...args: any[]) => any };


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
    public constructor(
        dbus_interface: string,
        object_path: string,
        xml_interface_path: string,
    ) {
        this.INTERFACE = dbus_interface;
        this.OBJECT_PATH = object_path;
        this.XML_INTERFACE = xml_interface_path;


        // -- Load the XML interface
        const decoder = new TextDecoder();
        const path = GLib.filename_from_uri(GLib.uri_resolve_relative(
            import.meta.url,    // -- Base path
            this.XML_INTERFACE, // -- Relative path
            GLib.UriFlags.NONE
        ))[0];
        Logger.info('Path: ' + path);


        // -- Read the file and decode it
        const [, buffer] = GLib.file_get_contents(path);
        this._iface = decoder.decode(buffer);
        GLib.free(buffer);
    };



    protected _set_methods = (_methods: {
        [key: string]: (...args: any[]) => any
    }): void => {
        this._int_methods = _methods;
        this._dbus = Gio.DBusExportedObject.wrapJSObject(
            this._iface,
            this._int_methods
        );
    };



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
            this.INTERFACE,
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
        this._dbus.export(Gio.DBus.session, this.OBJECT_PATH);
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
}