import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import Logger from "./logger/log";
import DBusServer from "./dbus/server";
import DBusClient from "./dbus/client";

export default class ShareZ extends Extension {
    private static _dbus_server: DBusServer;
    private static _dbus_client: DBusClient;

    public enable() {
        Logger.info('SHAREZ Enabling extension');

        if (!ShareZ._dbus_server) ShareZ._dbus_server = DBusServer.getInstance();
        ShareZ._dbus_server.acquire_bus();

        if (!ShareZ._dbus_client) ShareZ._dbus_client = DBusClient.getInstance();
        // ShareZ._dbus_client.start_watching();
    }

    public disable() {
        Logger.info('SHAREZ Disabling extension');
        if (ShareZ._dbus_server) ShareZ._dbus_server.release_bus();
    }
}