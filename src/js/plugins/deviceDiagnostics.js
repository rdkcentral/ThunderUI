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
/**Device diagnostics plugin allows to get device configurations.*/

import Plugin from '../core/plugin.js';

class DeviceDiagnostics extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'Device Diagnostics';
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `
        <div class="title grid__col grid__col--8-of-8">
        Configuration
        </div>
        <div class="text grid__col grid__col--2-of-8">
        Property Name
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input type="string" id="property" placeholder="Device.X_CISCO_COM_LED.RedPwm">
        <button id="show_value" type="button">Show Value</button>
        </div>
        <div class="text grid__col grid__col--2-of-8">
        Value
        </div>
        <div id="value" class="text grid__col grid__col--6-of-8">
        -
        </div>
        `;
    this.property = document.getElementById('property');
    this.show_value = document.getElementById('show_value');
    this.show_value.onclick = this.showValue.bind(this);
    this.value = document.getElementById('value');
  }

  showValue() {
    this.value.innerHTML = '-';
    if (this.property.value == '') {
      alert('Please provide property name');
    } else {
      this.getConfiguration(this.property.value).then(response => {
        if (response.success) {
          if (response.paramList[0]) {
            this.value.innerHTML = response.paramList[0].value;
          } else {
            alert('No value available for the property ' + this.property.value);
          }
        } else {
          alert('Error in getting configuration');
        }
      });
    }
  }

  getConfiguration(property) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getConfiguration',
      params: {
        names: [property],
      },
    };

    return this.api.req(_rest, _rpc);
  }
}

export default DeviceDiagnostics;
