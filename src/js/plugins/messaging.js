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
/** The messaging plugin controls the messaging values for debugging output and allows to display the messages
 */

import Plugin from '../core/plugin.js';

class MessageControl extends Plugin {

    constructor(pluginData, api)
    {
        super(pluginData, api);
        this.displayName        = 'Messaging';

        this.modules            = undefined;
        this.selectedModule     = undefined;
        this.controls           = undefined;

        this.socketUrl          = `ws://${api.host[0]}:${api.host[1]}/Service/MessageControl`;
        this.messagingSocket    = undefined;
    }

    close()
    {
        this._closeSocket();
        super.close()
    }

    enableControl(module, id, enabled)
    {
       var body = {
            "type"      :   module === 'SysLog'             ? 'Logging'
                        :  (module === 'Reporting'          ? 'Reporting'
                        :  (module === 'OperationalStream'  ? 'OperationalStream'
                        :  (module === 'Assert'             ? 'Assert'
                        :   'Tracing'))),
            "module"    :   module,
            "category"  :   id,
            "enabled"   :   enabled
        };

        const _rpc = {
            plugin : 'MessageControl',
            method : 'enable',
            params : body
        };

        return this.api.req(null, _rpc);
    }

    retrieveModules()
    {
        const _rpc = {
            plugin : 'MessageControl',
            method : 'modules'
        };

        return this.api.req(null, _rpc);
    }

    retrieveCategories(module)
    {
        const _rpc = {
            plugin : 'MessageControl',
            method : 'controls@' + module
        };

        return this.api.req(null, _rpc);
    }

    render()
    {
        this._openSocket();

        var self = this;
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML =
        `<div class="title grid__col grid__col--8-of-8">
            Modules
        </div>

        <div class="label grid__col grid__col--2-of-8">
            <label for="modules">Modules</label>
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="messagingModules"></select>
        </div>

        <div id="messaging_div"></div>

        <div class="grid__col grid__col--7-of-8" id="messagesTableContainer">
        <table id="messagesTable" CELLSPACING=0>
            <thead id="messagesDataHeader">
                <col width="10px" />
                <col width="45px" />
                <col width="30px" />
                <col width="200px" />
                <col width="100px" />
                <tr>
                    <th>time</th>
                    <th>module</th>
                    <th>category</th>
                    <th>message</th>
                    <th>additional information</th>
                </tr>
            </div>
            <tbody id="messagesData">
            </tbody>
        </table>
        </div>
        </div>`;

        document.getElementById('messagingModules').onchange = this.getSelectedModuleAndShowCategories.bind(this);

        this.retrieveModules().then( response => {
            self.modules = response;
            self.modules.sort();
            var modulesSelectElement = document.getElementById('messagingModules');

            // clear out the select element
            modulesSelectElement.options.length = 0;

            if (self.modules !== undefined) {
                for (var i = 0; i < self.modules.length; i++) {
                    var newOptionElement = document.createElement('option');
                    newOptionElement.innerHTML = self.modules[i];

                    if (self.modules[i] === self.selectedModule) {
                        newOptionElement.selected = true;
                    }
                    modulesSelectElement.appendChild(newOptionElement);
                }
                if (self.selectedModule === undefined) {
                    self.selectedModule = self.modules[0];
                }
                self.showCategories(self.selectedModule);
            }
        });
    }

    getSelectedModuleAndShowCategories()
    {
        var selector = document.getElementById('messagingModules');
        var selectedModule = this.modules[ selector.selectedIndex ];
        this.showCategories(selectedModule);
    }

    showCategories(module)
    {
        this.retrieveCategories(module).then( response => {
            this.controls = response;
            this.controls.sort((a, b) => (a.category < b.category) ? -1 : (a.category > b.category) ? 1 : 0);

            var messagingDiv = document.getElementById("messaging_div");
            messagingDiv.innerHTML = '';

            if (this.controls.length === 0) {
                return;
            }

            // update the state of the module we selected for the messaging menu redraw
            this.selectedModule = module;

            for (var i = 0; i < this.controls.length; i++) {
                var control = this.controls[i];

                var labelDiv = document.createElement("div");
                labelDiv.className = "label grid__col grid__col--2-of-8";
                messagingDiv.appendChild(labelDiv);

                var label =  document.createElement("label");
                label.innerHTML = control.category;
                label.setAttribute("for", control.category);
                labelDiv.appendChild(label);

                var div = document.createElement("div");
                div.className = "grid__col grid__col--6-of-8";
                messagingDiv.appendChild(div);

                var checkboxDiv = document.createElement("div");
                checkboxDiv.className = "checkbox";
                div.appendChild(checkboxDiv);

                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = control.category;
                checkbox.checked = (control.enabled !== undefined) && control.enabled;
                checkbox.onclick = this.toggleControl.bind(this, control);
                checkboxDiv.appendChild(checkbox);

                var checkboxLabel = document.createElement("label");
                checkboxLabel.setAttribute("for", control.category);
                checkboxDiv.appendChild(checkboxLabel);
            }
        });
    }

    toggleControl(control)
    {
        control.enabled = !control.enabled;
        this.enableControl(control.module, control.category, control.enabled);
    }

    escapeHtml(unsafe)
    {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    _socketMessage(data)
    {
        const msg = JSON.parse(data.data);
        const date = new Date(msg.time);
        const tr = document.createElement('tr');

        const time = document.createElement('td');
        time.innerHTML = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        tr.appendChild(time);

        const module = document.createElement('td');
        module.innerHTML = msg.module;
        tr.appendChild(module);

        const category = document.createElement('td');
        category.innerHTML = msg.category;
        tr.appendChild(category);

        var Convert = require('ansi-to-html');
        var convert = new Convert();
        const incomingMsg = document.createElement('td');
        incomingMsg.innerHTML = convert.toHtml(msg.message);
        tr.appendChild(incomingMsg);

        const file = document.createElement('td');
        if (msg.classname !== undefined && msg.filename !== undefined && msg.linenumber !== undefined) {
            const properClassName = this.escapeHtml(msg.classname);
            file.innerHTML = `${msg.filename}:${msg.linenumber}::${properClassName}`;
        }
        else if (msg.processid !== undefined && msg.processname !== undefined && msg.filename !== undefined && msg.linenumber !== undefined) {
            file.innerHTML = `[${msg.processid}]${msg.processname}::${msg.filename}:${msg.linenumber}`;
        }
        else if (msg.callsign !== undefined) {
            file.innerHTML = `${msg.callsign}`;
        }
        else {
            file.innerHTML = '';
        }
        tr.appendChild(file);

        document.getElementById('messagesData').appendChild(tr);
        const objDiv = document.getElementById("messagesTableContainer");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    _openSocket()
    {
        this._closeSocket();
        this.messagingSocket = new WebSocket(this.socketUrl, 'json');
        this.messagingSocket.onmessage = this._socketMessage.bind(this);
    }

    _closeSocket()
    {
        if (this.messagingSocket) {
            this.messagingSocket.close();
            this.messagingSocket = undefined;
        }
    }
}

export default MessageControl;
