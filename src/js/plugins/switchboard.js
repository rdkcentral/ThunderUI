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
/** The switchboard plugin allows the device to switch between different processes from the Framework
 */

import Plugin from '../core/plugin.js';

class SwitchBoard extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
        this.renderInMenu = true;

        // get switchboard configuration
        this.switchablePlugins = [];
        this.switches().then( resp => {
            this.switchablePlugins = resp;
        });

        this.defaultPlugin = undefined;
        this.default().then( resp => {
            this.defaultPlugin = resp;
        });
    }

    switches() {
        const _rpc = {
            plugin : 'SwitchBoard',
            method : 'switches'
        };

        return this.api.req(null, _rpc);
    }

    default() {
        const _rpc = {
            plugin : 'SwitchBoard',
            method : 'default'
        };

        return this.api.req(null, _rpc);
    }

    getDefaultSwitchBoardPlugin () {
        return this.defaultPlugin;
    }

    getSwitchablePlugins() {
        return this.switchablePlugins;
    }

    render() {
        this.mainDiv = document.getElementById('main');
        this.mainDiv.innerHTML = `
        <div class="title grid__col grid__col--8-of-8">
            Plugins
        </div>
        <div id="switchBoardPlugins"></div>`;

        var switchBoardPluginDiv = document.getElementById('switchBoardPlugins');

        this.api.getControllerPlugins().then( data => {
            var plugins = data;
            var switchIdx = 0;

            for (var i=0; i < plugins.length; i++) {
                var plugin = plugins[i];
                var callsign = plugin.callsign;

                if (this.switchablePlugins.indexOf(callsign) === -1)
                    continue;

                var labelDiv = document.createElement("div");
                labelDiv.className = "label grid__col grid__col--2-of-8";
                switchBoardPluginDiv.appendChild(labelDiv);

                var label = document.createElement("label");
                label.innerHTML = callsign;

                if (callsign === this.defaultPlugin)
                    label.innerHTML += ' (default)';

                label.setAttribute("for", callsign);
                labelDiv.appendChild(label);

                var div = document.createElement("div");
                div.className = "grid__col grid__col--6-of-8 ";
                div.id =  callsign + "MainDiv";
                switchBoardPluginDiv.appendChild(div);

                var checkboxDiv = document.createElement("div");
                checkboxDiv.className = "checkbox";
                div.appendChild(checkboxDiv);

                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = callsign;

                checkbox.setAttribute("disabled", "true");
                checkboxDiv.appendChild(checkbox);

                var checkboxLabel = document.createElement("label");
                checkboxLabel.setAttribute("for", callsign);
                checkboxDiv.appendChild(checkboxLabel);

                if (plugin.state == "Activated" || plugin.state == "Resumed" || plugin.state == "Suspended") {
                    checkbox.checked = true;
                }

                // add switch button
                if (plugin.state !== 'Resumed') {
                    var switchDiv = document.createElement('div');
                    switchDiv.id = callsign + 'switchdiv';
                    switchDiv.className = 'suspend'; // reusing suspend look & feel
                    var switchCheckBox = document.createElement("input");
                    switchCheckBox.type = "checkbox";
                    switchCheckBox.id = callsign + 'switch';

                    if (plugin.state == "Activated" || plugin.state == "Resumed") {
                        switchCheckBox.checked = true;
                    }

                    switchCheckBox.onclick = this.switchPlugin.bind(this, callsign);
                    switchDiv.appendChild(switchCheckBox);

                    var switchLabel = document.createElement("label");
                    switchLabel.setAttribute("for", callsign + "switch");
                    switchLabel.id = callsign + "switchlabel";
                    switchLabel.innerHTML = "switch";

                    switchDiv.appendChild(switchLabel);
                    div.appendChild(switchDiv);
                }
            }
        });
    }

    switchPlugin(plugin) {
        var body = {
            "callsign" : plugin
        };

        const _rpc = {
            plugin : 'SwitchBoard',
            method : 'activate',
            params : body
        };

        this.api.req(null, _rpc).then( () => {
            this.render();
        });
    }
}

export default SwitchBoard;
