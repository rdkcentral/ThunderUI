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

        // find plugin
        for (var i=0; i<this.plugins.length; i++) {
            if (this.plugins[i].callsign === callsign) {
                plugin = this.plugins[i];
                break;
            }
        }

        if (plugin.state === 'Deactivated') {
            console.debug('Activating ' + callsign);
            this.activate(callsign).then( (resp) => {
                if (this.plugins[ callsign ] !== undefined)
                    this.plugins[ callsign ].state = 'Activated';

                plugin.state = 'Activated';
            }).catch( e => {
                this.render();
            });
        } else {
            console.debug('Deactivating ' + callsign);
            this.deactivate(callsign).then( (resp) => {
                if (this.plugins[ callsign ] !== undefined)
                    this.plugins[ callsign ].state = 'Deactivated';

                plugin.state = 'Deactivated';
            }).catch(e => {
                this.render();
            });
        }
    }

    toggleSuspend(callsign) {
        var plugin;

        // find plugin
        for (var i=0; i<this.plugins.length; i++) {
            if (this.plugins[i].callsign === callsign) {
                plugin = this.plugins[i];
                break;
            }
        }

        if (plugin.state === 'Deactivated') {
            console.debug('Activating ' + callsign);
            this.activate(callsign).then( resp => {
                if (this.plugins[ callsign ] !== undefined)
                    this.plugins[ callsign ].state = 'Activated';

                // we have to rerender at this stage, we're going to be out of sync
                if (document.getElementById(callsign + 'suspend').checked === false)
                    this.resume(callsign).then( this.render.bind(this) );
                else
                    api.suspendPlugin(callsign).then( this.render.bind(this));
            });

            return;
        }

        if (plugin.state === 'Resumed') {
            console.debug('Suspending ' + callsign);
            this.suspend(callsign).then( resp => {
                this.updateSuspendLabel(callsign, 'resume');

                if (this.plugins[ callsign ] !== undefined)
                    this.plugins[ callsign ].state = 'Resumed';

                document.getElementById(callsign + 'suspend').checked = true;
                plugin.state = 'Suspended';
            });
        } else {
            console.debug('Resuming ' + callsign);
            this.resume(callsign).then( resp => {
                this.updateSuspendLabel(callsign, 'suspend');

                if (this.plugins[ callsign ] !== undefined)
                    this.plugins[ callsign ].state = 'Suspended';

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

        this.status().then(  data => {
            var plugins = data.plugins ? data.plugins : data;
            this.plugins = plugins; // store it

            for (var i=0; i < plugins.length; i++) {
                var plugin = plugins[i];
                var callsign = plugin.callsign;
                var controlAllowed = true;

                if (callsign === 'Controller')
                    continue;

                var labelDiv = document.createElement("div");
                labelDiv.className = "label grid__col grid__col--2-of-8";
                controllerPluginsDiv.appendChild(labelDiv);

                var label = document.createElement("label");
                label.innerHTML = callsign;
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
