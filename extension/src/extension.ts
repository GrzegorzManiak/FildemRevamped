import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Logger from './logger/log';
import DBusRegistrar from './dbus/registrar';
import DBusClient from './dbus/client';

export default class Gggm extends Extension {
    private static _dbus_registrar: DBusRegistrar;

    public enable() {
        Logger.info('Gggm Enabling extension');

        if (!Gggm._dbus_registrar) Gggm._dbus_registrar = DBusRegistrar.getInstance();
        Gggm._dbus_registrar.acquire_bus();
    }

    public disable() {
        Logger.info('Gggm Disabling extension');
        if (Gggm._dbus_registrar) Gggm._dbus_registrar.release_bus();
    }
}

// <interface name="com.canonical.dbusmenu">
//     <property name="Version" type="u" access="read"/>
//     <property name="Status" type="s" access="read"/>

//     <signal name="ItemsPropertiesUpdated">
//     <annotation name="org.qtproject.QtDBus.QtTypeName.Out0" value="DBusMenuItemList"/>
//     <annotation name="org.qtproject.QtDBus.QtTypeName.Out1" value="DBusMenuItemKeysList"/>
//     <arg type="a(ia{sv})" direction="out"/>
//     <arg type="a(ias)" direction="out"/>
//     </signal>

//     <signal name="LayoutUpdated">
//     <arg name="revision" type="u" direction="out"/>
//     <arg name="parentId" type="i" direction="out"/>
//     </signal>

//     <signal name="ItemActivationRequested">
//     <arg name="id" type="i" direction="out"/>
//     <arg name="timeStamp" type="u" direction="out"/>
//     </signal>

//     <method name="Event">
//     <arg name="id" type="i" direction="in"/>
//     <arg name="eventId" type="s" direction="in"/>
//     <arg name="data" type="v" direction="in"/>
//     <arg name="timestamp" type="u" direction="in"/>
//     <annotation name="org.freedesktop.DBus.Method.NoReply" value="true"/>
//     </method>

//     <method name="GetProperty">
//     <arg type="v" direction="out"/>
//     <arg name="id" type="i" direction="in"/>
//     <arg name="property" type="s" direction="in"/>
//     </method>

//     <method name="GetLayout">
//     <arg type="u" direction="out"/>
//     <arg name="parentId" type="i" direction="in"/>
//     <arg name="recursionDepth" type="i" direction="in"/>
//     <arg name="propertyNames" type="as" direction="in"/>
//     <arg name="item" type="(ia{sv}av)" direction="out"/>
//     <annotation name="org.qtproject.QtDBus.QtTypeName.Out1" value="DBusMenuLayoutItem"/>
//     </method>

//     <method name="GetGroupProperties">
//     <arg type="a(ia{sv})" direction="out"/>
//     <annotation name="org.qtproject.QtDBus.QtTypeName.Out0" value="DBusMenuItemList"/>
//     <arg name="ids" type="ai" direction="in"/>
//     <annotation name="org.qtproject.QtDBus.QtTypeName.In0" value="QList&lt;int&gt;"/>
//     <arg name="propertyNames" type="as" direction="in"/>
//     </method>

//     <method name="AboutToShow">
//     <arg type="b" direction="out"/>
//     <arg name="id" type="i" direction="in"/>
//     </method>
// </interface>