import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Logger from '../logger/log';


export default class DBusClient {

    private readonly dbus_interface: string;
    private readonly object_path: string;

    private _proxy: Gio.DBusProxy | null = null;
    private _connection: Gio.DBusConnection | null = null;
    private _connected: boolean = false;

    private _listening: boolean = false;

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
    public constructor(
        dbus_interface: string,
        object_path: string
    ) {
        Logger.info('Creating DBusClient for ' + dbus_interface + ' at ' + object_path);
        this.dbus_interface = dbus_interface;
        this.object_path = object_path;
        this._connected = this._connect();
        this._start_watching();
    }


    private _start_watching() {
        Logger.info('Starting to watch for name');
        Gio.bus_watch_name(
            Gio.BusType.SESSION,
            this.dbus_interface,
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
        Logger.info('Name vanished: ' + name, this._connected);
    };



    private _connect(): boolean {
        Logger.info('Attempting to connect to the Server', this.dbus_interface, this.object_path);

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
                this.dbus_interface,
                this.object_path,
                this.dbus_interface,
                null
            );

            Logger.info('Connected to the Server', this._proxy);
            this._listen_to_signals();
            return true;
        }

        catch (error) {
            Logger.error('Error connecting to the Server: ' + error);
            return false;
        }
    };



    private _listen_to_signals() {
        Logger.info('Listening to signals');
        if (this._listening) return Logger.warn('Already listening to signals');
        this._listen_for_items_properties_updated();
        this._listen_for_layout_updated();
        this._listen_for_item_activation_requested();
    };



    public disconnect() {
        Logger.info('Disconnecting from the Server');
        this._proxy = null;
        this._connection = null;
    };



    //
    // Properties
    //



    /**
    <property name="Version" type="u" access="read">
        <dox:d>
        Provides the version of the DBusmenu API that this API is
        implementing.
        </dox:d>
    </property>
     */
    public get_version(): number | null {
        Logger.info('Getting version');
        try { 
            const value = this._proxy.get_cached_property('Version');
            Logger.info('Version', value);
            return Number(value);
        }
        catch (error) { return null; }
    };



    /**
    <property name="Status" type="s" access="read">
        <dox:d>
        Tells if the menus are in a normal state or they believe that they
        could use some attention.  Cases for showing them would be if help
        were referring to them or they accessors were being highlighted.
        This property can have two values: "normal" in almost all cases and
        "notice" when they should have a higher priority to be shown.
        </dox:d>
    </property>
     */
    public get_status(): string | null {
        Logger.info('Getting status');
        try { 
            const value = this._proxy.get_cached_property('Status');
            Logger.info('Status', value);
            return String(value);
        }
        catch (error) { return null; }
    };



    //
    // Methods
    //



    /**
    <method name="GetLayout">
        <annotation name="com.trolltech.QtDBus.QtTypeName.Out1" value="DBusMenuLayoutItem"/>
        <annotation name="org.gnustep.objc.selector" value="layoutForParent:depth:properties:"/>
        <dox:d>
            Provides the layout and propertiers that are attached to the entries
            that are in the layout.  It only gives the items that are children
            of the item that is specified in @a parentId.  It will return all of the
            properties or specific ones depending of the value in @a propertyNames.

            The format is recursive, where the second 'v' is in the same format
            as the original 'a(ia{sv}av)'.  Its content depends on the value
            of @a recursionDepth.
        </dox:d>
        <arg type="i" name="parentId" direction="in">
            <dox:d>The ID of the parent node for the layout.  For
            grabbing the layout from the root node use zero.</dox:d>
        </arg>
        <arg type="i" name="recursionDepth" direction="in">
            <dox:d>
                The amount of levels of recursion to use.  This affects the
                content of the second variant array.
                - -1: deliver all the items under the @a parentId.
                - 0: no recursion, the array will be empty.
                - n: array will contains items up to 'n' level depth.
            </dox:d>
        </arg>
        <arg type="as" name="propertyNames" direction="in" >
            <dox:d>
                The list of item properties we are
                interested in.  If there are no entries in the list all of
                the properties will be sent.
            </dox:d>
        </arg>
        <arg type="u" name="revision" direction="out">
            <dox:d>The revision number of the layout.  For matching
            with layoutUpdated signals.</dox:d>
        </arg>
        <arg type="(ia{sv}av)" name="layout" direction="out">
            <dox:d>The layout, as a recursive structure.</dox:d>
        </arg>
    </method>
     */
    public get_layout(
        parent_id: number,
        recursion_depth: number,
        property_names: string[]
    ): {
        revision: number,
        layout: any
    } | null {
        Logger.info('Getting layout');
        try {
            return this._proxy.call_sync(
                'GetLayout',
                new GLib.Variant('(iias)', [parent_id, recursion_depth, property_names]),
                Gio.DBusCallFlags.NONE,
                -1,
                null
            ).unpack();
        }
        catch (error) { return null; }
    };



    /**
    <method name="GetGroupProperties">
        <annotation name="com.trolltech.QtDBus.QtTypeName.In0" value="QList&lt;int&gt;"/>
        <annotation name="com.trolltech.QtDBus.QtTypeName.Out0" value="DBusMenuItemList"/>
        <annotation name="org.gnustep.objc.selector" value="menuItems:properties:"/>
        <dox:d>
        Returns the list of items which are children of @a parentId.
        </dox:d>
        <arg type="ai" name="ids" direction="in" >
            <dox:d>
                A list of ids that we should be finding the properties
                on.  If the list is empty, all menu items should be sent.
            </dox:d>
        </arg>
        <arg type="as" name="propertyNames" direction="in" >
            <dox:d>
                The list of item properties we are
                interested in.  If there are no entries in the list all of
                the properties will be sent.
            </dox:d>
        </arg>
        <arg type="a(ia{sv})" name="properties" direction="out" >
            <dox:d>
                An array of property values.
                An item in this area is represented as a struct following
                this format:
                @li id unsigned the item id
                @li properties map(string => variant) the requested item properties
            </dox:d>
        </arg>
    </method>
     */
    public get_group_properties(
        ids: number[],
        property_names: string[]
    ): {
        properties: any
    } | null {
        Logger.info('Getting group properties');
        try {
            return this._proxy.call_sync(
                'GetGroupProperties',
                new GLib.Variant('(aias)', [ids, property_names]),
                Gio.DBusCallFlags.NONE,
                -1,
                null
            ).unpack();
        }
        catch (error) { return null; }
    };



    /**
    <method name="GetProperty">
        <annotation name="org.gnustep.objc.selector" value="menuItem:property:"/>
        <dox:d>
            Get a signal property on a single item.  This is not useful if you're
            going to implement this interface, it should only be used if you're
            debugging via a commandline tool.
        </dox:d>
        <arg type="i" name="id" direction="in">
            <dox:d>the id of the item which received the event</dox:d>
        </arg>
        <arg type="s" name="name" direction="in">
            <dox:d>the name of the property to get</dox:d>
        </arg>
        <arg type="v" name="value" direction="out">
            <dox:d>the value of the property</dox:d>
        </arg>
    </method>
     */
    public get_property(
        id: number,
        name: string
    ): any | null {
        Logger.info('Getting property');
        try {
            return this._proxy.call_sync(
                'GetProperty',
                new GLib.Variant('(is)', [id, name]),
                Gio.DBusCallFlags.NONE,
                -1,
                null
            ).unpack();
        }
        catch (error) { return null; }
    };



    /**
    <method name="Event">
        <annotation name="org.gnustep.objc.selector" value="menuItem:receivedEvent:data:timestamp:"/>
        <dox:d><![CDATA[
        This is called by the applet to notify the application an event happened on a
        menu item.

        @a type can be one of the following:

        @li "clicked"
        @li "hovered"

        Vendor specific events can be added by prefixing them with "x-<vendor>-"
        ]]></dox:d>
        <arg type="i" name="id" direction="in" >
            <dox:d>the id of the item which received the event</dox:d>
        </arg>
        <arg type="s" name="eventId" direction="in" >
            <dox:d>the type of event</dox:d>
        </arg>
        <arg type="v" name="data" direction="in" >
            <dox:d>event-specific data</dox:d>
        </arg>
        <arg type="u" name="timestamp" direction="in" >
            <dox:d>The time that the event occured if available or the time the message was sent if not</dox:d>
        </arg>
    </method>
     */
    public event(
        id: number,
        event_id: string,
        data: any,
        timestamp: number
    ): void {
        Logger.info('Sending event');
        try {
            this._proxy.call_sync(
                'Event',
                new GLib.Variant('(isvu)', [id, event_id, data, timestamp]),
                Gio.DBusCallFlags.NONE,
                -1,
                null
            );
        }
        catch (error) { }
    };



    /**
    <method name="AboutToShow">
        <annotation name="org.gnustep.objc.selector" value="willShowMenuItem:"/>
        <dox:d>
        This is called by the applet to notify the application that it is about
        to show the menu under the specified item.
        </dox:d>
        <arg type="i" name="id" direction="in">
            <dox:d>
            Which menu item represents the parent of the item about to be shown.
            </dox:d>
        </arg>
        <arg type="b" name="needUpdate" direction="out">
            <dox:d>
            Whether this AboutToShow event should result in the menu being updated.
            </dox:d>
        </arg>
    </method>
     */
    public about_to_show(
        id: number
    ): boolean {
        Logger.info('Sending about to show');
        try {
            return this._proxy.call_sync(
                'AboutToShow',
                new GLib.Variant('(i)', [id]),
                Gio.DBusCallFlags.NONE,
                -1,
                null
            ).unpack();
        }
        catch (error) { return false; }
    };



    //
    // Signals
    //



    /**
    <signal name="ItemsPropertiesUpdated">
        <annotation name="com.trolltech.QtDBus.QtTypeName.In0" value="DBusMenuItemList"/>
        <annotation name="com.trolltech.QtDBus.QtTypeName.In1" value="DBusMenuItemKeysList"/>
        <dox:d>
        Triggered when there are lots of property updates across many items
        so they all get grouped into a single dbus message.  The format is
        the ID of the item with a hashtable of names and values for those
        properties.
        </dox:d>
        <arg type="a(ia{sv})" name="updatedProps" direction="out" />
        <arg type="a(ias)" name="removedProps" direction="out" />
    </signal>
     */
    private _listen_for_items_properties_updated() {
        this._proxy.connectSignal(
            'ItemsPropertiesUpdated',
            (
                proxy: Gio.DBusProxy,
                name: string,
                args: string,
            ) => {
                Logger.info('Items properties updated', args, name);
            }
        );
    };



    /**
    <signal name="LayoutUpdated">
        <dox:d>
        Triggered by the application to notify display of a layout update, up to
        revision
        </dox:d>
        <arg type="u" name="revision" direction="out" >
            <dox:d>The revision of the layout that we're currently on</dox:d>
        </arg>
        <arg type="i" name="parent" direction="out" >
            <dox:d>
            If the layout update is only of a subtree, this is the
            parent item for the entries that have changed.  It is zero if
            the whole layout should be considered invalid.
            </dox:d>
        </arg>
    </signal>
     */
    private _listen_for_layout_updated() {
        this._proxy.connectSignal(
            'LayoutUpdated',
            (
                proxy: Gio.DBusProxy,
                name: string,
                args: string,
            ) => {
                Logger.info('Layout updated', args, name);
            }
        );
    };



    /**
    <signal name="ItemActivationRequested">
        <dox:d>
            The server is requesting that all clients displaying this
            menu open it to the user.  This would be for things like
            hotkeys that when the user presses them the menu should
            open and display itself to the user.
        </dox:d>
        <arg type="i" name="id" direction="out" >
            <dox:d>ID of the menu that should be activated</dox:d>
        </arg>
        <arg type="u" name="timestamp" direction="out" >
            <dox:d>The time that the event occured</dox:d>
        </arg>
    </signal>
     */
    private _listen_for_item_activation_requested() {
        this._proxy.connectSignal(
            'ItemActivationRequested',
            (
                proxy: Gio.DBusProxy,
                name: string,
                args: string,
            ) => {
                Logger.info('Item activation requested', args, name);
            }
        );
    };
}