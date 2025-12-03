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
        // Restore current plugin from localStorage if available
        this.currentPlugin      = localStorage.getItem('thunderUI_currentPlugin') || null;
        
        // Also set the API prefix to match the restored selection
        if (this.selectedInstance) {
            this.api.setActivePrefix(this.selectedInstance);
        }
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
          <img id="header-logo" src="img/ml.svg" alt="Metrological" onerror="this.src='UI/img/ml.svg'"/>
          <div id="instance-buttons" class="instance-buttons" style="display: none;"></div>
        </div>

        <!--navigation-->
        <div id="menu" class="navigation"></div>
        `;

        this.header = document.getElementById('header');
        this.nav = document.getElementById('menu');
        this.instanceButtonsContainer = document.getElementById('instance-buttons');

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

        // If we have a restored currentPlugin, show it after a short delay
        // (to allow the initial render to complete)
        if (this.currentPlugin) {
            setTimeout(() => {
                if (this.currentPlugin) {
                    showPlugin(this.currentPlugin);
                }
            }, 100);
        }
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

    // Get composite plugin instances from a list of plugins
    // Returns unique instance names (e.g., ["BridgeLink1", "BridgeLink2"])
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

    getAvailableInstances(plugins) {
        // Get composite plugin instances from local plugins
        // Note: Only single-level composite plugins are supported (e.g., BridgeLink1, BridgeLink2).
        // Nested/chained composites (e.g., BridgeLink1/BridgeLink2) are not supported by Thunder.
        // To access a chained instance, connect directly to the intermediate Thunder's UI.
        const instances = this._extractInstancesFromPlugins(plugins);
        
        return instances;
    }
 
    // Switch to a different Thunder instance
    switchInstance(instance) {
        this.selectedInstance = instance;
        
        // Persist selection to localStorage
        if (this.selectedInstance) {
            localStorage.setItem('thunderUI_selectedInstance', this.selectedInstance);
        } else {
            localStorage.removeItem('thunderUI_selectedInstance');
        }
        
        // Update the API prefix to match the selected instance
        this.api.setActivePrefix(this.selectedInstance);

        // If we have a current plugin, try to load the equivalent plugin in the new instance
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
                    localStorage.setItem('thunderUI_currentPlugin', newCallsign);
                    this.render(newCallsign);
                    showPlugin(newCallsign);
                } else {
                    // Plugin doesn't exist in new instance, just render the menu without selecting anything
                    console.debug(`Plugin ${newCallsign} not found in selected instance`);
                    this.currentPlugin = null;
                    localStorage.removeItem('thunderUI_currentPlugin');
                    this.render();
                }
            });
        } else {
            this.render();
        }
        
        // Update button highlighting
        this.updateInstanceButtonHighlight();
    }
    
    // Update which instance button is highlighted
    updateInstanceButtonHighlight() {
        const buttons = this.instanceButtonsContainer.querySelectorAll('.instance-button');
        buttons.forEach(btn => {
            const btnInstance = btn.dataset.instance === '' ? null : btn.dataset.instance;
            if (btnInstance === this.selectedInstance) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Update the instance buttons in the header
    updateInstanceButtons(instances) {
         if (instances.length > 0) {
            // Show the buttons container
            this.instanceButtonsContainer.style.display = 'flex';
            this.instanceButtonsContainer.innerHTML = '';

            // Add "Local" button first
            const localBtn = document.createElement('button');
            localBtn.className = 'instance-button' + (this.selectedInstance === null ? ' active' : '');
            localBtn.textContent = 'Local';
            localBtn.dataset.instance = '';
            localBtn.onclick = () => this.switchInstance(null);
            this.instanceButtonsContainer.appendChild(localBtn);

            // Add buttons for each instance
            instances.forEach(inst => {
                const btn = document.createElement('button');
                btn.className = 'instance-button' + (this.selectedInstance === inst ? ' active' : '');
                btn.textContent = inst;
                btn.dataset.instance = inst;
                btn.onclick = () => this.switchInstance(inst);
                this.instanceButtonsContainer.appendChild(btn);
             });
         } else {
            // Hide the buttons if no linked instances
            this.instanceButtonsContainer.style.display = 'none';
         }
     }
 
    render(activePlugin) {
        // Determine which controller to query based on selected instance
        let statusPromise;
        if (this.selectedInstance === null) {
            // Query local controller
            statusPromise = this.api.getControllerPlugins();
        } else {
            // Query the composite controller for the selected instance
            const delimiter = '/';
            const compositeController = this.selectedInstance + delimiter + 'Controller';
             
              // Use skipPrefix since we're querying with an absolute path
              statusPromise = this.api.req(null, {
                   plugin: compositeController,
                   method: 'status'
              }, { skipPrefix: true }).catch(err => {
                   console.warn('Failed to query composite controller:', compositeController, err);
                   // Fall back to local controller
                   this.selectedInstance = null;
                   localStorage.removeItem('thunderUI_selectedInstance');
                   return this.api.getControllerPlugins();
              }).then(response => {
                  if (this.selectedInstance === null) {
                      return response;
                  }
                   const plugins = response.plugins || response;
                  // Add the instance prefix to each plugin's callsign
                  return plugins.map(p => ({...p, callsign: this.selectedInstance + '/' + p.callsign}));
               });
           }
 
          statusPromise.then( _plugins => {
               this.clear();
              const enabledPlugins = Object.keys(this.plugins);
  
              // Detect available instances and update selector - always use local controller
              // to discover instances, regardless of which instance is currently selected
              this.api.getControllerPlugins().then(localPlugins => {
                  const availableInstances = this.getAvailableInstances(localPlugins);
                  this.updateInstanceButtons(availableInstances);
                  // Set up listeners for composite controllers
                  this.setupCompositeControllerListeners();
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

        // Persist to localStorage so it survives page reloads
        localStorage.setItem('thunderUI_currentPlugin', callsign);

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
