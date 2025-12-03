/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Thunder application.js
 *
 * Main Thunder UI application - initializes and starts the UI
 * The landing page can be configured in conf.js (exposed through conf.js)
 */
'use strict';

import WpeApi from './wpeApi.js';
import conf from '../conf.js';
import Menu from '../layout/menu.js';
import Footer from '../layout/footer.js';
import Notifications from '../layout/notifications.js';

import Plugins from '../plugins/index.js'

/**
* Create the initial structure & globals
*/

// public
var plugins             = {};        // wfui plugins
var api                 = undefined; // WPE API
var plugin              = undefined;
//var conf                = Conf.default;

// private
var fetchedPlugins  = [];
var mainDiv         = document.getElementById('main');
// Sanitize localStorage input to prevent stored XSS
var storedPlugin    = window.localStorage.getItem('lastActivePlugin');
var activePlugin    = storedPlugin ? sanitizeForId(storedPlugin) : undefined;

/**
* Main initialization function
*
* Goes through a series of bootSteps to initialize the application, each step calls init again
* Within the init a loadingPage is rendered to show progress of the boot
* @memberof application
*/
function init(host){
    // initialize the WPE Framework API
    api = new WpeApi(host);
    api.getControllerPlugins().then( data => {
        fetchedPlugins = data;
        return fetchedPlugins
    }).then( fetchedPlugins => {
        // check which plugins are present on the device
        for (var i=0; i<fetchedPlugins.length; i++) {
            var pluginName = fetchedPlugins[i].callsign;
            var pluginClass = fetchedPlugins[i].classname;

            if (Plugins[pluginClass]) {
                plugins[ pluginName ] = new Plugins[pluginClass](fetchedPlugins[i], api);
            } else {
                console.log(pluginName + '( ' + pluginClass + ') not found')
            }

        }

        plugins.footer = new Footer(plugins.DeviceInfo, api);
        plugins.menu = new Menu(plugins, api);
        plugins.menu.render(activePlugin !== undefined ? activePlugin : conf.startPlugin);
        plugins.notifications = new Notifications(api);

        showPlugin(activePlugin !== undefined ? activePlugin : conf.startPlugin);
    })
}

/** (global) renders a plugin in the main div */
function showPlugin(callsign) {
    // Extract base callsign for plugin lookup (e.g., "DeviceInfo" from "BridgeLink1/DeviceInfo")
    const delimiter = '/';
    const lastDelimiterIndex = callsign.lastIndexOf(delimiter);
    const baseCallsign = lastDelimiterIndex !== -1 ? callsign.substring(lastDelimiterIndex + 1) : callsign;
    const prefix = lastDelimiterIndex !== -1 ? callsign.substring(0, lastDelimiterIndex) : null;

    if (plugins[ baseCallsign ] === undefined)
        return;

    if (activePlugin !== undefined) {
        // Get base callsign for the currently active plugin
        const activeLastDelimiter = activePlugin.lastIndexOf(delimiter);
        const activeBaseCallsign = activeLastDelimiter !== -1 ? activePlugin.substring(activeLastDelimiter + 1) : activePlugin;
        if (plugins[ activeBaseCallsign ] !== undefined)
            plugins[ activeBaseCallsign ].close();
    }

    activePlugin = callsign;
    
    // Set the active prefix on the API so all subsequent calls use it
    api.setActivePrefix(prefix);
    
    plugins[ baseCallsign ].render();
}

// Sanitize a string for safe use as object key/DOM id
function sanitizeForId(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[^a-zA-Z0-9_\/-]/g, '_');
}

/** (global) refresh current active plugin */
function renderCurrentPlugin() {
    // lets re-render menu too, just to be sure
    plugins.menu.render(activePlugin);

    // Use DOM methods instead of innerHTML
    var main = document.getElementById('main');
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }
    plugins[ activePlugin ].render();
};

export { init, showPlugin, conf, renderCurrentPlugin };
