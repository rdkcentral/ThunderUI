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
 * Main controller plugin, renders a list of active plugins and the ability to interact with the plugins (deactivate/active/suspend/resume)
 */

import Plugin from '../core/plugin.js';

class Controller extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
        this.plugins = undefined;
        this.mainDiv = undefined;
        this.controllerListener = undefined;
    }

    /**
     * API
     */
    // Override activate to use the correct controller for composite plugins
    activate(callsign) {
        const delimiter = '/';
        const delimiterIndex = callsign.indexOf(delimiter);
        
        let controllerToUse = 'Controller';
        let callsignParam = callsign; // The callsign to pass as parameter
        
        if (delimiterIndex !== -1) {
            // This is a composite plugin (e.g., BridgeLink/Monitor)
            // Use the composite controller (e.g., BridgeLink/Controller)
            const prefix = callsign.substring(0, delimiterIndex);
            controllerToUse = prefix + delimiter + 'Controller';
            // Strip the prefix from the callsign parameter
            callsignParam = callsign.substring(delimiterIndex + 1);
        }
        
        console.log('activate() - callsign:', callsign, 'using controller:', controllerToUse, 'param:', callsignParam);
        
        const _rpc = {
            plugin: controllerToUse,
            method: 'activate',
            params: { 'callsign': callsignParam }
        };

        return this.api.req(null, _rpc);
    }

    // Override deactivate to use the correct controller for composite plugins
    deactivate(callsign) {
        const delimiter = '/';
        const delimiterIndex = callsign.indexOf(delimiter);
        
        let controllerToUse = 'Controller';
        let callsignParam = callsign; // The callsign to pass as parameter
        
        if (delimiterIndex !== -1) {
            // This is a composite plugin (e.g., BridgeLink/Monitor)
            // Use the composite controller (e.g., BridgeLink/Controller)
            const prefix = callsign.substring(0, delimiterIndex);
            controllerToUse = prefix + delimiter + 'Controller';
            // Strip the prefix from the callsign parameter
            callsignParam = callsign.substring(delimiterIndex + 1);
        }
        
        console.log('deactivate() - callsign:', callsign, 'using controller:', controllerToUse, 'param:', callsignParam);
        
        const _rpc = {
            plugin: controllerToUse,
            method: 'deactivate',
            params: { 'callsign': callsignParam }
        };

        return this.api.req(null, _rpc);
    }

    // Override suspend to use the correct controller for composite plugins
    suspend(callsign) {
        const delimiter = '/';
        const delimiterIndex = callsign.indexOf(delimiter);
        
        let controllerToUse = 'Controller';
        let callsignParam = callsign; // The callsign to pass as parameter
        
        if (delimiterIndex !== -1) {
            const prefix = callsign.substring(0, delimiterIndex);
            controllerToUse = prefix + delimiter + 'Controller';
            // Strip the prefix from the callsign parameter
            callsignParam = callsign.substring(delimiterIndex + 1);
        }
        
        console.log('suspend() - callsign:', callsign, 'using controller:', controllerToUse, 'param:', callsignParam);
        
        const _rpc = {
            plugin: controllerToUse,
            method: 'suspend',
            params: { 'callsign': callsignParam }
        };

        return this.api.req(null, _rpc);
    }

    // Override resume to use the correct controller for composite plugins
    resume(callsign) {
        const delimiter = '/';
        const delimiterIndex = callsign.indexOf(delimiter);
        
        let controllerToUse = 'Controller';
        let callsignParam = callsign; // The callsign to pass as parameter
        
        if (delimiterIndex !== -1) {
            const prefix = callsign.substring(0, delimiterIndex);
            controllerToUse = prefix + delimiter + 'Controller';
            // Strip the prefix from the callsign parameter
            callsignParam = callsign.substring(delimiterIndex + 1);
        }
        
        console.log('resume() - callsign:', callsign, 'using controller:', controllerToUse, 'param:', callsignParam);
        
        const _rpc = {
            plugin: controllerToUse,
            method: 'resume',
            params: { 'callsign': callsignParam }
        };

        return this.api.req(null, _rpc);
    }

    controllerStatus(plugin) {
        const _rpc = {
            plugin : 'Controller'
        };

        if (plugin)
            _rpc.method = `status@${plugin}`;
        else
            _rpc.method = 'status';

        return api.req(undefined, _rpc);
    }

    harakiri() {
        const _rpc = {
            plugin : 'Controller',
            method : 'harakiri',
            params : {'callsign': this.callsign}
        };

        return this.api.req(null, _rpc);
    }

    initiateDiscovery() {
        const _rpc = {
            plugin : 'Controller',
            method : 'startdiscovery',
            params : {'ttl': 1}
        };

        return this.api.req(null, _rpc);
    }

    getDiscovery() {
        const _rpc = {
            plugin : 'Controller',
            method : 'discoveryresults'
        };

        return this.api.req(null, _rpc);
    }

    persist(callback) {
        const _rpc = {
            plugin : 'Controller',
            method : 'storeconfig'
        };

        return this.api.req(null, _rpc);
    }

    /**
     * UI
     */
    toggleActivity(callsign) {
        console.log('toggleActivity called with callsign:', callsign);
        console.log('this.pluginMap:', this.pluginMap);
        console.log('this.plugins:', this.plugins);
        
        var plugin;

        // Try to find the plugin using the pluginMap first (for composite controllers)
        if (this.pluginMap && this.pluginMap[callsign]) {
            plugin = this.pluginMap[callsign];
            console.log('Found plugin in pluginMap:', plugin);
        } else {
            console.log('Plugin not in pluginMap, searching array...');
            // Fallback to the original array search
            for (var i=0; i<this.plugins.length; i++) {
                if (this.plugins[i].callsign === callsign) {
                    plugin = this.plugins[i];
                    console.log('Found plugin in array:', plugin);
                    break;
                }
            }
        }

        if (!plugin) {
            console.error('Plugin not found:', callsign);
            return;
        }

        console.log('Plugin state:', plugin.state);

        if (plugin.state === 'Deactivated') {
            console.debug('Activating ' + callsign);
            console.log('Calling this.activate with:', callsign);
            this.activate(callsign).then( (resp) => {
                console.log('Activation successful, response:', resp);
                plugin.state = 'Activated';
                this.render();
            }).catch( e => {
                console.error('Failed to activate:', e);
                this.render();
            });
        } else {
            console.debug('Deactivating ' + callsign);
            console.log('Calling this.deactivate with:', callsign);
            this.deactivate(callsign).then( (resp) => {
                console.log('Deactivation successful, response:', resp);
                plugin.state = 'Deactivated';
                this.render();
            }).catch(e => {
                console.error('Failed to deactivate:', e);
                this.render();
            });
        }
    }

    toggleSuspend(callsign) {
        var plugin;

        // Try to find the plugin using the pluginMap first (for composite controllers)
        if (this.pluginMap && this.pluginMap[callsign]) {
            plugin = this.pluginMap[callsign];
        } else {
            // Fallback to the original array search
            for (var i=0; i<this.plugins.length; i++) {
                if (this.plugins[i].callsign === callsign) {
                    plugin = this.plugins[i];
                    break;
                }
            }
        }

        if (!plugin) {
            console.error('Plugin not found:', callsign);
            return;
        }

        if (plugin.state === 'Deactivated') {
            console.debug('Activating ' + callsign);
            this.activate(callsign).then( resp => {
                plugin.state = 'Activated';
                // we have to rerender at this stage, we're going to be out of sync
                if (document.getElementById(callsign + 'suspend').checked === false)
                    this.resume(callsign).then( this.render.bind(this) );
                else
                    this.suspend(callsign).then( this.render.bind(this));
            });

            return;
        }

        if (plugin.state === 'Resumed') {
            console.debug('Suspending ' + callsign);
            this.suspend(callsign).then( resp => {
                this.updateSuspendLabel(callsign, 'resume');
                document.getElementById(callsign + 'suspend').checked = true;
                plugin.state = 'Suspended';
            });
        } else {
            console.debug('Resuming ' + callsign);
            this.resume(callsign).then( resp => {
                this.updateSuspendLabel(callsign, 'suspend');
                document.getElementById(callsign + 'suspend').checked = false;
                plugin.state = 'Resumed';
            });
        }
    }

    clear() {
        this.mainDiv.innerHTML = '';
    }

    discover() {
        console.log('Initiating discovery');
        this.initiateDiscovery();

        let self = this;

        setTimeout(function() {
            self.getDiscovery().then( data => {
                var discoveryList = data.bridges ? data.bridges : data;
                var container = document.getElementById('discoveryList');
                container.innerHTML = '';

                for (var i=0; i<discoveryList.length; i++) {
                    var li = document.createElement("li");
                    li.innerHTML = discoveryList[i].locator;
                    container.appendChild(li);
                }
            });
        }, 3000);
    }

    render() {
        if (!this.controllerListener) {
            this.controllerListener = this.api.t.on('Controller', 'statechange', data => {
                // check if we have a state change
                if (data.state !== undefined && this.rendered === true)
                    this.render();

                if (data.suspended !== undefined && this.rendered === true)
                    this.render();
            });
        }

        this.mainDiv = document.getElementById('main');
        this.mainDiv.innerHTML = `
          <div class="title grid__col grid__col--8-of-8">
            Plugins
          </div>
          <div id="controllerPlugins"></div>
          <div class="title grid__col grid__col--8-of-8">
            Device actions
          </div>
          <div class="text grid__col grid__col--8-of-8">
            <button type="button" id="persistButton">PERSIST</button>
          </div>
          <div class="text grid__col grid__col--8-of-8">
            <button type="button" id="harakiriButton">REBOOT</button>
          </div>
          <div class="title grid__col grid__col--8-of-8">
            Discover devices
          </div>
          <div class="label grid__col grid__col--2-of-8">
            <button type="button" id="discoverButton">DISCOVER</button>
          </div>
          <div class="text grid__col grid__col--6-of-8">
            <ul id="discoveryList"></ul>
          </div>
        </div>
        `;

        document.getElementById('persistButton').onclick = this.persist.bind(this);
        document.getElementById('harakiriButton').onclick = this.harakiri.bind(this);
        document.getElementById('discoverButton').onclick = this.discover.bind(this);
        var controllerPluginsDiv = document.getElementById('controllerPlugins');

        // Determine if we're viewing a bridged Controller (e.g., BridgeLink/Controller)
        const delimiter = '/';
        const delimiterIndex = this.callsign.indexOf(delimiter);
        const isCompositController = delimiterIndex !== -1;
        const controllerPrefix = isCompositController ? this.callsign.substring(0, delimiterIndex) : null;

        console.log('Controller.render() - callsign:', this.callsign);
        console.log('Controller.render() - isCompositController:', isCompositController);
        console.log('Controller.render() - controllerPrefix:', controllerPrefix);

        this.status().then(  data => {
            var plugins = data.plugins ? data.plugins : data;
            this.plugins = plugins; // store it
            
            // Create a mapping from display callsign to original plugin
            // This is needed because we modify callsigns for composite controllers
            this.pluginMap = {};

            console.log('Controller.render() - plugins received:', plugins.length);
            console.log('Controller.render() - first few plugins:', plugins.slice(0, 5).map(p => p.callsign));

            for (var i=0; i < plugins.length; i++) {
                var plugin = plugins[i];
                var callsign = plugin.callsign;
                var originalCallsign = callsign; // Store the original callsign
                var controlAllowed = true;

                // Extract the prefix and base callsign
                const pluginDelimiterIndex = callsign.indexOf(delimiter);
                const pluginPrefix = pluginDelimiterIndex !== -1 ? callsign.substring(0, pluginDelimiterIndex) : null;
                const baseCallsign = pluginDelimiterIndex !== -1 ? callsign.substring(pluginDelimiterIndex + 1) : callsign;

                // Skip Controller plugin
                if (callsign === 'Controller' || baseCallsign === 'Controller')
                    continue;

                // Filter based on which Controller we're viewing
                if (isCompositController) {
                    // Viewing a bridged Controller (e.g., BridgeLink/Controller)
                    // The status call returns plugins from the remote Thunder without the prefix
                    // So we need to add the prefix to the callsign for operations
                    // But first, skip any plugins that already have a different prefix (shouldn't happen, but just in case)
                    if (pluginPrefix !== null && pluginPrefix !== controllerPrefix) {
                        console.log('Controller.render() - filtering out (wrong prefix):', callsign);
                        continue;
                    }
                    
                    // If the plugin doesn't have a prefix, we need to add it for operations
                    if (pluginPrefix === null) {
                        callsign = controllerPrefix + delimiter + originalCallsign;
                        console.log('Controller.render() - adding prefix, new callsign:', callsign);
                    }
                    console.log('Controller.render() - including:', callsign);
                } else {
                    // Viewing local Controller
                    // Only show plugins without prefix (local plugins)
                    if (pluginPrefix !== null) {
                        console.log('Controller.render() - filtering out (has prefix):', callsign);
                        continue;
                    }
                }

                // Map the display callsign to the original plugin object
                this.pluginMap[callsign] = plugin;

                var labelDiv = document.createElement("div");
                labelDiv.className = "label grid__col grid__col--2-of-8";
                controllerPluginsDiv.appendChild(labelDiv);

                var label = document.createElement("label");
                // Display the base callsign without prefix since we're already in context
                label.innerHTML = baseCallsign;
                label.setAttribute("for", callsign);
                labelDiv.appendChild(label);

                var div = document.createElement("div");
                div.className = "grid__col grid__col--6-of-8 ";
                div.id =  callsign + "MainDiv";
                controllerPluginsDiv.appendChild(div);

                var checkboxDiv = document.createElement("div");
                checkboxDiv.className = "checkbox";
                div.appendChild(checkboxDiv);

                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = callsign;
                if (plugin.state == "Activated" || plugin.state == "Resumed" || plugin.state == "Suspended") {
                    checkbox.checked = true;
                }

                // Use the full callsign (with prefix if applicable) for activation/deactivation
                checkbox.onclick = this.toggleActivity.bind(this, callsign);
                checkboxDiv.appendChild(checkbox);

                var checkboxLabel = document.createElement("label");
                checkboxLabel.setAttribute("for", callsign);
                checkboxDiv.appendChild(checkboxLabel);

                if ( (plugin.state === 'Suspended') || (plugin.state === 'Resumed') ) {
                    var suspend = document.createElement("div");
                    suspend.id = callsign + "suspenddiv";
                    suspend.className = "suspend";
                    var suspendCheckbox = document.createElement("input");
                    suspendCheckbox.type = "checkbox";
                    suspendCheckbox.id = callsign + "suspend";
                    if (plugin.state == "Suspended") {
                        suspendCheckbox.checked = true;
                    }

                    suspendCheckbox.onclick = this.toggleSuspend.bind(this, callsign);
                    suspend.appendChild(suspendCheckbox);

                    var suspendLabel = document.createElement("label");
                    suspendLabel.setAttribute("for", callsign + "suspend");
                    suspendLabel.id = callsign + "suspendlabel";
                    if (plugin.state == "Suspended") {
                        suspendLabel.innerHTML = "resume";
                    } else {
                        suspendLabel.innerHTML = "suspend";
                    }
                    suspend.appendChild(suspendLabel);
                    div.appendChild(suspend);
                }
            }
        });

        this.rendered = true;
    }

    updateSuspendLabel(callsign, nextState) {
        var suspendLabel = document.getElementById(callsign + 'suspendlabel');
        suspendLabel.innerHTML = nextState;
    }

    close() {
        if (this.controllerListener && typeof this.controllerListener.dispose === 'function') {
          this.controllerListener.dispose();
          this.controllerListener = null;
        }
    }
}

export default Controller;
