import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Logger from '../logger/log';
import Type from '../logger/type';
import DBusClient from './client';
import DBusService from './service';

export default class DBusMenu extends DBusService {

    public static readonly INTERFACE: string = 'com.canonical.menu';
    public static readonly OBJECT_PATH: string = '/com/canonical/menu';
    public static readonly XML_INTERFACE: string = 'dbusmenu.xml';
    private static _instance: DBusMenu;


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
        super(
            DBusMenu.INTERFACE,
            DBusMenu.OBJECT_PATH,
            DBusMenu.XML_INTERFACE,
        );

        this._set_methods(this._methods);
        DBusMenu._instance = this;
    }



    /**
     * @name getInstance
     * Returns the instance of the DBus object
     *
     * @returns {DBus} - The instance of the DBus object
     */
    public static getInstance = (): DBusMenu => {
        if (!DBusMenu._instance) new DBusMenu();
        return DBusMenu._instance;
    }



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
    private items_properties_updated = (
        updated_props: any, 
        removed_props: any
    ) => {
        Logger.log(Type.INFO, 'ItemsPropertiesUpdated', updated_props, removed_props);
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
    private layout_updated = (
        revision: number,
        parent: number
    ) => {
        Logger.log(Type.INFO, 'LayoutUpdated', revision, parent);
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
    private item_activation_requested = (
        id: number,
        timestamp: number
    ) => {
        Logger.log(Type.INFO, 'ItemActivationRequested', id, timestamp);
    };



    /**
    <property name="Version" type="u" access="read">
        <dox:d>
        Provides the version of the DBusmenu API that this API is
        implementing.
        </dox:d>
    </property>
    */
    private prop_get_version = () => {
        this._dbus.emit_property_changed('Version', new GLib.Variant('u', 0));
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
    private prop_get_status = () => {
        this._dbus.emit_property_changed('Status', new GLib.Variant('s', 'normal'));
    };



    private prop_dbus_object = () => {
        this._dbus.emit_property_changed('dbus-object', new GLib.Variant('s', 'normal'));
    };

    private _methods = {    
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
        GetLayout: (
            parentId: number,
            recursionDepth: number,
            propertyNames: string[]
        ): [number, any] => {
            Logger.log(Type.INFO, 'GetLayout', parentId, recursionDepth, propertyNames);
            return [0, {}];
        },



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
        GetGroupProperties: (
            ids: number[],
            propertyNames: string[]
        ): any => {
            Logger.log(Type.INFO, 'GetGroupProperties', ids, propertyNames);
            return {};
        },



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
        GetProperty: (
            id: number,
            name: string
        ): any => {
            Logger.log(Type.INFO, 'GetProperty', id, name);
            return {};
        },



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
        Event: (
            id: number,
            event_id: string,
            data: any,
            timestamp: number
        ): void => {
            Logger.log(Type.INFO, 'Event', id, event_id, data, timestamp);
        },

        

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
        AboutToShow: (
            id: number
        ): boolean => {
            Logger.log(Type.INFO, 'AboutToShow', id);
            return true;
        },
    };
}