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
/** The bluetooth plugin provides details on the available bluetooth devices, scans for new devices and allows the user to connect the device through UI
 */

import Plugin from '../../core/plugin.js';
const profile = {
  all: `DEFAULT`,
  in: `SMARTPHONE, TABLET`,
  out: `LOUDSPEAKER, HEADPHONES, WEARABLE HEADSET, HIFI AUDIO DEVICE`,
  hid: ` KEYBOARD, MOUSE, JOYSTICK`,
  handsfree: `HANDSFREE"`,
  tile: ` LE, LE TILE`,
};

class BluetoothManager extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this._devices = [];
    this.scanning = false;
    this.displayName = 'Bluetooth';
  }

  render() {
    var mainDiv = document.getElementById('main');
    mainDiv.innerHTML = `
    <div class="title grid__col grid__col--8-of-8">Discovery</div>
    <div class="label grid__col grid__col--2-of-8">Scan</div>
    <div class="grid__col grid__col--2-of-8">
      <select id="profile" name="profile">
        <option value="all">ALL</option>
        <option value="out">Audio-Out</option>
        <option value="in">Audio-In</option>
        <option value="hid">HID</option>
        <option value="handsfree">HandsFree</option>
        <option value="tile">LE/Tile</option>
      </select>
    </div>
    <div class="grid__col grid__col--4-of-8">
      <button type="button" id="BT_ScanForDevices">Scan</button>
    </div>
    <div class="title grid__col grid__col--8-of-8">Status</div>
    <div class="label grid__col grid__col--2-of-8">Scanning</div>
    <div id="BT_Scanning" class="text grid__col grid__col--6-of-8">OFF</div>

    <div class="label grid__col grid__col--2-of-8">Devices</div>
    <div class="text grid__col grid__col--6-of-8">
      <select id="BT_Devices" class="grid__col--5-of-8"></select>
    </div>
    <div class="title grid__col grid__col--8-of-8">Device</div>
    <div class="label grid__col grid__col--2-of-8">Name</div>
    <div id="BT_Name" class="text grid__col grid__col--6-of-8">-</div>
    <div class="label grid__col grid__col--2-of-8">Type</div>
    <div id="BT_Type" class="text grid__col grid__col--6-of-8">-</div>
    <div class="label grid__col grid__col--2-of-8">Connected</div>
    <div id="BT_Connected" class="text grid__col grid__col--6-of-8">-</div>
    <div class="label grid__col grid__col--2-of-8">Paired</div>
    <div id="BT_Paired" class="text grid__col grid__col--6-of-8">-</div>
    <div class="label grid__col grid__col--2-of-8">Controls</div>
    <div class="text grid__col grid__col--6-of-8">
      <button type="button" id="BT_Disconnect">Disconnect</button>
      <button type="button" id="BT_Pair">Pair</button>
      <button type="button" id="BT_Unpair">Unpair</button>
      <button type="button" id="BT_Connect">Connect</button>
    </div>
    <br />
    <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>
    `;
    this.scanButton = document.getElementById('BT_ScanForDevices');
    this.pairButton = document.getElementById('BT_Pair');
    this.unpairButton = document.getElementById('BT_Unpair');
    this.connectButton = document.getElementById('BT_Connect');
    this.disconnectButton = document.getElementById('BT_Disconnect');
    this.deviceList = document.getElementById('BT_Devices');
    this.deviceList.onchange = this.renderDevice.bind(this);
    this.scanButton.onclick = this.scanForDevices.bind(this);
    this.pairButton.onclick = this.pairDevice.bind(this);
    this.unpairButton.onclick = this.unpairDevice.bind(this);
    this.disconnectButton.onclick = this.disconnect.bind(this);
    this.connectButton.onclick = this.connect.bind(this);
    this.connectButton.style.display = 'none';
    this.disconnectButton.style.display = 'none';
    this.pairButton.style.display = 'none';
    this.unpairButton.style.display = 'none';
    this.nameEl = document.getElementById('BT_Name');
    this.typeEl = document.getElementById('BT_Type');
    this.connectedEl = document.getElementById('BT_Connected');
    this.pairedEl = document.getElementById('BT_Paired');
    this.profileValue = document.getElementById('profile');
    this.scanningStatus = document.getElementById('BT_Scanning');
    this.statusMessages = document.getElementById('statusMessages');
    this.deviceList = document.getElementById('BT_Devices');
    this.scanListener = this.api.t.on(this.callsign, 'onDiscoveredDevice', this.scanComplete.bind(this));
    this.complete = this.api.t.on(this.callsign, 'onStatusChanged', notification => {
      this.statusUpdate(notification);
      this.update();
    });

    this.deviceStateListener = this.api.t.on(this.callsign, 'onPairingRequest', notification => {
      if (notification.pinRequired) {
        this.updateStatus(`Enter pairing code:${notification.pinValue}`);
      } else {
        this.respondToevent(notification.deviceID, 'onPairingRequest', 'Accepted');
      }
    });
    this.update();
  }

  statusUpdate(notification) {
    switch (notification.newStatus) {
      case 'DISCOVERY_COMPLETED':
        this.updateStatus('Scanning Completed');
        this.scanningStatus.innerHTML = 'OFF';
        break;
      case 'DISCOVERY_STARTED':
        this.updateStatus('Scanning Started');
        this.scanningStatus.innerHTML = 'ON';
        break;
      case 'PAIRING_CHANGE':
        if (notification.paired) this.updateStatus(`Paired to ${notification.name}`);
        else this.updateStatus(`Unpaired from ${notification.name}`);
        break;
      case 'CONNECTION_CHANGE':
        if (notification.connected) this.updateStatus(`Connected to ${notification.name}`);
        else this.updateStatus(`Disconnected from ${notification.name}`);
    }
  }

  devices() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getDiscoveredDevices',
      params: {},
    };
    return this.api.req(_rest, _rpc).then(devices => {
      if (devices === undefined) {
        return;
      }

      if (devices.discoveredDevices && devices.discoveredDevices.length)
        devices.discoveredDevices.forEach(device => {
          if (this._pairedID.includes(device.deviceID)) {
            return;
          }
          this._devices.push({ device: device });
        });
      return this._devices;
    });
  }

  getPairedDevices() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getPairedDevices',
      params: {},
    };
    return this.api.req(_rest, _rpc).then(devices => {
      this._pairedID = [];

      if (devices.pairedDevices && devices.pairedDevices.length) {
        devices.pairedDevices.forEach(device => {
          this._pairedID.push(device.deviceID);
          device.paired = true;
          this._devices.push({ device: device });
        });
      }
    });
  }

  device(deviceID) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getDeviceInfo',
      params: { deviceID: deviceID },
    };

    return this.api.req(_rest, _rpc);
  }

  scanComplete() {
    this.scanning = false;
    this.update();
  }

  updateDeviceList() {
    this.deviceList.innerHTML = '';
    if (this._devices && this._devices.length) {
      this._devices.forEach(d => {
        var newDeviceChild = this.deviceList.appendChild(document.createElement('option'));
        newDeviceChild.innerHTML = d.device.name;
      });

      this.renderDevice();
    } else {
      this.renderDevice();
    }
  }

  renderDevice() {
    this.connectButton.style.display = 'none';
    this.disconnectButton.style.display = 'none';
    this.pairButton.style.display = 'none';
    this.unpairButton.style.display = 'none';
    let idx = this.deviceList.selectedIndex;
    if (idx === -1 || this._devices.length === 0) {
      this.nameEl.innerHTML = '-';
      this.typeEl.innerHTML = '-';
      this.connectedEl.innerHTML = '-';
      this.pairedEl.innerHTML = '-';
      return;
    }

    let device = this._devices[idx].device;
    this.device(device.deviceID).then(data => {
      if (data) this._devices[idx] = { device, ...data.deviceInfo };

      this.nameEl.innerHTML = this._devices[idx].device.name;
      this.typeEl.innerHTML = this._devices[idx].device.deviceType;
      this.connectedEl.innerHTML = this._devices[idx].device.connected;
      this.pairedEl.innerHTML = this._devices[idx].device.paired;
      if (this._devices[idx].device.paired && this._devices[idx].device.connected) {
        this.disconnectButton.style.display = '';
        this.unpairButton.style.display = '';
      } else if (this._devices[idx].device.paired && !this._devices[idx].device.connected) {
        this.connectButton.style.display = '';
        this.unpairButton.style.display = '';
      } else if (!this._devices[idx].device.paired) {
        this.pairButton.style.display = '';
      }
    });
  }

  updateStatus(message, loading = false, error = false) {
    window.clearTimeout(this.statusMessageTimer);
    this.statusMessages.innerHTML = message;
    this.statusMessages.classList.remove('loading');
    if (loading) {
      this.statusMessages.classList.add('loading');
    }
    if (error) this.statusMessages.style = 'color: red';
    else this.statusMessages.style = '';
    this.statusMessageTimer = setTimeout(this.updateStatus, 5000, '');
  }

  update() {
    this._devices = [];
    this.getPairedDevices().then(() => {
      this.devices().then(() => {
        this.updateDeviceList();
      });
    });
  }

  scanForDevices() {
    this.scanning = true;
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'startScan',
      params: { timeout: 10, profile: profile[this.profileValue.value] },
    };

    return this.api
      .req(_rest, _rpc)
      .then(result => {
        console.log(result);
      })
      .catch(e => {
        if (e.message) this.updateStatus(`Error: ${e.message}`, false, true);
      });
  }

  pairDevice() {
    var idx = this.deviceList.selectedIndex;
    this.updateStatus(`Pairing to ${this._devices[idx].name}`, true);
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'pair',
      params: { deviceID: this._devices[idx].deviceID },
    };

    return this.api
      .req(_rest, _rpc)
      .then(result => {
        if (!result.success) {
          this.updateStatus('Pairing failed', false, true);
        }
      })
      .catch(e => {
        if (e.message) this.updateStatus(`Error: ${e.message}`, false, true);
      });
  }

  unpairDevice() {
    var idx = this.deviceList.selectedIndex;
    this.updateStatus(`Unpairing ${this._devices[idx].name}`, true);

    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'unpair',
      params: { deviceID: this._devices[idx].deviceID },
    };

    return this.api
      .req(_rest, _rpc)
      .then(result => {
        if (!result.success) {
          this.updateStatus('Unpairing failed', false, true);
        }
      })
      .catch(e => {
        if (e.message) this.updateStatus(`Error: ${e.message}`, false, true);
      });
  }

  connect() {
    var idx = this.deviceList.selectedIndex;
    this.updateStatus(`Connecting to ${this._devices[idx].name}`, true);
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'connect',
      params: {
        deviceID: this._devices[idx].deviceID,
        deviceType: this._devices[idx].deviceType,
        profile: this._devices[idx].deviceType,
      },
    };

    return this.api
      .req(_rest, _rpc)
      .then(result => {
        if (!result.success) {
          this.updateStatus('Connecting failed', false, true);
        }
      })
      .catch(e => {
        if (e.message) this.updateStatus(`Error: ${e.message}`, false, true);
      });
  }

  disconnect() {
    var idx = this.deviceList.selectedIndex;
    this.updateStatus(`Disconnecting from ${this._devices[idx].name}`, true);

    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'disconnect',
      params: {
        deviceID: this._devices[idx].deviceID,
      },
    };

    return this.api
      .req(_rest, _rpc)
      .then(result => {
        if (!result.success) {
          this.updateStatus('Disconnecting failed', false, true);
        }
      })
      .catch(e => {
        if (e.message) this.updateStatus(`Error: ${e.message}`, false, true);
      });
  }

  respondToevent(id, type, value) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'respondToEvent',
      params: {
        deviceID: id,
        eventType: type,
        responseValue: value,
      },
    };

    return this.api.req(_rest, _rpc).then(response => {
      console.log(response);
    });
  }

  close() {
    clearInterval(this.statusMessageTimer);
    if (this.scanListener && typeof this.scanListener.dispose === 'function') this.scanListener.dispose();
    if (this.deviceStateListener && typeof this.deviceStateListener === 'function') this.deviceStateListener.dispose();
    if (this.complete && typeof this.complete.dispose === 'function') this.complete.dispose();
  }
}

export default BluetoothManager;
