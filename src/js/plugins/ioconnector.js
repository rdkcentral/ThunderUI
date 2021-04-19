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

import Plugin from '../core/plugin.js';

class IOConnector extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            IOConnector
        </div>

        <div class="label grid__col grid__col--2-of-8">
            PIN
        </div>
        <div id="pin" class="text grid__col grid__col--1-of-8">
            <input type="text" id="pinInput" size="2"/>
        </div>
        <div class="text grid__col grid__col--5-of-8">
            <button type="button" id="get">Get</button>
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Value
        </div>
        <div id="value" class="text grid__col grid__col--1-of-8">
            <input type="text" id="valueInput" size="2"/>
        </div>
        <div class="text grid__col grid__col--5-of-8">
            <button type="button" id="set">Set</button>
        </div>`;

        this.pinEl              = document.getElementById("pinInput");
        this.valueEl            = document.getElementById("valueInput");
        document.getElementById('get').onclick = this.getPin.bind(this);
        document.getElementById('set').onclick = this.setPin.bind(this);
    }

    pin(pinNr, value) {
        const _rpc = {
            plugin : this.callsign,
            method : `pin@${pinNr}`
        };

        if (value !== '')
            _rpc.params = value

        return this.api.req(null, _rpc);
    }

    getPin() {
        let pinNr = this.pinEl.value
        this.pin(pinNr).then( val => {
            this.valueEl.value = val
        })
    }

    setPin() {
        let pinNr = this.pinEl.value
        let pinValue = this.valueEl.value
        this.pin(pinNr, pinValue)
    }

}

export default IOConnector;
