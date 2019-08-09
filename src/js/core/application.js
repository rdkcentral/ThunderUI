/**
 * Thunder application.js
 *
 * Main Thunder UI application - initializes and starts the UI
 * The landing page can be configured in conf.js (exposed through conf.js)
 */
'use strict';
var API = import('../core/wpe.js');
var Conf = import('../conf.js');
var Menu = import('../layout/menu.js');
var Footer = import('../layout/footer.js');
var Notifications = import('../layout/notifications.js');

/**
* Create the initial structure & globals
*/

// public
var plugins             = {};        // wfui plugins
var api                 = undefined; // WPE API
var plugin              = undefined;
var conf                = undefined;

// private
var fetchedPlugins  = [];
var mainDiv         = document.getElementById('main');
var activePlugin    = window.localStorage.getItem('lastActivePlugin') || undefined;

/**
* Main initialization function
*
* Goes through a series of bootSteps to initialize the application, each step calls init again
* Within the init a loadingPage is rendered to show progress of the boot
* @memberof application
*/
function init(host, pluginClasses){
    Conf.then( (module) => {
        conf = module.default;
    })

    API.then( (module) => {
        // initialize the WPE Framework API
        api = new module.WpeApi(host);
        //api.startWebSocket();
        return api
    }).then( api => {
        console.debug('Getting list of plugins from Framework');
        api.getControllerPlugins().then( data => {
            fetchedPlugins = data;
            return fetchedPlugins
        }).then( fetchedPlugins => {
            console.debug('Loading plugins');

            let loadedPluginClassNames = pluginClasses.filter( pluginClass => {
                if (pluginClass.name !== undefined)
                    return true
                else
                    return false
            }).map( pluginClass => {
                return pluginClass.name();
            })

            // check which plugins are present on the device
            for (var i=0; i<fetchedPlugins.length; i++) {
                var pluginName = fetchedPlugins[i].callsign;
                var pluginClass = fetchedPlugins[i].classname;

                // try to init the plugin
                if (loadedPluginClassNames.indexOf(pluginClass) != -1) {
                    console.debug('Initializing plugin ' + pluginName);
                    plugins[ pluginName ] = new pluginClasses[ loadedPluginClassNames.indexOf(pluginClass) ].class(fetchedPlugins[i], api);
                } else {
                    console.debug('Unsupported plugin: ' + pluginName);
                }
            }

            Footer.then( module => {
                plugins.footer = new module.default(plugins.DeviceInfo);
            })

            Menu.then( module => {
                plugins.menu = new module.default(plugins, api);
                plugins.menu.render(activePlugin !== undefined ? activePlugin : conf.startPlugin);
            }).then( () => {
                showPlugin(activePlugin !== undefined ? activePlugin : conf.startPlugin);
            })

            Notifications.then( module => {
                plugins.notifications = new module.default(api);
            })

        })
    }).then( () => {
        //showPlugin(activePlugin !== undefined ? activePlugin : conf.startPlugin);
    })
}

/** (global) renders a plugin in the main div */
function showPlugin(callsign) {
    if (plugins[ callsign ] === undefined)
        return;

    if (activePlugin !== undefined && plugins[ activePlugin ] !== undefined)
        plugins[ activePlugin ].close();

    document.getElementById('main').innerHTML = '';
    plugins[ callsign ].render();
    activePlugin = callsign;
    window.localStorage.setItem('lastActivePlugin', callsign);
};

/** (global) refresh current active plugin */
function renderCurrentPlugin() {
    // lets re-render menu too, just to be sure
    plugins.menu.render(activePlugin);

    document.getElementById('main').innerHTML = '';
    plugins[ activePlugin ].render();
};

export { init, showPlugin, conf, renderCurrentPlugin };