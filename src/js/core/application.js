/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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
var activePlugin    = window.localStorage.getItem('lastActivePlugin') || undefined;

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

        plugins.footer = new Footer(plugins.DeviceInfo);
        plugins.menu = new Menu(plugins, api);
        plugins.menu.render(activePlugin !== undefined ? activePlugin : conf.startPlugin);
        plugins.notifications = new Notifications(api);

        showPlugin(activePlugin !== undefined ? activePlugin : conf.startPlugin);
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
