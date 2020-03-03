/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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
/** The compositor plugin manages the Westeros compositor and its cliens through the webui
 */

import Plugin from '../core/plugin.js';

class Compositor extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this._rpcMapping = {
            'Top': 'putontop'
        };
        this.resolutions = ['720p', '720p50Hz', '1080p24Hz', '1080i50Hz', '1080p50Hz', '1080p60Hz'];
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Compositor
        </div>
        <div class="label grid__col grid__col--2-of-8">
            <label for="compositorResolutions">Resolution</label>
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="compositorResolutions"></select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
            <label for="compositorClients">Clients</label>
        </div>
        <div class="text grid__col grid__col--6-of-8" id="compositorClientsDiv">
            <select id="compositorClients"></select>
        </div>
        <div class="text grid__col grid__col--8-of-8"></div>

        <div id="controls"></div>`;


        // bind buttons & sliders
        document.getElementById('compositorResolutions').onclick     = this.setResolution.bind(this);

        // bind fields
        this.resolutionsList    = document.getElementById('compositorResolutions');
        this.menu               = document.getElementById('compositorClients');
        this.controlDiv         = document.getElementById('controls');
        this.compositorClientsDiv = document.getElementById('compositorClientsDiv');

        this.controlDiv.style.display = 'none';

        // update resolutions field
        this.resolutionsList.innerHTML = '';

        for (var i = 0; i < this.resolutions.length; i++) {
            var _item = document.createElement('option');
            _item.value = this.resolutions[i];
            _item.innerHTML = this.resolutions[i];
            this.resolutionsList.appendChild(_item);
        }

        // get clients
        this.getClients().then( resp => {
            // compositor is not returning anything, guess we're in client mode and not managing nxserver
            if (resp === undefined || resp === null || !Array.isArray(resp)) {
                this.compositorClientsDiv.innerHTML = 'No clients found.';
                return;
            }

            if (resp.length > 0) {
                this.renderControls(resp);
            }
        });
    }

    getClients() {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/Clients`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'clients'
        };
        return this.api.req(_rest, _rpc);
    }

    renderControls(clients) {
        this.controlDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Controls
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Focus
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="compositorSetTop">Set Top</button>
        </div>
        <div class="text grid__col grid__col--8-of-8"></div>
        <div class="label grid__col grid__col--2-of-8">
            Opacity
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="sliderOpacity" type="range" min="0" max="256" step="1" value="256"/>
            <input type="number" min="0" max="256" id="numOpacity" size="5" value="256"/>
        </div>
        <div class="label grid__col grid__col--2-of-8"></div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="compositorSetOpacity">Set</button>
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Visibility
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="webkit_hide">Hide</button>
            <button type="button" id="webkit_show">Show</button>
        </div>
        <div class="text grid__col grid__col--8-of-8"></div>
        <div class="title grid__col grid__col--8-of-8">
            Geometry
        </div>
        <div class="label grid__col grid__col--2-of-8">
            X
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="compositorXGeometry" type="number" value="0"/>
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Y
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="compositorYGeometry" type="number" value="0"/>
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Width
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="compositorWidthGeometry" type="number" value="1280" min="0"/>
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Height
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="compositorHeightGeometry" type="number" value="720" min="0"/>
        </div>
        <div class="label grid__col grid__col--2-of-8"></div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="compositorGeometry">Set</button>
        </div>`;

        document.getElementById('compositorSetTop').onclick         = this.compositorAction.bind(this, 'Top');
        document.getElementById('sliderOpacity').onchange           = this.updateValue.bind(this, 'sliderOpacity', 'numOpacity');
        document.getElementById('numOpacity').onchange              = this.updateValue.bind(this, 'numOpacity', 'sliderOpacity');
        document.getElementById('numOpacity').onkeyup               = this.updateValue.bind(this, 'numOpacity', 'sliderOpacity');
        document.getElementById('numOpacity').onpaste               = this.updateValue.bind(this, 'numOpacity', 'sliderOpacity');
        document.getElementById('numOpacity').oninput               = this.updateValue.bind(this, 'numOpacity', 'sliderOpacity');
        document.getElementById('compositorSetOpacity').onclick     = this.compositorSetOpacity.bind(this);
        document.getElementById('webkit_hide').onclick              = this.compositorVisible.bind(this, 'Hide');
        document.getElementById('webkit_show').onclick              = this.compositorVisible.bind(this, 'Show');
        document.getElementById('compositorGeometry').onclick       = this.compositorSetGeometry.bind(this);
        document.getElementById('compositorClients').onchange       = this.clientChange.bind(this);

        var menu = document.getElementById('compositorClients');
        menu.innerHTML = '';
        var item = document.createElement('option');

        item.value = '';
        item.setAttributeNode(document.createAttribute('disabled'));
        item.setAttributeNode(document.createAttribute('selected'));
        item.innerHTML = 'Select a client';
        menu.appendChild(item);

        for (var i = 0; i < clients.length; i++) {
            var _item = document.createElement('option');
            _item.value = clients[i];
            _item.innerHTML = clients[i];
            menu.appendChild(_item);
        }
    }

    compositorAction(action) {
        var client = this.menu.options[this.menu.selectedIndex].value;

        const _rest = {
            method  : 'POST',
            path    : `${this.callsign}/${client}/${action}`
        };

        const _rpc = {
            plugin : this.callsign,
            method :  this._rpcMapping[action],
            params : { client: client }
        };

        this.api.req(_rest,_rpc);
    }

    clientChange() {
        //show controls after selecting a client
        this.controlDiv.style.display = '';
    }

    compositorSetOpacity() {
        var client = this.menu.options[this.menu.selectedIndex].value;
        var opacity = document.getElementById('sliderOpacity').value;

        const _rest = {
            method  : 'POST',
            path    : `${this.callsign}/${client}/Opacity/${opacity}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'opacity@'+client,
            params :  opacity
        };
        this.api.req(_rest,_rpc);
    }

    updateValue(element, toUpdateElement) {
        document.getElementById(toUpdateElement).value = document.getElementById(element).value;
    }

    compositorVisible(state) {
        console.log(state);
        var client = this.menu.options[this.menu.selectedIndex].value;

        const _rest = {
            method  : 'POST',
            path    : `${this.callsign}/Visible/${state}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'visiblity@'+client,
            params : state === 'Show' ? 'visible':'hidden'
        };

        this.api.req(_rest,_rpc);
    }

    compositorSetGeometry() {
        var client = this.menu.options[this.menu.selectedIndex].value;
        var x = document.getElementById('compositorXGeometry').value;
        var y = document.getElementById('compositorYGeometry').value;
        var w = document.getElementById('compositorWidthGeometry').value;
        var h = document.getElementById('compositorHeightGeometry').value;


        const _rest = {
            method  : 'POST',
            path    : `${this.callsign}/${client}/Geometry/${x}/${y}/${w}/${h}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'geometry@' + client,
            params : { x: x, y:y, width: w, height: h }
        };

        this.api.req(_rest,_rpc);
    }

    setResolution() {
        var _res = this.resolutionsList.options[this.resolutionsList.selectedIndex].value;

        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}/Resolution/${_res}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'action',
            params : { client: client }
        };

        // FIXME: no rpc interface defined
        this.api.req(_rest);
    }

}

export default Compositor;
