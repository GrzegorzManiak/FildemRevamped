import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Logger from './logger/log';
import DBusServer from './dbus/server';
import DBusClient from './dbus/client';

export default class Gggm extends Extension {
    private static _dbus_server: DBusServer;
    private static _dbus_client: DBusClient;

    public enable() {
        Logger.info('Gggm Enabling extension');

        if (!Gggm._dbus_server) Gggm._dbus_server = DBusServer.getInstance();
        Gggm._dbus_server.acquire_bus();

        // if (!Gggm._dbus_client) Gggm._dbus_client = DBusClient.getInstance();
        // Gggm._dbus_client.start_watching();
    }

    public disable() {
        Logger.info('Gggm Disabling extension');
        if (Gggm._dbus_server) Gggm._dbus_server.release_bus();
    }
}