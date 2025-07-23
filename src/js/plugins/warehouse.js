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
/** Warehouse plugin provides API to perform various types of resets */

import Plugin from '../core/plugin.js';

class Warehouse extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);

    this.renderInMenu = true;
    this.displayName = 'Warehouse';
    this.mainDiv = document.getElementById('main');

    this.template = `
      <div class="title grid__col grid__col--8-of-8">Device Information</div>
      <div class="label grid__col grid__col--2-of-8">Bluetooth MAC</div>
      <div id="bt_mac" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Box IP</div>
      <div id="box_ip" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Build Type</div>
      <div id="build_type" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">ESTB MAC</div>
      <div id="estb_mac" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Ethernet MAC</div>
      <div id="eth_mac" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Image Version</div>
      <div id="img_version" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Model Number</div>
      <div id="model_number" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">rf4ce MAC</div>
      <div id="rf_mac" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Wi-Fi MAC</div>
      <div id="wifi_mac" class="text grid__col grid__col--6-of-8">-</div>
      <div class="title grid__col grid__col--8-of-8">Reset</div>
      <div class="label grid__col grid__col--2-of-8">Device Reset</div>
      <div class="text grid__col grid__col--6-of-8">
        <button type="button" id="Device_Reset">Reset</button>
      </div>
      <div class="label grid__col grid__col--2-of-8">Internal Reset</div>
      <div class="text grid__col grid__col--6-of-8">
        <button type="button" id="Internal_Reset">Reset</button>
      </div>
      <div class="label grid__col grid__col--2-of-8">Light Reset</div>
      <div class="text grid__col grid__col--6-of-8">
        <button type="button" id="Light_Reset">Reset</button>
      </div>
      <div class="title grid__col grid__col--8-of-8">Front Panel State</div>
      <div class="label grid__col grid__col--2-of-8">Set front panel state</div>
      <div class="grid__col grid__col--3-of-8">
        <select id="state" name="state">
          <option value="-1">NONE</option>
          <option value="1">DOWNLOAD IN PROGRESS</option>
          <option value="3">DOWNLOAD FAILED</option>
        </select>
      </div>
      <div class="grid__col grid__col--3-of-8">
        <button type="button" id="front_set">Set</button>
      </div>
      <div class="title grid__col grid__col--8-of-8">Customer Data</div>
      <div id="cust_data" class="text grid__col grid__col--8-of-8">-</div>
     	`;
  }

  render() {
    this.mainDiv.innerHTML = this.template;
    this.btMac = document.getElementById('bt_mac');
    this.boxIP = document.getElementById('box_ip');
    this.buildType = document.getElementById('build_type');
    this.estbMac = document.getElementById('estb_mac');
    this.ethMac = document.getElementById('eth_mac');
    this.imgVersion = document.getElementById('img_version');
    this.modelNumber = document.getElementById('model_number');
    this.rfMac = document.getElementById('rf_mac');
    this.wifiMac = document.getElementById('wifi_mac');
    this.custData = document.getElementById('cust_data');
    this.deviceResetButton = document.getElementById('Device_Reset');
    this.internalResetButton = document.getElementById('Internal_Reset');
    this.lightResetButton = document.getElementById('Light_Reset');
    this.frontPanelSetButton = document.getElementById('front_set');
    this.state = document.getElementById('state');
    this.deviceResetButton.onclick = () => {
      if (confirm('Do you want to suppress reboot during device reset')) {
        this.deviceReset(true);
      } else {
        this.deviceReset(false);
      }
    };
    this.internalResetButton.onclick = this.internalReset.bind(this);
    this.lightResetButton.onclick = this.lightReset.bind(this);
    this.frontPanelSetButton.onclick = this.frontPanelSet.bind(this);
    this.onResetDone = this.api.t.on(this.callsign, 'resetDone', notification => {
      alert('Device reset successfully');
    });
    this.deviceInfo();
    this.isClean();
  }

  deviceReset(bool) {
    const _rpc = {
      plugin: this.callsign,
      method: 'resetDevice',
      params: { supressReboot: bool },
    };

    return this.api.req(null, _rpc);
  }

  internalReset() {
    const _rpc = {
      plugin: this.callsign,
      method: 'internalReset',
      params: { passPhrase: 'FOR TEST PURPOSES ONLY' },
    };

    return this.api.req(null, _rpc).then(result => {
      if (result.success) {
        alert('Internal reset success');
      }
    });
  }

  lightReset() {
    const _rpc = {
      plugin: this.callsign,
      method: 'lightReset',
    };

    return this.api.req(null, _rpc).then(result => {
      if (result.success) {
        alert('Light reset success');
      }
    });
  }

  frontPanelSet() {
    const _rpc = {
      plugin: this.callsign,
      method: 'setFrontPanelState',
      params: { state: this.state.value },
    };

    return this.api.req(null, _rpc).then(result => {
      if (result.success) {
        alert('Front panel LED states set successfully');
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  }

  deviceInfo() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getDeviceInfo',
    };

    return this.api.req(null, _rpc).then(result => {
      if (result.success) {
        this.btMac.innerHTML = result.bluetooth_mac;
        this.boxIP.innerHTML = result.boxIP;
        this.buildType.innerHTML = result.build_type;
        this.estbMac.innerHTML = result.estb_mac;
        this.ethMac.innerHTML = result.eth_mac;
        this.imgVersion.innerHTML = result.imageVersion;
        this.modelNumber.innerHTML = result.model_number;
        this.rfMac.innerHTML = result.rf4ce_mac;
        this.wifiMac.innerHTML = result.wifi_mac;
      }
    });
  }

  isClean() {
    const _rpc = {
      plugin: this.callsign,
      method: 'isClean',
    };

    return this.api.req(null, _rpc).then(result => {
      if (!result.success) {
        this.custData.innerHTML = 'Error:' + result.error;
      } else {
        if (result.clean) {
          this.custData.innerHTML = 'No records found';
        } else {
          this.custData.innerHTML = result.files.join('<br />');
        }
      }
    });
  }

  close() {
    if (this.onResetDone && typeof this.onResetDone.dispose === 'function') {
      this.onResetDone.dispose();
      this.onResetDone = null;
    }
  }
}

export default Warehouse;
