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
/** The provision plugin checks the device identifier and is able to initiate a provisioning request if not provisioned
 */

import Plugin from '../core/plugin.js';

class Provisioning extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
        Provisioning status
      </div>

      <div class="label grid__col grid__col--2-of-8">
        Device
      </div>
      <div id="device" class="text grid__col grid__col--6-of-8">
        -
      </div>
      <div class="label grid__col grid__col--2-of-8">
        Provisioned for
      </div>
      <div id="provisioning-tokens" class="text grid__col grid__col--6-of-8">
        -
      </div>
      <div class="label grid__col grid__col--2-of-8">
        Status
      </div>
      <div id="status" class="text grid__col grid__col--6-of-8">
        -
      </div>

      <div id="provisionLabel" class="label grid__col grid__col--2-of-8">
        Provisioning
      </div>
      <div class="text grid__col grid__col--6-of-8">
        <button type="button" id="provisionButton" onclick="tiggerProvisioningRequest()">Request</button>
      </div>`;

      var provisionButton = document.getElementById('provisionButton');
      provisionButton.onclick = this.tiggerProvisioningRequest.bind(this);

      this.update();
    }

    triggerProvisioning() {
        const _rpc = {
            plugin : this.callsign,
            method : 'provision'
        };

        return this.api.req(null, _rpc);
    }

    status() {
        const _rpc = {
            plugin : this.callsign,
            method : 'state'
        };

        return this.api.req(null, _rpc);
    }

    update() {
        this.status().then( response => {
            if (response === null || response === undefined || response === '')
              return;

            var id = response.id;
            var tokens = response.tokens || [];
            var status = response.status;

            document.getElementById('device').innerHTML = id;
            document.getElementById('status').innerHTML = (status == 200) ? 'provisioned' : 'not provisioned';
            if (status == 200 && tokens.length > 0) {
                document.getElementById('provisioning-tokens').innerHTML = tokens.join(', ');
            }
            //document.getElementById('provisionButton').style.display = (status == 200) ? 'none' : null;
            document.getElementById('provisionLabel').style.display = (status == 200) ? 'none' : null;
        }).catch(err => {
            console.error(err);
            this.status(err);
        });
    }

    tiggerProvisioningRequest() {
        var self = this;

        this.triggerProvisioning().then( response => {
            document.getElementById('provisionButton').style.display = 'none';
            document.getElementById('provisionLabel').style.display = 'none';

            setTimeout(self.update(), 3000);
        });
    }
 }

export default Provisioning;
