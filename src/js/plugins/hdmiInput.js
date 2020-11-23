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
/** The hdmi input plugin provides details related to hdmi input port of device.*/

import Plugin from '../core/plugin.js';

class HdmiInput extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'HDMIInput';
    this.value = '';
    this.namedPing = false;
    this.namedTrace = false;
  }

  render() {
    var mainDiv = document.getElementById('main');
    mainDiv.innerHTML = `
        <div class="text grid__col grid__col--8-of-8">
        HDMI Input Devices
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <table class="text grid__col grid__col--8-of-8" id="input_devices"></table>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Activate/Deactivate Input
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Port Id
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="portId">
        </select>
        </div>
        <div class="text grid__col grid__col--2-of-8">
        <button id="start" type="button">Start</button>
        <button id="stop" type="button">Stop</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        EDID
        </div>
        <div class="label grid__col grid__col--2-of-8">
        EDID value of currently stubbed
        </div>
        <div id="read_edid" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Change EDID value
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Device Id
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="deviceId" type="number">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Message
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="edid_message" type="string">
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button id="write_edid" type="button">Set</button>
        </div>
        `;

    this.input_devices = document.getElementById('input_devices');
    this.portId = document.getElementById('portId');
    this.start = document.getElementById('start');
    this.start.onclick = this.doStart.bind(this);
    this.stop = document.getElementById('stop');
    this.stop.onclick = this.doStop.bind(this);
    this.read_edid = document.getElementById('read_edid');
    this.deviceId = document.getElementById('deviceId');
    this.edid_message = document.getElementById('edid_message');
    this.write_edid = document.getElementById('write_edid');
    this.write_edid.onclick = this.doWrite.bind(this);
    this.streaming = false;
    this.onDevicesChanged = this.api.t.on(this.callsign, 'onDevicesChanged', this.update());
    this.length = 0;
  }

  doStart() {
    if (this.portId.value) {
      try {
        this.startHdmiInput(this.portId.value).then(response => {
          if (response && response.success) {
            this.streaming = true;
            alert('Successfully started hdmi input streaming');
          } else {
            alert('Failed to start hdmi input streaming');
          }
        });
      } catch (err) {
        alert('Error in getting response');
      }
    } else {
      alert('No active ports available to start hdmi streaming');
    }
  }

  doStop() {
    if (this.streaming) {
      if (this.portId.value) {
        try {
          this.stopHdmiInput().then(response => {
            if (response && response.success) {
              this, (this.streaming = false);
              alert('Successfully stopped hdmi input streaming');
            } else {
              alert('Failed to stop hdmi input streaming');
            }
          });
        } catch (err) {
          alert('Error in getting response');
        }
      }
    } else {
      alert('Currently, there is no streaming from hdmi input to stop');
    }
  }

  doWrite() {
    if (this.edid_message.value !== '' && this.edid_message.value.trim().length != 0 && this.deviceId.value) {
      try {
        this.writeEDID(parseInt(this.deviceId.value), this.edid_message.value).then(response => {
          if (response && response.success) {
            this.streaming = true;
            alert('Successfully set message');
          } else {
            alert('Failed to set edid value');
          }
        });
      } catch (err) {
        alert('Error in setting edid value');
      }
    } else if (this.deviceId.value == '') {
      alert('No active ports available to change EDID value');
    } else if (this.edid_message.value == '' || this.edid_message.value.trim().length == 0) {
      alert('Please provide message');
    }
  }

  getHDMIInputDevices() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getHDMIInputDevices',
    };

    return this.api.req(_rest, _rpc);
  }

  startHdmiInput(portId) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'startHdmiInput',
      params: {
        portId: portId,
      },
    };

    return this.api.req(_rest, _rpc);
  }

  stopHdmiInput() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'stopHdmiInput',
    };

    return this.api.req(_rest, _rpc);
  }

  readEDID() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'readEDID',
    };

    return this.api.req(_rest, _rpc);
  }

  writeEDID(deviceId, message) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'writeEDID',
      params: { deviceId: deviceId, message: message },
    };

    return this.api.req(_rest, _rpc);
  }

  update() {
    this.input_devices.innerHTML = '';
    for (var i = length - 1; i >= 0; i--) {
      this.portId.options[i] = null;
      this.deviceId.options[i] = null;
    }
    try {
      this.getHDMIInputDevices().then(response => {
        if (response && response.success && response.devices.length) {
          this.length = response.devices.length;
          this.tr1 = document.createElement('tr');
          this.tr1.id = 'tr';
          this.tr1.className = 'text grid__col grid__col--8-of-8';
          this.td1 = document.createElement('th');
          this.td1.id = 'td';
          this.td1.className = 'text grid__col grid__col--2-of-8';
          this.td1div = document.createElement('div');
          this.td1div.innerHTML = 'Locator';
          this.td2 = document.createElement('th');
          this.td2.id = 'td';
          this.td2div = document.createElement('div');
          this.td2.className = 'text grid__col grid__col--2-of-8';
          this.td2div.innerHTML = 'Connected';
          this.td1.appendChild(this.td1div);
          this.td2.appendChild(this.td2div);
          this.tr1.appendChild(this.td1);
          this.tr1.appendChild(this.td2);
          this.input_devices.appendChild(this.tr1);
          for (var i = 0; i < response.devices.length; i++) {
            this.status = document.createElement('tr');
            this.status.id = 'tr';
            this.status.className = 'label grid__col grid__col--8-of-8';
            this.locator = document.createElement('td');
            this.locator.id = 'td';
            this.locator.className = 'label grid__col grid__col--2-of-8';
            this.locator_div = document.createElement('div');
            this.locator_div.innerHTML = response.devices[i].locator;
            this.connected = document.createElement('td');
            this.connected.id = 'td';
            this.connected_div = document.createElement('div');
            this.connected.className = 'label grid__col grid__col--2-of-8';
            this.connected_div.innerHTML = response.devices[i].connected;
            this.locator.appendChild(this.locator_div);
            this.connected.appendChild(this.connected_div);
            this.status.appendChild(this.locator);
            this.status.appendChild(this.connected);
            this.input_devices.appendChild(this.status);

            if (response.devices[i].connected == 'true') {
              var option1 = document.createElement('option');
              option1.text = i;
              option1.value = i;
              this.portId.appendChild(option1);
              var option2 = document.createElement('option');
              option2.text = i;
              option2.value = i;
              this.deviceId.appendChild(option2);
            }
          }
        } else if (response && response.success && response.devices.length == 0) {
          this.input_devices.innerHTML = `
          <tr id='tr'>
          <th id='td'>Locator</th>
          <th id='td'>Connected</th>
          </tr>
          <tr>
          <td id='td' colspan="2">No data available</td>
          </tr>
          `;
        } else {
          alert('Error in getting response');
        }
      });
    } catch (err) {
      alert('Failed to get response');
    }
    try {
      this.readEDID().then(response => {
        if (response && response.success && response.name) {
          this.read_edid.innerHTML = response.name;
        } else {
          alert('Failed to get response');
        }
      });
    } catch {
      alert('Error in getting response');
    }
  }

  close() {
    if (this.onDevicesChanged && typeof this.onDevicesChanged.dispose === 'function') {
      this.onDevicesChanged.dispose();
      this.onDevicesChanged = null;
    }
  }
}

export default HdmiInput;
