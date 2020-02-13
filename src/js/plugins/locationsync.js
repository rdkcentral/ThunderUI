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
/** The location sync plugin retrieves the location of the device from the geoip servers
 */

import Plugin from '../core/plugin.js';

class LocationSync extends Plugin {
    constructor(pluginData, api) {
        super(pluginData, api);

        this.renderInMenu = true;
        this.displayName = 'Location';
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
          Location
        </div>

        <div class="label grid__col grid__col--2-of-8">
          City
        </div>
        <div id="city" class="text grid__col grid__col--6-of-8">
          -
        </div>
        <div class="label grid__col grid__col--2-of-8">
          Country
        </div>
        <div id="country" class="text grid__col grid__col--6-of-8">
          -
        </div>
        <div class="label grid__col grid__col--2-of-8">
          Region
        </div>
        <div id="region" class="text grid__col grid__col--6-of-8">
          -
        </div>

        <div class="label grid__col grid__col--2-of-8">
          Timezone
        </div>
        <div id="timezone" class="text grid__col grid__col--6-of-8">
          -
        </div>

        <div class="label grid__col grid__col--2-of-8">
          Public IP
        </div>
        <div id="publicip" class="text grid__col grid__col--6-of-8">
          -
        </div>

        <div id="syncLabel" class="label grid__col grid__col--2-of-8">
          Sync
        </div>
        <div class="text grid__col grid__col--6-of-8">
          <button type="button" id="syncButton" onclick="">Sync</button>
        </div>`;

      var syncButton = document.getElementById('syncButton');
      syncButton.onclick = this.syncLocation.bind(this);

      this.cityEl     = document.getElementById('city');
      this.countryEl  = document.getElementById('country');
      this.regionEl   = document.getElementById('region');
      this.timezoneEl = document.getElementById('timezone');
      this.publicIpEl = document.getElementById('publicip');

      this.update();
    }

    syncLocation() {
        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'sync'
        };

        this.api.req(_rest, _rpc).then( () => {
          this.update();
        });
    }

    location() {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'location'
        };

        return this.api.req(_rest, _rpc);
    }

    update() {
        this.location().then( response => {
            this.cityEl.innerHTML     = response.city;
            this.countryEl.innerHTML  = response.country;
            this.regionEl.innerHTML   = response.region;
            this.timezoneEl.innerHTML = response.timezone;
            this.publicIpEl.innerHTML = response.publicip;
        });
    }
}

export default LocationSync;
