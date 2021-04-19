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
/** Device Identification plugin provides firmware and chipset information*/

import Plugin from '../core/plugin.js';

class DeviceIdentification extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'Device Identification';
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `
            <div class="title grid__col grid__col--8-of-8">
                Device Identification
            </div>
            <div class="label grid__col grid__col--2-of-8">
                Firmware Version
            </div>
            <div id="firmware_version" class="text grid__col grid__col--6-of-8">
                -
            </div>
            <div class="label grid__col grid__col--2-of-8">
                Chip set
            </div>
            <div id="chipset" class="text grid__col grid__col--6-of-8">
                -
            </div>
                    `;
    this.firmware_version = document.getElementById('firmware_version');
    this.chipset = document.getElementById('chipset');
    this.update();
  }

  deviceIdentification() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'deviceidentification',
    };

    return this.api.req(_rest, _rpc);
  }

  update() {
    this.deviceIdentification().then(response => {
      this.firmware_version.innerHTML = response.firmwareversion;
      this.chipset.innerHTML = response.chipset;
    });
  }
}

export default DeviceIdentification;
