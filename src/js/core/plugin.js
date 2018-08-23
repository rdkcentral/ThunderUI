/** The base plugin class applies for all plugins. Each plugin must match the name as it is returned from the WPE Framework
 * The supports object toggles what the plugin supports for the main ui
 */

class Plugin {

    /** Constructor
     * @{param} Name of the plugin for display on the UI
     * @{param} Support object to indicate plugin capabilities for the UI. Such as suspend/resume, toggle visibility and whether or not the plugin renders
     */
    constructor(pluginData) {
        this.callsign = pluginData.callsign;
        this.configuration = pluginData.configuration;
        this.classname = pluginData.classname;
        this.state = pluginData.state; // suspended, resumed, deactivated, activated
        this.supportsSuspended = false;
        this.supportsVisibility = false;
        this.renderInMenu = true;
        this.displayName = undefined;
        this.rendered = false;
    }

    /** The render function is called when the plugin needs to render on screen */
    render()        {
        this.rendered = true;
    }


    /** Theclose function is called when the plugin needs to clean up */
    close()         {
        this.rendered = false;
    }
}
