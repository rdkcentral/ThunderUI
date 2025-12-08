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

        const _rpc = {
            plugin: controllerToUse,
            method: 'activate',
            params: { 'callsign': callsignParam }
        };
 
        return this.api.req(null, _rpc).then(result => {
            if (window.menu) {
                if (window.menu.pluginStateCache) {
                    window.menu.pluginStateCache.set(callsign, 'Activated');
                }

                // Check if this is a composite plugin by probing for its controller
                // Only check top-level plugins (no "/" in callsign)
                if (delimiterIndex === -1) {
                    // Wait for the plugin to fully start before probing
                    setTimeout(() => {
                        this.isCompositePlugin(callsign).then(isComposite => {
                            if (isComposite) {
                                setTimeout(() => window.location.reload(), 500);
                            } else {
                                window.menu.update();
                            }
                        });
                    }, 1000);
                } else {
                    setTimeout(() => window.menu.update(), 200);
                }
            } else {
                window.menu.update();
            }
            return result;
        });
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

        // For deactivation, we need to check if it's a composite plugin before deactivating
        const checkCompositeFirst = delimiterIndex === -1 ? this.isCompositePlugin(callsign) : Promise.resolve(false);

        return checkCompositeFirst.then(isComposite => {
            return this._doDeactivate(controllerToUse, callsignParam, callsign, delimiterIndex, isComposite);
        });
    }

    // Internal method to perform the actual deactivation
    _doDeactivate(controllerToUse, callsignParam, callsign, delimiterIndex, isComposite) {
        const _rpc = {
            plugin: controllerToUse,
            method: 'deactivate',
            params: { 'callsign': callsignParam }
        };

        return this.api.req(null, _rpc).then(result => {
            if (window.menu) {
                if (window.menu.pluginStateCache) {
                    window.menu.pluginStateCache.set(callsign, 'Deactivated');
                }

                // For composite plugins, reload the page to properly clean up the instance selector
                // Only check top-level plugins (no "/" in callsign)
                if (delimiterIndex === -1) {
                    // isComposite was determined before deactivation
                    if (isComposite) {
                        setTimeout(() => window.location.reload(), 500);
                    } else {
                        setTimeout(() => window.menu.update(), 200);
                    }
                } else {
                    setTimeout(() => window.menu.update(), 200);
                }
            } else {
                window.menu.update();
            }
            return result;
        });
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
            this.activate(callsign).then( (resp) => {
                plugin.state = 'Activated';
                this.render();
            }).catch( e => {
                console.error('Failed to activate:', e);
                this.render();
            });
        } else {
            this.deactivate(callsign).then( (resp) => {
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
            this.suspend(callsign).then( resp => {
                this.updateSuspendLabel(callsign, 'resume');
                document.getElementById(callsign + 'suspend').checked = true;
                plugin.state = 'Suspended';
            });
        } else {
            this.resume(callsign).then( resp => {
                this.updateSuspendLabel(callsign, 'suspend');
                document.getElementById(callsign + 'suspend').checked = false;
                plugin.state = 'Resumed';
            });
        }
    }

    clear() {
        while (this.mainDiv.firstChild) {
            this.mainDiv.removeChild(this.mainDiv.firstChild);
        }
    }

    discover() {
        console.log('Initiating discovery');
        this.initiateDiscovery();

        let self = this;

        setTimeout(function() {
            self.getDiscovery().then( data => {
                var discoveryList = data.bridges ? data.bridges : data;
                var container = document.getElementById('discoveryList');
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }

                for (var i=0; i<discoveryList.length; i++) {
                    var li = document.createElement("li");
                    li.textContent = discoveryList[i].locator;
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
        while (this.mainDiv.firstChild) {
            this.mainDiv.removeChild(this.mainDiv.firstChild);
        }

        // Build UI using DOM methods instead of innerHTML
        var pluginsTitle = document.createElement('div');
        pluginsTitle.className = 'title grid__col grid__col--8-of-8';
        pluginsTitle.textContent = 'Plugins';
        this.mainDiv.appendChild(pluginsTitle);

        var controllerPluginsDiv = document.createElement('div');
        controllerPluginsDiv.id = 'controllerPlugins';
        this.mainDiv.appendChild(controllerPluginsDiv);

        var deviceActionsTitle = document.createElement('div');
        deviceActionsTitle.className = 'title grid__col grid__col--8-of-8';
        deviceActionsTitle.textContent = 'Device actions';
        this.mainDiv.appendChild(deviceActionsTitle);

        var persistDiv = document.createElement('div');
        persistDiv.className = 'text grid__col grid__col--8-of-8';
        var persistButton = document.createElement('button');
        persistButton.type = 'button';
        persistButton.id = 'persistButton';
        persistButton.textContent = 'PERSIST';
        persistDiv.appendChild(persistButton);
        this.mainDiv.appendChild(persistDiv);

        var rebootDiv = document.createElement('div');
        rebootDiv.className = 'text grid__col grid__col--8-of-8';
        var harakiriButton = document.createElement('button');
        harakiriButton.type = 'button';
        harakiriButton.id = 'harakiriButton';
        harakiriButton.textContent = 'REBOOT';
        rebootDiv.appendChild(harakiriButton);
        this.mainDiv.appendChild(rebootDiv);

        var discoverTitle = document.createElement('div');
        discoverTitle.className = 'title grid__col grid__col--8-of-8';
        discoverTitle.textContent = 'Discover devices';
        this.mainDiv.appendChild(discoverTitle);

        var discoverLabelDiv = document.createElement('div');
        discoverLabelDiv.className = 'label grid__col grid__col--2-of-8';
        var discoverButton = document.createElement('button');
        discoverButton.type = 'button';
        discoverButton.id = 'discoverButton';
        discoverButton.textContent = 'DISCOVER';
        discoverLabelDiv.appendChild(discoverButton);
        this.mainDiv.appendChild(discoverLabelDiv);

        var discoverListDiv = document.createElement('div');
        discoverListDiv.className = 'text grid__col grid__col--6-of-8';
        var discoveryList = document.createElement('ul');
        discoveryList.id = 'discoveryList';
        discoverListDiv.appendChild(discoveryList);
        this.mainDiv.appendChild(discoverListDiv);

        persistButton.onclick = this.persist.bind(this);
        harakiriButton.onclick = this.harakiri.bind(this);
        discoverButton.onclick = this.discover.bind(this);

        // Determine if we're viewing a bridged Controller (e.g., BridgeLink/Controller)
        const delimiter = '/';
        const delimiterIndex = this.callsign.indexOf(delimiter);
        const isCompositController = delimiterIndex !== -1;
        const controllerPrefix = isCompositController ? this.callsign.substring(0, delimiterIndex) : null;

        this.status().then(  data => {
            var plugins = data.plugins ? data.plugins : data;
            this.plugins = plugins; // store it
 
            // Create a mapping from display callsign to original plugin
            // This is needed because we modify callsigns for composite controllers
            this.pluginMap = {};

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
                    // But first, skip any plugins that already have a different prefix
                    if (pluginPrefix !== null && pluginPrefix !== controllerPrefix) {
                        continue;
                    }

                    // If the plugin doesn't have a prefix, we need to add it for operations
                    if (pluginPrefix === null) {
                        callsign = controllerPrefix + delimiter + originalCallsign;
                    }
                } else {
                    // Viewing local Controller
                    // Only show plugins without prefix (local plugins)
                    if (pluginPrefix !== null) {
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
                label.textContent = baseCallsign;
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
                        suspendLabel.textContent = "resume";
                    } else {
                        suspendLabel.textContent = "suspend";
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
        suspendLabel.textContent = nextState;
    }

    // Detect if a plugin is a composite plugin by probing for its controller
    isCompositePlugin(callsign) {
        const compositeController = callsign + '/Controller';
        return this.api.t.call(compositeController, 'status', {})
            .then(response => {
                return true;
            })
            .catch(error => {
                return false;
            });
    }

    close() {
        if (this.controllerListener && typeof this.controllerListener.dispose === 'function') {
            this.controllerListener.dispose();
            this.controllerListener = null;
        }
    }
}

export default Controller;
