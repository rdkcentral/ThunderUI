/**
 * WPE Framework application.js
 *
 * Main WPE Framework UI application - initializes and starts the UI (short: WFUI?)
 * The landing page can be configured in conf.js (exposed through wfui.conf)
 */

(function () {
    /**
    * Create the initial structure & globals
    */

    // public
    plugins             = {};       // wfui plugins
    api                 = undefined; // WPE API

    // private
    var bootStep        = 1;
    var fetchedPlugins  = [];
    var mainDiv         = document.getElementById('main');
    var activePlugin    = window.localStorage.getItem(this.lastActivePlugin) || undefined;

    /**
    * Main initialization function
    *
    * Goes through a series of bootSteps to initialize the application, each step calls init again
    * Within the init a loadingPage is rendered to show progress of the boot
    * @memberof application
    */
    function init(){
        if (bootStep === 1){
            /*
             * BOOT Step 1 - Init the WPE API
             */
            console.debug('Initializing WPE API');
            var hostname = document.getElementById("hostname") && document.getElementById("hostname").value;
            if ((hostname === null) || (hostname === ""))
                hostname = window.location.hostname;

            port = document.getElementById("port") && document.getElementById("port").value;
            if ((port === null) || (port === "")) {
                if (window.location.host === window.location.hostname)
                    port = 80;
                else
                    port = window.location.host.substring(window.location.hostname.length + 1);
            }

            if ((port !== "") && (port !== 80))
                hostname += ":" + port;

            // check if wpe.js is already loaded, if not wait
            if (window.WpeApi === undefined) {
                console.debug('WPE API is not ready yet, retrying...');
                setTimeout(init, 50);
                return;
            }

            // initialize the WPE Framework API
            api = new window.WpeApi(hostname);
            initNext();
        /*
         * BOOT Step 2 - Get the list of plugins and init each plugin
         */
        } else if (bootStep === 2){
            console.debug('Getting list of plugins from Framework');
            api.getControllerPlugins().then( data => {
                fetchedPlugins = data.plugins;
                initNext();
            }).catch( e => {
                console.error(e);
                setTimeout(init, conf.refresh_interval); // device is probably offline, retrying
            })
        /*
         * Boot step 3 - register each plugin
         */
        } else if (bootStep === 3){
            console.debug('Loading plugins');
            // check which plugins are present on the device
            for (var i=0; i<fetchedPlugins.length; i++) {
                var pluginName = fetchedPlugins[i].callsign;
                var pluginClass = fetchedPlugins[i].classname;

                // try to init the plugin
                if (pluginClasses[ pluginClass ] !== undefined) {
                    console.debug('Initializing plugin ' + pluginName);
                    plugins[ pluginName ] = new pluginClasses[ pluginClass ](fetchedPlugins[i]);
                } else {
                    console.debug('Unsupported plugin: ' + pluginName);
                }

                if (i===fetchedPlugins.length-1)
                    initNext();
            }
        /*
         * Boot step 4 - initialize the menu
         */
        } else if (bootStep === 4){
            console.debug('Rendering menu');
            plugins.menu = new Menu();
            plugins.menu.render(activePlugin !== undefined ? activePlugin : conf.startPlugin);
            initNext();
        /*
         * Boot step 5 - render the default plugin from conf.startPlugin or the last visited from local
         */
        } else if (bootStep === 5){
            showPlugin(activePlugin !== undefined ? activePlugin : conf.startPlugin);
            initNext();
        /*
         * Boot step 6 - start the footer status bar
         */
        } else if (bootStep === 6){
            plugins.footer = new Footer();

            initNext();
        /*
         * Boot step 7 - start the notification socket
         */
        } else if (bootStep === 7){

            api.startWebSocket();

            initNext();
        /*
         * Boot step 8 - start the socket notification console
         */
        } else if (bootStep === 8){
            plugins.notifications = new Notifications();
        }
    }

    /** Find the next bootstep and go run that */
    function initNext() {
        console.debug('Bootstep ' + bootStep + ' completed');

        bootStep++;
        init();
    }

    /** (global) renders a plugin in the main div */
    showPlugin = function(callsign) {
        if (plugins[ callsign ] === undefined)
            return;

        if (activePlugin !== undefined && plugins[ activePlugin ] !== undefined)
            plugins[ activePlugin ].close();

        document.getElementById('main').innerHTML = '';
        plugins[ callsign ].render();
        activePlugin = callsign;
        window.localStorage.setItem(this.lastActivePlugin, callsign);
    };

    /** (global) refresh current active plugin */
    renderCurrentPlugin = function() {
        // lets re-render menu too, just to be sure
        plugins.menu.render(activePlugin);

        document.getElementById('main').innerHTML = '';
        plugins[ activePlugin ].render();
    };

    init();

})();
