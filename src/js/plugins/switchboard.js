/** The switchboard plugin allows the device to switch between different processes from the Framework
 */

import Plugin from '../core/plugin.js';

class SwitchBoard extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        //this.renderInMenu = false;
        this.defaultPlugin = undefined;
        this.switchablePlugins = [];

        // get switchboard configuration
        this.state().then( resp => {
            this.defaultPlugin = resp.default;
            this.switchablePlugins = resp.callsigns;
        });
    }

    state() {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/Switch`
        };

        //FIXME does not have a jsonrpc interface
        return this.api.req(_rest);
    }

    getDefaultSwitchBoardPlugin () {
        return this.defaultPlugin;
    }

    getSwitchablePlugins() {
        return this.switchBoardPlugins;
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
            var plugins = data.plugins;
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

                if (plugin.state == "activated" || plugin.state == "resumed" || plugin.state == "suspended") {
                    checkbox.checked = true;
                }

                // add switch button
                if (plugin.state !== 'resumed') {
                    var switchDiv = document.createElement('div');
                    switchDiv.id = callsign + 'switchdiv';
                    switchDiv.className = 'suspend'; // reusing suspend look & feel
                    var switchCheckBox = document.createElement("input");
                    switchCheckBox.type = "checkbox";
                    switchCheckBox.id = callsign + 'switch';

                    if (plugin.state == "activated" || plugin.state == "resumed") {
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
        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}/Switch/${plugin}`
        };

        this.api.req(_rest).then( () => {
            this.render();
        });
    }
}

export default SwitchBoard;
