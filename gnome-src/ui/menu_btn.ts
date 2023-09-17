import { ui } from '@girs/gnome-shell';
import { St as StTypes } from '@girs/st-12';
import { Clutter } from '@girs/clutter-12';
import MenuBar from './menu_bar';
const St = imports.gi.St;

export class MenuItem extends ui.panelMenu.Button {
    private _label: string;
    private _menu: MenuBar;

    private _box_layout: StTypes.BoxLayout;
    private _label_widget: StTypes.Label;



    /**
     * @constructor
     * The constructor for the MenuItem class
     * It creates a new MenuItem to be added to the 
     * top panel
     */
    public constructor(
        label: string,
        menu: MenuBar
    ) {
        super(0.0, label);

        this._label = label;
        this._menu = menu;

        this._construct();
        this._init();
    }



    /**
     * @name _construct
     * This function constructs the MenuItem by
     * adding styles and the event listeners
     * 
     * @returns {void} Nothing
     */
    private _construct(): void {

        // -- Apply all the styles
        this._box_layout = new St.BoxLayout({
            style_class: 'panel-status-menu-box menubar-button'
        });

        this._label_widget = new St.Label({
            text: this._label,
            y_align: imports.gi.Clutter.ActorAlign.CENTER,
            reactive: true
        });

        // -- Append the label to the box layout
        this._box_layout.add_child(this._label_widget);
        this.add_child(this._box_layout);


        // -- Add the event listeners
        this.connect('button-release-event', 
            this._on_button_event.bind(this));
    }



    /**
     * @name _on_button_event
     * This function is called when the button is clicked
     * 
     * @param {St.Button} actor - The button that was clicked
     * @param {Clutter.Event} event - The event that was triggered
     * 
     * @returns {boolean} Whether or not to propagate the event
     */
    private _on_button_event(
        actor: StTypes.Button,
        event: Clutter.Event
    ): boolean {
        return true;
    }



    /**
     * @name destroy
     * This function destroys the MenuItem
     * 
     * @returns {void} Nothing
     */
    public destroy(): void {
        this._label_widget.destroy();
        this._box_layout.destroy();
        super.destroy();
    }
}