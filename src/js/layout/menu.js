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
/** The side navigation menu provides navigation across the different plugins */
import { showPlugin } from '../core/application.js';

class Menu {
    constructor(plugins, api) {
        this.api                = api;
        this.plugins            = plugins;
        this.top                = document.getElementById('top');
        this.renderInMenu       = false;
        // Restore selected instance from localStorage if available
        this.selectedInstance   = localStorage.getItem('thunderUI_selectedInstance') || null;
        
        // Also set the API prefix to match the restored selection
        if (this.selectedInstance) {
            this.api.setActivePrefix(this.selectedInstance);
        }
        this.currentPlugin      = null; // Track current plugin
        this.compositeControllerListeners = new Map(); // Track composite controller listeners
        this.renderTimeout      = null; // Track pending render timeout
        this.pluginStateCache   = new Map();

        // Expose menu instance globally for manual updates
        window.menu = this;

        var bodyEl = document.getElementsByTagName('body')[0];

        try {
            document.createEvent('TouchEvent');
            this.nav.style.left = '-600px';
            bodyEl.classList.remove('desktop');
            bodyEl.className = 'touch';
            this.isTouchDevice = true;
        } catch(e) {}

        // add the top header + logo + keyboard hooks
        this.top.innerHTML = `<div id="header" class="header">
          <div id="button-left" class="fa fa-bars left"></div>
        </div>

        <!--navigation-->
        <div id="menu" class="navigation">
          <!--instance selector (hidden by default, shown when multiple instances detected)-->
          <div id="instance-selector" class="instance-selector" style="display: none;">
            <select id="instance-dropdown">
              <option value="">Local Thunder</option>
            </select>
          </div>
        </div>
        `;

        this.header = document.getElementById('header');
        this.nav = document.getElementById('menu');
        this.instanceSelector = document.getElementById('instance-selector');
        this.instanceDropdown = document.getElementById('instance-dropdown');

        // Hook up the instance selector change event
        this.instanceDropdown.onchange = (e) => {
            this.selectedInstance = e.target.value || null;
            
            // Persist selection to localStorage
            if (this.selectedInstance) {
                localStorage.setItem('thunderUI_selectedInstance', this.selectedInstance);
            } else {
                localStorage.removeItem('thunderUI_selectedInstance');
            }
            
            // Update the API prefix to match the selected instance
            this.api.setActivePrefix(this.selectedInstance);

            // If we're switching instances and have a current plugin, try to load the equivalent plugin
            if (this.currentPlugin) {
                const delimiter = '/';
                const currentDelimiterIndex = this.currentPlugin.indexOf(delimiter);
                const baseCallsign = currentDelimiterIndex !== -1 ? 
                    this.currentPlugin.substring(currentDelimiterIndex + 1) : 
                    this.currentPlugin;

                // Build the new callsign for the selected instance
                let newCallsign;
                if (this.selectedInstance === null) {
                    // Switching to local Thunder
                    newCallsign = baseCallsign;
                } else {
                    // Switching to a BridgeLink instance
                    newCallsign = this.selectedInstance + delimiter + baseCallsign;
                }

                // Check if the equivalent plugin exists in the new instance
                this.api.getControllerPlugins().then(_plugins => {
                    const pluginExists = _plugins.some(p => p.callsign === newCallsign && p.state !== 'Deactivated');

                    if (pluginExists) {
                        // Update current plugin and render with it active
                        this.currentPlugin = newCallsign;
                        this.render(newCallsign);
                        showPlugin(newCallsign);
                    } else {
                        // Plugin doesn't exist in new instance, just render the menu without selecting anything
                        console.debug(`Plugin ${newCallsign} not found in selected instance`);
                        this.currentPlugin = null;
                        this.render();
                    }
                });
            } else {
                this.render();
            }
        };

        // for some reason WPE Framework stores everything under /UI/ and relative paths dont work :( so heres a workaround
        var logoLoadError = false;
        var logo = new Image();
        logo.alt = 'Metrological';
        logo.onload = () => {
            this.header.appendChild(logo);
        };

        logo.onerror= () => {
            if (logoLoadError === true)
                return;

            logo.src='UI/img/ml.svg';
            logoLoadError = true;
        };

        logo.src='img/ml.svg';

        // hooks
        document.getElementById('button-left').onclick = this.showMenu.bind(this);

        window.onresize = function () {
            if (this.isTouchDevice === true)
                return;

            var menu = document.getElementById('menu');
            if (window.innerWidth > 960) {
                menu.style.left = '0px';
            } else {
                menu.style.left = '-600px';
            }
        };

        // Listen for state change events on Controller
        this.api.t.on('Controller', 'statechange', _notification => {
            const callsign = _notification.callsign;
            const state = _notification.params ? _notification.params.state : undefined;

            if (callsign && state) {
                // Update the state cache immediately
                const normalizedState = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
                this.pluginStateCache.set(callsign, normalizedState);
                
                // Re-render to update the menu
                if (this.renderTimeout) {
                    clearTimeout(this.renderTimeout);
                }
                this.renderTimeout = setTimeout(() => {
                    this.renderTimeout = null;
                    this.render(this.currentPlugin);
                }, 100);
            }
        });

        // Setup listeners for composite controllers
        this.setupCompositeControllerListeners();
    }

    setupCompositeControllerListeners() {
        // Get the list of plugins to detect composite controllers
        this.api.getControllerPlugins().then(plugins => {
            const delimiter = '/';
            const compositeControllers = new Set();

            // Find all composite controllers
            plugins.forEach(plugin => {
                const callsign = plugin.callsign;
                const delimiterIndex = callsign.indexOf(delimiter);

                if (delimiterIndex !== -1) {
                    // This is a composite plugin (e.g., BridgeLink/Monitor)
                    const prefix = callsign.substring(0, delimiterIndex);
                    const compositeController = prefix + delimiter + 'Controller';
                    compositeControllers.add(compositeController);
                }
            });

            // Subscribe to state changes from each composite controller
            compositeControllers.forEach(controllerCallsign => {
                if (this.compositeControllerListeners.has(controllerCallsign))
                    return;

                // Subscribe to the composite controller's state changes
                const listener = this.api.t.on(controllerCallsign, 'statechange', (_notification) => {
                    const callsign = _notification.callsign;
                    const state = _notification.state || (_notification.params ? _notification.params.state : undefined);

                    if (!callsign || !state)
                        return;

                    // Build full composite callsign and update cache
                    const delimiter = '/';
                    const prefix = controllerCallsign.substring(0, controllerCallsign.lastIndexOf(delimiter));
                    const fullCallsign = prefix + delimiter + callsign;

                    // Normalize state and update cache
                    const normalizedState = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
                    this.pluginStateCache.set(fullCallsign, normalizedState);

                    // Re-render to update plugin states
                    if (this.renderTimeout) {
                        clearTimeout(this.renderTimeout);
                    }
                    this.renderTimeout = setTimeout(() => {
                        this.renderTimeout = null;
                        this.render(this.currentPlugin);
                    }, 100);
                });

                this.compositeControllerListeners.set(controllerCallsign, listener);
            });
        });
    }

    clear() {
        // Clear only the menu items, not the instance selector
        const ul = this.nav.querySelector('ul');
        if (ul) {
            ul.remove();
        }
    }

    // Get instances from a list of plugins, with optional prefix for nested composites
    _extractInstancesFromPlugins(plugins, prefix = '') {
        const instances = [];
        const delimiter = '/';
        
        for (const plugin of plugins) {
            const callsign = plugin.callsign;
            const delimiterIndex = callsign.indexOf(delimiter);
            // Found a composite plugin indicator (e.g., has Controller in it)
            if (delimiterIndex !== -1) {
                const instanceName = callsign.substring(0, delimiterIndex);
                const fullPath = prefix ? prefix + delimiter + instanceName : instanceName;
                if (!instances.includes(fullPath)) {
                    instances.push(fullPath);
                }
            }
        }
        return instances;
    }

    // Recursively discover nested composite plugins
    async _discoverNestedInstances(instance, discoveredInstances) {
        const delimiter = '/';
        const compositeController = instance + delimiter + 'Controller';
        
        try {
            const response = await this.api.req(null, {
                plugin: compositeController,
                method: 'status'
            });
            
            const plugins = response.plugins || response;
            const nestedInstances = this._extractInstancesFromPlugins(plugins, instance);
            
            for (const nested of nestedInstances) {
                if (!discoveredInstances.includes(nested)) {
                    discoveredInstances.push(nested);
                    // Recursively check for deeper nesting
                    await this._discoverNestedInstances(nested, discoveredInstances);
                }
            }
        } catch (e) {
            // Composite controller doesn't exist or isn't accessible
            console.debug('Could not query nested composite:', compositeController, e);
         }
    }

    async getAvailableInstances(plugins) {
        // First get top-level instances from local plugins
        const instances = this._extractInstancesFromPlugins(plugins);
        
        // Then recursively discover nested instances
        for (const instance of [...instances]) {
            await this._discoverNestedInstances(instance, instances);
        }
        
        return instances;
     }

    // Update the instance selector dropdown
    updateInstanceSelector(instances) {
        if (instances.length > 0) {
            // Show the selector
            this.instanceSelector.style.display = 'block';

            // Update dropdown options (keep "Local Thunder" as first option)
            const currentValue = this.instanceDropdown.value;
            this.instanceDropdown.innerHTML = '<option value="">Local Thunder</option>';

            instances.forEach(instance => {
                const option = document.createElement('option');
                option.value = instance;
                option.textContent = instance;
                this.instanceDropdown.appendChild(option);
            });

            // Restore previous selection if it still exists
            if (currentValue && instances.indexOf(currentValue) !== -1) {
                this.instanceDropdown.value = currentValue;
            } else if (currentValue && currentValue !== '') {
                // Previously selected instance no longer exists, reset to local
                this.selectedInstance = null;
                localStorage.removeItem('thunderUI_selectedInstance');
                this.instanceDropdown.value = '';
            }
            
            // Sync the dropdown with the stored selectedInstance (for page reload)
            if (this.selectedInstance && instances.includes(this.selectedInstance)) {
                this.instanceDropdown.value = this.selectedInstance;
            }
        } else {
            // Hide the selector if no linked instances
            this.instanceSelector.style.display = 'none';
        }
    }

    render(activePlugin) {
        // Determine which controller to query based on selected instance
        console.log('Menu.render() - selectedInstance:', this.selectedInstance);
        let statusPromise;
        if (this.selectedInstance === null) {
            // Query local controller
            statusPromise = this.api.getControllerPlugins();
        } else {
            // For nested instances like BridgeLink1/BridgeLink2, we need to query the parent controller
            // (BridgeLink1/Controller) because nested composite controllers aren't directly accessible
            const delimiter = '/';
            const parts = this.selectedInstance.split(delimiter);
            let compositeController;
            
            if (parts.length > 1) {
                // Nested instance: query parent controller (e.g., BridgeLink1/Controller for BridgeLink1/BridgeLink2)
                compositeController = parts[0] + delimiter + 'Controller';
            } else {
                // Top-level instance: query its controller directly
                compositeController = this.selectedInstance + delimiter + 'Controller';
            }
            
             statusPromise = this.api.req(null, {
                 plugin: compositeController,
                 method: 'status'
             }).catch(err => {
                 console.warn('Failed to query composite controller:', compositeController, err);
                 // Fall back to local controller
                 this.selectedInstance = null;
                 localStorage.removeItem('thunderUI_selectedInstance');
                 return this.api.getControllerPlugins();
             }).then(response => {
                 console.log('Menu.render() - response from', compositeController, ':', response);
                 if (this.selectedInstance === null) {
                     console.log('Menu.render() - fell back to local');
                     return response;
                 }
                  const plugins = response.plugins || response;
                  console.log('Menu.render() - plugins before mapping:', plugins.map(p => p.callsign));
                 
                 // For nested instances, filter and remap the plugins
                 let mapped;
                 if (parts.length > 1) {
                     // Nested instance: filter for plugins starting with the nested part (e.g., BridgeLink2/)
                     const nestedPrefix = parts.slice(1).join(delimiter); // e.g., "BridgeLink2"
                     const filteredPlugins = plugins.filter(p => {
                         const callsign = p.callsign;
                         return callsign.startsWith(nestedPrefix + delimiter) || callsign === nestedPrefix;
                     });
                     // Remap with full prefix
                     mapped = filteredPlugins.map(p => ({
                         ...p, 
                         callsign: parts[0] + delimiter + p.callsign
                     }));
                 } else {
                     // Top-level instance: add the instance prefix to each plugin's callsign
                     mapped = plugins.map(p => ({...p, callsign: this.selectedInstance + '/' + p.callsign}));
                 }
                 
                  console.log('Menu.render() - plugins after mapping:', mapped.map(p => p.callsign));
                  return mapped;
              });
          }

         statusPromise.then( _plugins => {
             console.log('Menu.render() - final _plugins:', _plugins.map(p => p.callsign));
              this.clear();
             const enabledPlugins = Object.keys(this.plugins);
 
             // Detect available instances and update selector - always use local controller
             // to discover instances, regardless of which instance is currently selected
             this.api.getControllerPlugins().then(localPlugins => {
                 this.getAvailableInstances(localPlugins).then(availableInstances => {
                     this.updateInstanceSelector(availableInstances);
                     // Set up listeners for composite controllers
                     this.setupCompositeControllerListeners();
                 });
             });
 
             let ul = document.createElement('ul');
 
             for (let i = 0; i<_plugins.length; i++) {
                 const plugin = _plugins[i];
                 const callsign = plugin.callsign;
 
                 // Extract base callsign (remove BridgeLink/ or any other prefix)
                 const delimiter = '/';
                 const lastDelimiterIndex = callsign.lastIndexOf(delimiter);
                 const baseCallsign = lastDelimiterIndex !== -1 ? callsign.substring(lastDelimiterIndex + 1) : callsign;
                 const prefix = lastDelimiterIndex !== -1 ? callsign.substring(0, lastDelimiterIndex) : null;
 
                 // Use cached state if available, otherwise fall back to API state
                 const actualState = this.pluginStateCache.has(callsign) ?
                     this.pluginStateCache.get(callsign) :
                     plugin.state;
 
                 // Filter based on selected instance
                 if (this.selectedInstance === null) {
                     // Show only local plugins (no prefix)
                     if (prefix !== null)
                         continue;
                 } else {
                     // Show only plugins from selected instance (prefix should match)
                     // For nested instances like BridgeLink1/BridgeLink2, we prepended the prefix above
                     if (prefix !== this.selectedInstance)
                         continue;
                 }
 
                // check if plugin is available in our loaded plugins (using base callsign)
                if (enabledPlugins.indexOf(baseCallsign) === -1)
                    continue;
 
                const loadedPlugin = this.plugins[ baseCallsign ];
 
                // Use actualState instead of plugin.state
                if (actualState.toLowerCase() !== 'deactivated' && loadedPlugin.renderInMenu === true) {
                    console.debug('Menu :: rendering ' + callsign);
                    var li = document.createElement('li');
                    li.id = "item_" + callsign;
 
                    if (activePlugin === undefined && i === 0) {
                        li.className = 'menu-item active';
                    } else if (activePlugin === callsign) {
                        li.className = 'menu-item active';
                    } else {
                        li.className = 'menu-item';
                    }
 
                    // Use the display name without prefix since we're already filtering by instance
                    const displayName = loadedPlugin.displayName !== undefined ? 
                        loadedPlugin.displayName : 
                        baseCallsign;
 
                    li.appendChild(document.createTextNode(displayName));
                    li.onclick = this.toggleMenuItem.bind(this, callsign);
                    ul.appendChild(li);
                    this.nav.appendChild(ul);
                }
            }
        });
    }

    update() {
        this.render(this.currentPlugin);
    }

    toggleMenuItem(callsign) {
        // Store the current plugin
        this.currentPlugin = callsign;

        var items = document.getElementsByClassName('menu-item');
        for (var i = 0; i < items.length; i++) {
            if ('item_' + callsign === items[i].id) {
                items[i].className = 'menu-item active';
            } else {
                items[i].className = 'menu-item';
            }
        }

        showPlugin(callsign);
    }

    showMenu() {
        var menu = document.getElementById('menu');

        if (menu.style.left === '0px') {
            menu.style.left = '-600px';
        } else {
            menu.style.left = '0px';
        }
    }
}

export default Menu;
