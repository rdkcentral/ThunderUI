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
/** The tracing plugin controls the trace values for debugging output on the stdout
 */

import Plugin from '../core/plugin.js';

class MessageControl extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
        this.displayName = 'Messaging';

        this.selectedTraceModule    = undefined;
        this.traceModules           = undefined;
        this.uniqueTraceModules     = undefined;
        this.socketUrl              = `ws://${api.host[0]}:${api.host[1]}/Service/MessageControl`;
        this.traceSocket            = undefined;
    }


    close(){
        this._closeSocket();
        super.close()
    }

    toggleTracing(module, id, enabled) {
       var body = {
            "type":  module === 'SysLog'            ? 'Logging'
                  : (module === 'Reporting'         ? 'Reporting'
                  : (module === 'OperationalStream' ? 'OperationalStream'
                  : 'Tracing')),
            "module": module,
            "category": id,
            "enabled": enabled
        };

        const _rpc = {
            plugin : 'MessageControl',
            method : 'enable',
            params : body
        };

        return this.api.req(null, _rpc);
    }

    retrieveControls() {
        const _rpc = {
            plugin : 'MessageControl',
            method : 'controls'
        };

        return this.api.req(null, _rpc);
    }

    render() {
        this._openSocket();

        var self = this;
        var mainDiv = document.getElementById('main');


        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Modules
        </div>

        <div class="label grid__col grid__col--2-of-8">
            <label for="modules">Modules</label>
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="tracingModules"></select>
        </div>

        <div id="tracing_div"></div>


        <div class="grid__col grid__col--7-of-8" id="traceTableContainer">
        <table id="traceTable" CELLSPACING=0>
            <thead id="traceDataHeader">
                <tr>
                    <td>time</td>
                    <td>file:class:line / callsign</td>
                    <td>module</td>
                    <td>category</td>
                    <td>message</td>
                </tr>
            </div>
            <tbody id="traceData">
            </tbody>
        </table>
        </div>
        </div>`;

        document.getElementById('tracingModules').onchange = this.getSelectedModuleAndShowCategories.bind(this);

        this.retrieveControls().then( response => {
            self.traceModules = response;
            self.uniqueTraceModules = [];
            var traceModulesSelectElement = document.getElementById('tracingModules');

            // clear out the select element
            traceModulesSelectElement.options.length = 0;

            if (self.traceModules !== undefined) {
              for (var i = 0; i < self.traceModules.length; i++) {
                if (self.traceModules[i].type == 'Tracing'      || self.traceModules[i].type == 'Logging' ||
                    self.traceModules[i].type == 'Reporting'    || self.traceModules[i].type == 'OperationalStream') {
                  // check if tracemodule is in mapping object, if not add it
                  if (self.uniqueTraceModules.indexOf(
                          self.traceModules[i].module) === -1) {
                    self.uniqueTraceModules.push(self.traceModules[i].module);
                    var newOptionElement = document.createElement('option');
                    newOptionElement.innerHTML = self.traceModules[i].module;

                    if (self.traceModules[i].module ===
                        self.selectedTraceModule)
                      newOptionElement.selected = true;

                    traceModulesSelectElement.appendChild(newOptionElement);
                  }
                }
              }

              if (self.selectedTraceModule === undefined)
                self.selectedTraceModule = self.traceModules[0].module;
              self.showTraceCategories(self.selectedTraceModule);
            }
        });
    }

    getSelectedModuleAndShowCategories() {
        var selector = document.getElementById('tracingModules');
        var selectedModule = this.uniqueTraceModules[ selector.selectedIndex ];
        this.showTraceCategories(selectedModule);
    }

    showTraceCategories(module) {
        var tracingDiv = document.getElementById("tracing_div");
        tracingDiv.innerHTML = '';

        if (this.traceModules.length === 0)
            return;

        // update the state of the module we selected for the tracing menu redraw
        this.selectedTraceModule = module;

        for (var i=0; i<this.traceModules.length; i++) {
            var m = this.traceModules[i];
            if (m.module !== module)
                continue;

            var labelDiv = document.createElement("div");
            labelDiv.className = "label grid__col grid__col--2-of-8";
            tracingDiv.appendChild(labelDiv);

            var label =  document.createElement("label");
            label.innerHTML = m.category;
            label.setAttribute("for", m.category);
            labelDiv.appendChild(label);

            var div = document.createElement("div");
            div.className = "grid__col grid__col--6-of-8";
            tracingDiv.appendChild(div);

            var checkboxDiv = document.createElement("div");
            checkboxDiv.className = "checkbox";
            div.appendChild(checkboxDiv);

            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = m.category;
            checkbox.checked = (m.enabled !== undefined) && m.enabled;
            checkbox.onclick = this.toggleTrace.bind(this, m);
            checkboxDiv.appendChild(checkbox);

            var checkboxLabel = document.createElement("label");
            checkboxLabel.setAttribute("for", m.category);
            checkboxDiv.appendChild(checkboxLabel);
        }
    }

    toggleTrace(m) {
        m.enabled = !m.enabled;
        this.toggleTracing(m.module, m.category, m.enabled);
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

    _socketMessage(data) {
        const msg = JSON.parse(data.data);

        const date = new Date(msg.time);

        const tr = document.createElement('tr');
        const time = document.createElement('td');
        time.innerHTML = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        tr.appendChild(time);

        const file = document.createElement('td');
        if (msg.filename !== undefined && msg.classname !== undefined && msg.linenumber !== undefined) {
            const properClassName = this.escapeHtml(msg.classname);
            file.innerHTML = `${msg.filename}:${properClassName}:${msg.linenumber}`;
        }
        else if (msg.callsign !== undefined)
            file.innerHTML = `${msg.callsign}`;
        else
        	file.innerHTML = '';
        tr.appendChild(file);

        const module = document.createElement('td');
        module.innerHTML = msg.module;
        tr.appendChild(module);

        const category = document.createElement('td');
        category.innerHTML = msg.category;
        tr.appendChild(category);

        const incomingMsg = document.createElement('td');
        incomingMsg.innerHTML = msg.message;
        tr.appendChild(incomingMsg);


        document.getElementById('traceData').appendChild(tr);
        const objDiv = document.getElementById("traceTableContainer");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    _openSocket() {
        this._closeSocket();
        this.traceSocket = new WebSocket(this.socketUrl, 'json');
        this.traceSocket.onmessage = this._socketMessage.bind(this);
    }

    _closeSocket() {
        if (this.traceSocket) {
            this.traceSocket.close();
            this.traceSocket = undefined;
        }
    }

}

export default MessageControl;
