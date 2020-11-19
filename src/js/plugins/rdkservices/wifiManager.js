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
/** The wifi plugin provides details on the available Wifi Adapters, scans for networks and allows the user to join networks through the UI
 */

import Plugin from '../../core/plugin.js';

class WifiManager extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'Wi-Fi';
    this.networks = [];
    this.connecting = false;
    this.connected = undefined;
    this.scanning = false;
    this.statusMessageTimer = null;
    this.rendered = false;
  }

  render() {
    var mainDiv = document.getElementById('main');
    mainDiv.innerHTML = `
      <div class="title grid__col grid__col--8-of-8">Status</div>
      <div class="label grid__col grid__col--2-of-8">Connected to</div>
      <div id="Wifi_Connected" class="text grid__col grid__col--6-of-8"></div>
      <div class="text grid__col grid__col--6-of-8">
        <button type="button" id="Wifi_scanForNetworksButton">Scan for networks</button>
      </div>
      <div class="label grid__col grid__col--2-of-8"></div>
      <div class="label grid__col grid__col--2-of-8">Scanning</div>
      <div id="Wifi_Scanning" class="text grid__col grid__col--6-of-8">false</div>
      <div class="label grid__col grid__col--2-of-8">Wireless networks</div>
      <div class="text grid__col grid__col--6-of-8">
        <select id="Wifi_WirelessNetwork" class="grid__col--5-of-8"></select>
      </div>
      <div id="ssid_options"></div>
      <br />
      <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>
      `;
    this.scanButton = document.getElementById('Wifi_scanForNetworksButton');
    this.optionButton = document.getElementById('ssid_options');
    this.scanButton.onclick = this.scanForNetworks.bind(this);
    this.connectedStatus = document.getElementById('Wifi_Connected');
    this.scanningStatus = document.getElementById('Wifi_Scanning');
    this.statusMessages = document.getElementById('statusMessages');
    this.networkListEl = document.getElementById('Wifi_WirelessNetwork');
    this.update();
    this.wifiScanListener = this.api.t.on(this.callsign, 'onAvailableSSIDs', data => {
      this.renderNetworks(data);
      this.scanningStatus.innerHTML = false;
    });
    this.wifiConnectionListener = this.api.t.on(this.callsign, 'onWIFIStateChanged', data => {
      this.getConnectedSSID();
      switch (data.state) {
        case 2:
          this.statusMessage(`Disconnected from ${this.connectedStatus.innerHTML}`);
          break;
        case 4:
          this.statusMessage('Connecting', true);
          break;
        case 5:
          this.statusMessage('Connected');
          break;
        case 6:
          this.statusMessage('Failed');
          break;
      }
    });
    this.errorListener = this.api.t.on(this.callsign, 'onError', error => {
      switch (error.code) {
        case 4:
          this.statusMessage('Invalid credentials', false, true);
          break;
      }
    });
    this.networkListEl.onchange = this.renderOptions.bind(this);
    this.rendered = true;
  }

  update() {
    this.renderOptions();
    this.getConnectedSSID();
    this.scanForNetworks();
  }

  scanForNetworks() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'startScan',
      params: { incremental: false, ssid: '', frequency: '' },
    };

    this.api.req(_rest, _rpc).then(resp => {
      if (!resp.success) {
        this.statusMessage(resp.error, false, true);
      } else {
        this.scanningStatus.innerHTML = true;
      }
    });
  }

  renderNetworks(resp) {
    if (resp === undefined) return;
    this.networks = [];

    if (this.rendered === false) return;
    let _networks = resp.ssids;

    this.networkListEl.innerHTML = '';
    for (var i = 0; i < _networks.length; i++) {
      if (_networks[i].ssid === '') continue;
      this.networks.push(_networks[i]);
      let security = '';
      if (_networks[i].security != 0) security = 'secured';
      var newChild = this.networkListEl.appendChild(document.createElement('option'));
      newChild.innerHTML = `${_networks[i].ssid} (${_networks[i].signalStrength}dbM) ${security}`;
    }
    this.renderOptions();
  }

  statusMessage(message, loading = false, error = false) {
    window.clearTimeout(this.statusMessageTimer);
    this.statusMessages.classList.remove('loading');
    this.statusMessages.innerHTML = message;
    if (loading) {
      this.statusMessages.classList.add('loading');
    }
    if (error) this.statusMessages.style = 'color: red';
    else this.statusMessages.style = '';
    this.statusMessageTimer = setTimeout(this.statusMessage.bind(this), 5000, '');
  }

  connect() {
    var idx = this.networkListEl.selectedIndex;
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'connect',
      params: {
        ssid: this.networks[idx].ssid,
        passphrase: this.passwordEl.value,
        securityMode: this.networks[idx].security,
      },
    };

    this.api.req(_rest, _rpc).then(() => {
      this.connecting = true;
      this.passwordEl.value = '';
    });
  }

  disconnect() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'disconnect',
      params: {},
    };

    this.api.req(_rest, _rpc).then(result => {});
  }

  getConnectedSSID() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getConnectedSSID',
      params: {},
    };

    this.api.req(_rest, _rpc).then(result => {
      this.connectedStatus.innerHTML = result.ssid;
      this.renderOptions();
    });
  }

  renderOptions() {
    this.optionButton.innerHTML = '';
    let idx = this.networkListEl.selectedIndex;
    if (idx >= 0) {
      if (this.networks[idx].ssid == this.connectedStatus.innerHTML) {
        this.optionButton.innerHTML = `
          <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="Wifi_disconnectButton">Disconnect</button>
          </div>
          `;
        this.disconnectButton = document.getElementById('Wifi_disconnectButton');
        this.disconnectButton.onclick = this.disconnect.bind(this);
      } else {
        if (this.networks[idx].security == 0 || this.networks[idx].security == 15) {
          this.optionButton.innerHTML = `
            <div class="text grid__col grid__col--6-of-8">
              <button type="button" id="Wifi_connectButton">Connect</button>
            </div>
            `;
        } else {
          this.optionButton.innerHTML = `
            <div id="Wifi_Password_Label" class="label grid__col grid__col--2-of-8">
                Password
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input id="Wifi_Password" type="password" name="password"/>
            </div>
            <div class="text grid__col grid__col--6-of-8">
              <button type="button" id="Wifi_connectButton">Connect</button>
            </div>
            `;
          this.passwordEl = document.getElementById('Wifi_Password');
        }
        this.connectButton = document.getElementById('Wifi_connectButton');
        this.connectButton.onclick = this.connect.bind(this);
      }
    }
  }

  close() {
    this.rendered = false;
    if (this.wifiConnectionListener && typeof this.wifiConnectionListener.dispose === 'function')
      this.wifiConnectionListener.dispose();
    if (this.wifiScanListener && typeof this.wifiScanListener.dispose === 'function') this.wifiScanListener.dispose();
  }
}

export default WifiManager;
