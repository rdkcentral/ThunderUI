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
/** The DIAL Server receives dial requests from the Thunder DIAL Server
 */

import Plugin from '../core/plugin.js';

class DIALServer extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.api.t.on('DIALServer', 'start', (message) => {
            this.dialMessage('start', message);
        });

        this.api.t.on('DIALServer', 'stop', (message) => {
            this.dialMessage('stop', message);
        });
    }

    render()        {
        let mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Received DIAL requests:
        </div>

        <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>`;


        this.statusMessagesEl = document.getElementById('statusMessages');
    }

    dialMessage(action, m) {
        let div = document.createElement('div');
        if (action === 'stop')
            div.className = 'red';

        let span = document.createElement('span');
        span.innerHTML = `${action} :: ${m.application} - ${m.parameters}`;
        div.appendChild(span);

        this.statusMessagesEl.appendChild(div);
    }
}

export default DIALServer;
