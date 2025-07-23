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
/** The ocdm plugin manages different OpenCDM DRM modules
 */

import Plugin from '../core/plugin.js';

class OCDM extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.ocdmTemplate = `<div class="label grid__col grid__col--2-of-8">
            {{Name}}
        </div>
        <div class="text grid__col grid__col--6-of-8">
            {{Designators}}
        </div>`;
    }

    drms() {
        const _rpc = {
            plugin : this.callsign,
            method : 'drms'
        };

        return this.api.req(null, _rpc);
    }

    keysystems(drm) {
        const _rpc = {
            plugin : this.callsign,
            method : `keysystems@${drm}`
        };

        return this.api.req(null, _rpc);
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            OpenCDM Systems
        </div>
        <div id="systemDiv"></div>`;

        this.systemDiv = document.getElementById('systemDiv');
        this.update();
    }

    update() {
        this.drms().then(systems => {
            if (!systems) return;

            systems.forEach(system => {
                const systemElement = this.ocdmTemplate
                    .replace('{{Name}}', system.name)
                    .replace('{{Designators}}', system.keysystems.toString());
                this.systemDiv.innerHTML += systemElement;
            });
        });
    }
}

export default OCDM;
