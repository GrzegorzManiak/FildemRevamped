import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Logger from '../logger/log';
import Type from '../logger/type';
import DBusClient from './client';


export default class DBusRegistrar {

    public static readonly INTERFACE: string = 'com.canonical.AppMenu.Registrar';
    public static readonly OBJECT_PATH: string = '/com/canonical/AppMenu/Registrar';
    public static readonly XML_INTERFACE: string = 'registrar.xml';

    private static _instance: DBusRegistrar;
    private readonly _dbus: Gio.DBusExportedObject;
    private readonly _iface: string;

    private _bus_id: number = 0;
    private _service_id: number = 0;

    private _window_map: Map<number, {
        window_id: number,
        menu_object_path: string,
        dbus: DBusClient
    }> = new Map();



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
        DBusRegistrar._instance = this;


        // -- Load the XML interface
        const decoder = new TextDecoder();
        const path = GLib.filename_from_uri(GLib.uri_resolve_relative(
            import.meta.url,    // -- Base path
            DBusRegistrar.XML_INTERFACE, // -- Relative path
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
    public static getInstance = (): DBusRegistrar => {
        if (!DBusRegistrar._instance) new DBusRegistrar();
        return DBusRegistrar._instance;
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
            DBusRegistrar.INTERFACE,
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
        this._dbus.export(Gio.DBus.session, DBusRegistrar.OBJECT_PATH);
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
        <signal name='Log'>
			<arg type='s' name='type'/>
			<arg type='s' name='time'/>
			<arg type='s' name='message'/>
		</signal>
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
            'Log',
            new GLib.Variant('(sss)', [type, timestamp, message])
        );
    };



    private _methods = {    



        /**
        <method name="RegisterWindow">
			<dox:d><![CDATA[
			  Associates a dbusmenu with a window
	     
			  /note this method assumes that the connection from the caller is the DBus connection
			    to use for the object.  Applications that use multiple DBus connections will need to
			    ensure this method is called with the same connection that implmenets the object.
			]]></dox:d>
			<arg name="windowId" type="u" direction="in">
				<dox:d>The XWindow ID of the window</dox:d>
			</arg>
			<arg name="menuObjectPath" type="o" direction="in">
				<dox:d>The object on the dbus interface implementing the dbusmenu interface</dox:d>
			</arg>
		</method>
         */
        RegisterWindow: (
            window_id: number,
            menu_object_path: string
        ): void => {
            Logger.info('Registering window: ' + window_id);
            Logger.info('Menu Object Path: ' + menu_object_path);
            if (this._window_map.has(window_id)) Logger.warn('Window already registered');

            const mm = Gio.DBusMenuModel.get(
                Gio.DBus.session,
                'com.canonical.menu',
                menu_object_path
            );

            Logger.info('Menu Model: ' + mm);
            Logger.info('Menu Model: ' + mm.get_n_items());

            const items = mm.get_n_items();
            for (let i = 0; i < items; i++) {
                const item = mm.get_item_attribute_value(i, null, null);
                Logger.info('Item: ' + item);
            }

        },

        

        /**
        <method name="UnregisterWindow">
			<dox:d>
			  A method to allow removing a window from the database.  Windows will also be removed
			  when the client drops off DBus so this is not required.  It is polite though.  And
			  important for testing.
			</dox:d>
			<arg name="windowId" type="u" direction="in">
				<dox:d>The XWindow ID of the window</dox:d>
			</arg>
		</method>
         */
        UnregisterWindow: (
            window_id: number
        ): void => {
            Logger.info('Unregistering window: ' + window_id);
            if (!this._window_map.has(window_id)) 
                return Logger.warn('Window not registered');

            const window = this._window_map.get(window_id);
            if (window) window.dbus.disconnect();
            this._window_map.delete(window_id);
        },



        /**
        <method name="GetMenuForWindow">
			<dox:d>Gets the registered menu for a given window ID.</dox:d>
			<arg name="windowId" type="u" direction="in">
				<dox:d>The XWindow ID of the window to get</dox:d>
			</arg>
			<arg name="service" type="s" direction="out">
				<dox:d>The address of the connection on DBus (e.g. :1.23 or org.example.service)</dox:d>
			</arg>
			<arg name="menuObjectPath" type="o" direction="out">
				<dox:d>The path to the object which implements the com.canonical.dbusmenu interface.</dox:d>
			</arg>
		</method>
         */
        GetMenuForWindow: (
            window_id: number
        ): {
            service: string,
            menuObjectPath: string
        } => {
            Logger.info('Getting menu for window: ' + window_id);
            return {
                service: '',
                menuObjectPath: ''
            };
        },
        


        /**
        <method name='GetWindowList'>
            <dox:d>Gets a list of all the windows that are registered with the registrar.</dox:d>
            <arg name="windowIds" type="au" direction="out">
                <dox:d>The list of window IDs.</dox:d>
            </arg>
        </method>
        */
        GetWindowList: (): number[] => {
            Logger.info('Getting window list');
            
            // -- Loop and log (We push logs to dbus so we can see them in the dbus-monitor tool)
            for (const [window_id, menu_object_path] of this._window_map)
                Logger.info('Window: ' + window_id + ' - ' + menu_object_path);
        
            return Array.from(this._window_map.keys());
        },
        


        emmit_service_started: (): void => {
            this._dbus.emit_signal(
                'service_running',
                new GLib.Variant('(s)', ['GGGM Service running'])
            );
        },
    };
}