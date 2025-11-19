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

// ...existing code...

class Menu {
    constructor(plugins, api) {
        this.api                = api;
        this.plugins            = plugins;
        this.top                = document.getElementById('top');
        this.renderInMenu       = false;
        this.selectedInstance   = null;
        this.currentPlugin      = null; // Track current plugin

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

        this.api.t.on('Controller', 'all', _notification => {
            if (_notification.data && _notification.data.state) {
                // Only re-render if BridgeLink or similar composit plugin was activated/deactivated
                // This updates the instance selector when bridged instances appear/disappear
                const callsign = _notification.data.callsign;
                if (callsign && this.isBridgeLinkPlugin(callsign)) {
                    // Re-render to update the instance selector
                    this.render(this.currentPlugin);
                }
                // Don't re-render for regular plugin state changes - let the plugin pages handle that
            }
        });
    }

    // Helper to check if a plugin is a BridgeLink-type plugin (composit plugin)
    isBridgeLinkPlugin(callsign) {
        // Check if this is a plugin that creates composit plugins
        // You can expand this list if there are other similar plugins
        return callsign === 'BridgeLink' || 
               callsign.startsWith('BridgeLink') ||
               callsign === 'WebBridge'; // Add other composit plugin names if needed
    }

    clear() {
        // Clear only the menu items, not the instance selector
        const ul = this.nav.querySelector('ul');
        if (ul) {
            ul.remove();
        }
    }

    // Extract available Thunder instances from plugin list
    getAvailableInstances(plugins) {
        const instances = new Set();
        const delimiter = '/';

        for (let i = 0; i < plugins.length; i++) {
            const callsign = plugins[i].callsign;
            const delimiterIndex = callsign.indexOf(delimiter);
            
            if (delimiterIndex !== -1) {
                // Extract the prefix (e.g., "BridgeLink", "BridgeLink1")
                const prefix = callsign.substring(0, delimiterIndex);
                instances.add(prefix);
            }
        }

        return Array.from(instances).sort();
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
                this.instanceDropdown.value = '';
            }
        } else {
            // Hide the selector if no linked instances
            this.instanceSelector.style.display = 'none';
        }
    }

    render(activePlugin) {
        this.api.getControllerPlugins().then( _plugins => {
            this.clear();
            const enabledPlugins = Object.keys(this.plugins);
            
            // Detect available instances and update selector
            const availableInstances = this.getAvailableInstances(_plugins);
            this.updateInstanceSelector(availableInstances);
            
            let ul = document.createElement('ul');

            for (let i = 0; i<_plugins.length; i++) {
                const plugin = _plugins[i];
                const callsign = plugin.callsign;

                // Extract base callsign (remove BridgeLink/ or any other prefix)
                const delimiter = '/';
                const delimiterIndex = callsign.indexOf(delimiter);
                const baseCallsign = delimiterIndex !== -1 ? callsign.substring(delimiterIndex + 1) : callsign;
                const prefix = delimiterIndex !== -1 ? callsign.substring(0, delimiterIndex) : null;
                
                // Filter based on selected instance
                if (this.selectedInstance === null) {
                    // Show only local plugins (no prefix)
                    if (prefix !== null)
                        continue;
                } else {
                    // Show only plugins from selected instance
                    if (prefix !== this.selectedInstance)
                        continue;
                }
                
                // check if plugin is available in our loaded plugins (using base callsign)
                if (enabledPlugins.indexOf(baseCallsign) === -1)
                    continue;

                const loadedPlugin = this.plugins[ baseCallsign ];
                if (plugin.state !== 'Deactivated' && loadedPlugin.renderInMenu === true) {
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
                    li.onclick = this.toggleMenuItem.bind(this, callsign);  // FIX: Changed from bind(null, ...) to bind(this, ...)
                    ul.appendChild(li);
                    this.nav.appendChild(ul);
                }
            }
        });
    }

    update() {
        // just re-render for now
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
