import Meta from "@girs/meta-13";
import Logger from "../logger/log";
import type Shell from "@girs/shell-13";

export default class Window {
    private _title: string;
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _z_index: number;
    private _app_id: string;
    private _meta_display: Meta.Display;
    private _meta_window: Meta.Window;

    private static _current_window: Window | null = null;
    private static _window_changed_listeners: Array<(window: Window | null) => void> = [];
    private static _started: boolean = false;
    private static _listening: boolean = false;


    /**
     * @name Window
     * Standard window object that will be sent over dbus
     *
     * @param {string} title - The title of the window
     * @param {number} x - The x position of the window
     * @param {number} y - The y position of the window
     * @param {number} width - The width of the window
     * @param {number} height - The height of the window
     * @param {number} z_index - The z-index of the window (The order in which it is displayed)
     * @param {string} app_id - The app id of the window
     * @param {Meta.Display} meta_display - The meta display of the window
     * @param {Meta.Window} meta_window - The meta window of the window
     */
    public constructor(
        title: string,
        x: number,
        y: number,
        width: number,
        height: number,
        z_index: number,
        app_id: string,
        meta_display: Meta.Display,
        meta_window: Meta.Window
    ) {
        this._title = title;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._z_index = z_index;
        this._app_id = app_id;
        this._meta_display = meta_display;
        this._meta_window = meta_window;
    };



    /**
     * @name start
     * Starts the window listener
     * 
     * @returns {void}
     */
    public static start = (): void => {
        if (Window._started) return Logger.warn('Window listener is already started');
        Logger.info('Starting window listener');
        Window._start_window_changed_listener();
        Window._started = true;
        Window._listening = true;
    };



    /**
     * @name stop
     * Stops the window listener
     * 
     * @returns {void}
     */
    public static stop = (): void => {
        if (!Window._started) return Logger.warn('Window listener is not started');
        Logger.info('Stopping window listener');
        Window._listening = false;
    };




    /**
    * @name get_focused_window
    * Returns the focused window
    * 
    * @param {Meta.Display} meta_display
    *
    * @returns {Window | null} - The focused window or null if there is no focused window
    */
    public static get_focused_window = (
        meta_display: Meta.Display
    ): Window | null => {
       const meta_window = meta_display.get_focus_window();
       if (!meta_window) return null;
       return new Window(
            meta_window.get_title(),
            meta_window.get_frame_rect().x,
            meta_window.get_frame_rect().y,
            meta_window.get_frame_rect().width,
            meta_window.get_frame_rect().height,
            meta_window.get_layer(),
            meta_window.get_wm_class(),
            meta_display,
            meta_window
       );
   };



   /**
    * @name add_window_changed_listener
    * Adds a listener for when the window changes
    * 
    * @param {function} listener - The listener to add
    */
    public static add_window_changed_listener = (listener: (window: Window | null) => void): void => {
        Window._window_changed_listeners.push(listener);
    };



    /**
     * @name start_window_changed_listener
     * Starts the window changed listener
     * 
     * @returns {void}
     */
    private static _start_window_changed_listener = (): void => {
        Logger.info('Starting window changed listener');
        (global as unknown as Shell.Global).display.connect('notify::focus-window', (meta_display) => {
            if (!Window._listening) return;
            const window = Window.get_focused_window(meta_display);
            if (window === Window._current_window) return;
            Window._current_window = window;
            Window._window_changed_listeners.forEach(listener => listener(window));
        });
    };




    public get title(): string { return this._title; }
    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get width(): number { return this._width; }
    public get height(): number { return this._height; }
    public get z_index(): number { return this._z_index; }
    public get app_id(): string { return this._app_id; }
    public get meta_display(): Meta.Display { return this._meta_display; }
    public get meta_window(): Meta.Window { return this._meta_window; }
}