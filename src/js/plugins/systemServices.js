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
/** System services plugin provides the details of the STB. */

import Plugin from '../core/plugin.js';

class SystemServices extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.renderInMenu = true;
    this.displayName = 'System Services';
    this.mainDiv = document.getElementById('main');
    this.updateStateList = {
      0: 'Uninitialized',
      1: 'Requesting',
      2: 'Downloading',
      3: 'Failed',
      4: 'Download Completed',
      5: 'Validation completed',
      6: 'Preparing to reboot',
    };
  }

  render() {
    this.template = `
      <div class="title grid__col grid__col--8-of-8">Device Information</div>
      <div class="label grid__col grid__col--2-of-8">Build Type</div>
      <div id="build_type" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">ESTB MAC</div>
      <div id="estb_mac" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Model Number</div>
      <div id="model_number" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Image Version</div>
      <div id="img_version" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Receiver Version</div>
      <div id="rx_version" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Serial Number</div>
      <div id="serial_number" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Time Zone</div>
      <div id="time_zone" class="text grid__col grid__col--6-of-8">-</div>
      <div class="title grid__col grid__col--8-of-8">Firmware Update</div>
      <div class="label grid__col grid__col--2-of-8">Update Available</div>
      <div id="update_available" class="text grid__col grid__col--6-of-8">No</div>
      <div class="label grid__col grid__col--2-of-8">Update Version</div>
      <div id="update_version" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Update State</div>
      <div id="update_state" class="text grid__col grid__col--6-of-8">-</div>
      <div class="title grid__col grid__col--8-of-8">Standby Mode</div>
      <div class="label grid__col grid__col--2-of-8">Current Standby mode</div>
      <div id="standby_mode" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Set Standby mode</div>
      <div class="text grid__col grid__col--3-of-8">
        <select id="avail_modes"></select>
        <button type="button" id="set_standby">Set</button>
      </div>
      <div class="title grid__col grid__col--8-of-8">Power State</div>
      <div class="label grid__col grid__col--2-of-8">Last Deep Sleep Reason</div>
      <div id="deep_sleep" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Current Power State</div>
      <div id="power_mode" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Set Power State</div>
      <div class="text grid__col grid__col--3-of-8">
        <select id="power_states">
          <option value="ON">ON</option>
          <option value="STANDBY">STANDBY</option>
        </select>
        <button type="button" id="set_power">Set</button>
      </div>
      <div class="title grid__col grid__col--8-of-8">Mode</div>
      <div class="label grid__col grid__col--2-of-8">Current Mode</div>
      <div id="mode" class="text grid__col grid__col--6-of-8">-</div>
      <div class="title grid__col grid__col--8-of-8">Set mode</div>
      <div class="label grid__col grid__col--2-of-8">Mode</div>
      <div class="text grid__col grid__col--4-of-8">
        <select id="mode_list" class="grid__col--5-of-8">
          <option value="NORMAL">NORMAL</option>
          <option value="EAS">EAS</option>
          <option value="WAREHOUSE">WAREHOUSE</option>
        </select>
      </div>
      <div class="text grid__col grid__col--2-of-8"></div>
      <div class="label grid__col grid__col--2-of-8">Duration(in seconds)</div>
      <div class="text grid__col grid__col--4-of-8">
        <input
          type="number"
          id="mode_dur"
          size="20"
          value="0"
          min="1"
          step="1"
          onkeypress="return event.charCode >= 48 && event.charCode <= 57"
          required
        />
      </div>

      <div class="text grid__col grid__col--8-of-8">
        <button type="button" id="set_mode">Set</button>
      </div>
      <div class="title grid__col grid__col--8-of-8">Status</div>
      <div class="label grid__col grid__col--2-of-8">System Uptime(HH:MM:SS)</div>
      <div id="up_time" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">MoCa</div>
      <div class="checkbox">
        <input type="checkbox" id="moca" />
        <label for="moca"> </label>
      </div>
      <div id="moca_status" class="text grid__col grid__col--4-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">GZ enabled</div>
      <div class="checkbox">
        <input type="checkbox" id="gz" />
        <label for="gz"> </label>
      </div>
      <div id="gz_status" class="text grid__col grid__col--4-of-8">-</div>
      <div class="title grid__col grid__col--8-of-8">Store in cache</div>
      <div class="label grid__col grid__col--2-of-8">Key</div>
      <div class="text grid__col grid__col--4-of-8">
        <input id="set_key" required />
      </div>
      <div class="label grid__col grid__col--2-of-8"></div>
      <div class="label grid__col grid__col--2-of-8">Value</div>
      <div class="text grid__col grid__col--4-of-8">
        <input id="set_value" type="number" min="0" required />
      </div>
      <div class="label grid__col grid__col--2-of-8"></div>
      <div class="text grid__col grid__col--8-of-8">
        <button type="button" id="set_cache">Set</button>
      </div>
      <div class="title grid__col grid__col--8-of-8">Get/Remove cache value</div>
      <div class="label grid__col grid__col--2-of-8">Key</div>
      <div class="text grid__col grid__col--4-of-8">
        <input id="get_key" required />
        <button type="button" id="get_cache">Get</button>
        <button type="button" id="remove_cache">Remove</button>
      </div>
      <div class="label grid__col grid__col--2-of-8"></div>
      <div class="label grid__col grid__col--2-of-8">Value</div>
      <div id="get_value" class="text grid__col grid__col--6-of-8">-</div>
      <div class="title grid__col grid__col--8-of-8">Previous Reboot Info</div>
      <div class="label grid__col grid__col--2-of-8">Source</div>
      <div id="src" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Reboot Reason</div>
      <div id="reboot_reason" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Custom Reason</div>
      <div id="cust_reason" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Last Hard Power Reset</div>
      <div id="hard_reset" class="text grid__col grid__col--6-of-8">-</div>
      <div class="title grid__col grid__col--8-of-8">Temperature</div>
      <div class="label grid__col grid__col--2-of-8">Core Temperature</div>
      <div id="core_temp" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Warning Temperature</div>
      <div id="warn_temp" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Maximum Temperature</div>
      <div id="max_temp" class="text grid__col grid__col--6-of-8">-</div>
      <div class="title grid__col grid__col--8-of-8">RFC Configuration</div>
      <div class="label grid__col grid__col--2-of-8">Account ID</div>
      <div id="account_ID" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">UPNP Enabled</div>
      <div id="upnp" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Allow open ports</div>
      <div id="open_port" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Total Memory</div>
      <div id="total_memory" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Free Memory</div>
      <div id="free_memory" class="text grid__col grid__col--6-of-8">-</div>
      <div class="title grid__col grid__col--8-of-8">State Info</div>
      <div class="label grid__col grid__col--2-of-8">Property name</div>
      <div class="text grid__col grid__col--4-of-8">
        <select id="property_name" class="grid__col--5-of-8">
          <option value="com.comcast.channel_map">com.comcast.channel_map</option>
          <option value="com.comcast.tune_ready">com.comcast.tune_ready</option>
          <option value="com.comcast.card.disconnected">com.comcast.card.disconnected</option>
          <option value="com.comcast.cmac">com.comcast.cmac</option>
          <option value="com.comcast.time_source">com.comcast.time_source</option>
          <option value="com.comcast.estb_ip">com.comcast.estb_ip</option>
          <option value="com.comcast.ecm_ip">com.comcast.ecm_ip</option>
          <option value="com.comcast.dsg_ca_tunnel">com.comcast.dsg_ca_tunnel</option>
          <option value="com.comcast.cable_card">com.comcast.cable_card</option>
        </select>
        <button type="button" id="get_property">Get</button>
      </div>
      <div class="label grid__col grid__col--2-of-8"></div>
      <div class="label grid__col grid__col--2-of-8">Property Value</div>
      <div id="property_value" class="text grid__col grid__col--6-of-8">-</div>
      `;
    this.mainDiv.innerHTML = this.template;
    this.buildType = document.getElementById('build_type');
    this.estbMac = document.getElementById('estb_mac');
    this.imgVersion = document.getElementById('img_version');
    this.modelNumber = document.getElementById('model_number');
    this.rxVersion = document.getElementById('rx_version');
    this.serialNumber = document.getElementById('serial_number');
    this.timeZone = document.getElementById('time_zone');
    this.updateAvailable = document.getElementById('update_available');
    this.updateVersion = document.getElementById('update_version');
    this.updateState = document.getElementById('update_state');
    this.standbyMode = document.getElementById('standby_mode');
    this.moca = document.getElementById('moca');
    this.mocaStatus = document.getElementById('moca_status');
    this.gz = document.getElementById('gz');
    this.gzStatus = document.getElementById('gz_status');
    this.setKey = document.getElementById('set_key');
    this.setValue = document.getElementById('set_value');
    this.getKey = document.getElementById('get_key');
    this.getValue = document.getElementById('get_value');
    this.setCacheButton = document.getElementById('set_cache');
    this.removeCacheButton = document.getElementById('remove_cache');
    this.deepSleep = document.getElementById('deep_sleep');
    this.setStandbyButton = document.getElementById('set_standby');
    this.upTime = document.getElementById('up_time');
    this.availModes = document.getElementById('avail_modes');
    this.powerStates = document.getElementById('power_states');
    this.setPowerButton = document.getElementById('set_power');
    this.powerMode = document.getElementById('power_mode');
    this.mode = document.getElementById('mode');
    this.setModeButton = document.getElementById('set_mode');
    this.modeList = document.getElementById('mode_list');
    this.modeDuration = document.getElementById('mode_dur');
    this.getCacheButton = document.getElementById('get_cache');
    this.rebootSrc = document.getElementById('src');
    this.rebootReason = document.getElementById('reboot_reason');
    this.custReason = document.getElementById('cust_reason');
    this.hardReset = document.getElementById('hard_reset');
    this.coreTemp = document.getElementById('core_temp');
    this.warnTemp = document.getElementById('warn_temp');
    this.maxTemp = document.getElementById('max_temp');
    this.accountID = document.getElementById('account_ID');
    this.upnp = document.getElementById('upnp');
    this.allowPorts = document.getElementById('open_port');
    this.totalMemory = document.getElementById('total_memory');
    this.freeMemory = document.getElementById('free_memory');
    this.propertyValue = document.getElementById('property_value');
    this.propertyName = document.getElementById('property_name');
    this.getPropertyButton = document.getElementById('get_property');
    this.update();
    this.getSystemVersion();
    this.moca.onclick = this.mocaMask.bind(this);
    this.gz.onclick = this.gzMask.bind(this);
    this.setCacheButton.onclick = this.setCacheKey.bind(this);
    this.setStandbyButton.onclick = this.setStandby.bind(this);
    this.setPowerButton.onclick = this.setPowerState.bind(this);
    this.setModeButton.onclick = this.setMode.bind(this);
    this.getCacheButton.onclick = this.getCacheValue.bind(this);
    this.removeCacheButton.onclick = this.removeCache.bind(this);
    this.getPropertyButton.onclick = this.getPropertyValue.bind(this);
    this.propertyName.onchange = () => {
      this.propertyValue.innerHTML = '-';
    };
    this.updateTimer = setInterval(() => {
      this.getUpTime();
    }, 1000);
    this.getAvailStandbyModes();
    this.getPowerState();
    this.systemModeChanged = this.api.t.on(this.callsign, 'onSystemModeChanged', () => {
      this.getMode();
    });
    this.systemPowerChanged = this.api.t.on(this.callsign, 'onSystemPowerStateChanged', () => {
      this.getPowerState();
    });
    this.onFirmwareUpdateInfo = this.api.t.on(this.callsign, ' onFirmwareUpdateInfoReceived', notification => {
      if (notification.updateAvailable == 1) {
        this.updateAvailable.innerHTML = 'YES';
      } else {
        this.updateAvailable.innerHTML = 'NO';
      }
      this.updateVersion.innerHTML = notification.firmwareUpdateVersion;
    });
    this.onUpdateState = this.api.t.on(this.callsign, 'onFirmwareUpdateStateChange', notification => {
      this.updateState.innerHTML = this.updateStateList[notification.firmwareUpdateStateChange];
    });
  }

  update() {
    this.getXConf();
    this.getMoca();
    this.getStandbyMode();
    this.getPowerState();
    this.getGZ();
    this.getMode();
    this.prevRebootInfo();
    this.getTempInfo();
    this.getSerialNmmber();
    this.getTimeZone();
    this.getRFCConfig();
    this.getDeepSleepReason();
    this.getFirmwareUpdateInfo();
    this.getFirmwareUpdateState();
  }

  getXConf() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getXconfParams',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.buildType.innerHTML = result.xconfParams.env;
        this.estbMac.innerHTML = result.xconfParams.eStbMac;
        this.imgVersion.innerHTML = result.xconfParams.firmwareVersion;
        this.modelNumber.innerHTML = result.xconfParams.model;
      }
    });
  }

  getSystemVersion() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSystemVersions',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.rxVersion.innerHTML = result.receiverVersion;
      }
    });
  }

  getMoca() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'queryMocaStatus',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        if (result.mocaEnabled) {
          this.moca.checked = true;
          this.mocaStatus.innerHTML = 'Enabled';
        } else {
          this.moca.checked = false;
          this.mocaStatus.innerHTML = 'Disabled';
        }
      }
    });
  }

  setMoca(bool) {
    const _rest = {
      method: 'PUT',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'enableMoca',
      params: { value: bool },
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (!result.success) {
        alert('Action failed');
      }
      this.getMoca();
    });
  }

  getGZ() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'isGzEnabled',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        if (result.enabled) {
          this.gz.checked = true;
          this.gzStatus.innerHTML = 'Enabled';
        } else {
          this.gz.checked = false;
          this.gzStatus.innerHTML = 'Disabled';
        }
      }
    });
  }

  setGZ(bool) {
    const _rest = {
      method: 'PUT',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setGzEnabled',
      params: { enabled: bool },
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (!result.success) {
        alert('Action failed');
      }
      this.getGZ();
    });
  }

  setCache() {
    const _rest = {
      method: 'PUT',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: '',
      params: { value: bool },
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (!result.success) {
        alert('Action failed');
      }
      this.getMoca();
    });
  }

  getStandbyMode() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getPreferredStandbyMode',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.standbyMode.innerHTML = result.preferredStandbyMode;
      }
    });
  }

  getAvailStandbyModes() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getAvailableStandbyModes',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.supportedStandbyModes && result.supportedStandbyModes.length > 0) {
        result.supportedStandbyModes.forEach(d => {
          var newStandByChild = this.availModes.appendChild(document.createElement('option'));
          newStandByChild.innerHTML = d;
        });
      }
    });
  }

  setStandby() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setPreferredStandbyMode',
      params: { standbyMode: this.availModes.value },
    };

    return this.api.req(_rest, _rpc).then(result => {
      this.getStandbyMode();
    });
  }

  getPowerState() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getPowerState',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.powerMode.innerHTML = result.powerState;
      }
    });
  }

  setPowerState() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setPowerState',
      params: { powerState: this.powerStates.value, standbyReason: 'APIUnitTest' },
    };

    return this.api.req(_rest, _rpc);
  }

  getMode() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getMode',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.mode.innerHTML = result.modeInfo.mode;
      }
    });
  }

  setMode() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setMode',
      params: { modeInfo: { mode: this.modeList.value, duration: parseInt(this.modeDuration.value) } },
    };

    return this.api.req(_rest, _rpc);
  }

  getUpTime() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'requestSystemUptime',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.upTime.innerHTML = new Date(result.systemUptime * 1000).toISOString().substr(11, 8);
      }
    });
  }

  mocaMask() {
    if (this.moca.checked) {
      this.setMoca(true);
    } else if (!this.moca.checked) {
      this.setMoca(false);
    }
  }

  gzMask() {
    if (this.gz.checked) {
      this.setGZ(true);
    } else if (!this.gz.checked) {
      this.setGZ(false);
    }
  }

  setCacheKey() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setCachedValue',
      params: { key: this.setKey.value, value: this.setValue.value },
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.upTime.innerHTML = result.systemUptime + 'seconds';
      } else {
        alert('Failed to store');
      }
    });
  }

  getCacheValue() {
    window.clearTimeout(this.timeOut);
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getCachedValue',
      params: { key: this.getKey.value },
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.getValue.innerHTML =
          result[this.getKey.value] == undefined ? 'Value not found' : result[this.getKey.value];
      } else {
        this.getValue.innerHTML = 'Value not found';
      }
      this.timeOut = setTimeout(() => {
        this.getValue.innerHTML = '-';
        this.getKey.value = '';
      }, 5000);
    });
  }

  removeCache() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'removeCacheKey',
      params: { key: this.getKey.value },
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        alert('Successfully removed');
      } else {
        alert('Cannot remove the key-value pair');
      }
    });
  }

  prevRebootInfo() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getPreviousRebootInfo2',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.rebootSrc.innerHTML = result.rebootInfo.source;
        this.rebootReason.innerHTML = result.rebootInfo.reason;
        this.custReason.innerHTML = result.rebootInfo.customReason;
        this.hardReset.innerHTML = result.rebootInfo.lastHardPowerReset;
      }
    });
  }

  getTempInfo() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getTemperatureThresholds',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.coreTemp.innerHTML = result.temperatureThresholds.temperature;
        this.warnTemp.innerHTML = result.temperatureThresholds.WARN;
        this.maxTemp.innerHTML = result.temperatureThresholds.MAX;
      }
    });
  }

  getSerialNmmber() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSerialNumber',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.serialNumber.innerHTML = result.serialNumber;
      }
    });
  }

  getTimeZone() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getTimeZoneDST',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.timeZone.innerHTML = result.timeZone;
      }
    });
  }

  getRFCConfig() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getRFCConfig',
      params: {
        rfcList: [
          'Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.AccountInfo.AccountID',
          'Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.UPnP.Enabled',
          'Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.AllowOpenPorts.Enabled',
          'Device.DeviceInfo.MemoryStatus.Total',
          'Device.DeviceInfo.MemoryStatus.Free',
        ],
      },
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.accountID.innerHTML =
          result.RFCConfig['Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.AccountInfo.AccountID'];
        this.upnp.innerHTML = result.RFCConfig['Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.UPnP.Enabled'];
        this.allowPorts.innerHTML =
          result.RFCConfig['Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.Feature.AllowOpenPorts.Enabled'];
        this.totalMemory.innerHTML = result.RFCConfig['Device.DeviceInfo.MemoryStatus.Total'];
        this.freeMemory.innerHTML = result.RFCConfig['Device.DeviceInfo.MemoryStatus.Free'];
      }
    });
  }

  getDeepSleepReason() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getLastDeepSleepReason',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.deepSleep.innerHTML = result.lastDeepSleepReason;
      }
    });
  }

  getPropertyValue() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getStateInfo',
      params: { param: this.propertyName.value },
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.propertyValue.innerHTML = result[this.propertyName.value];
      }
    });
  }

  getFirmwareUpdateInfo() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getFirmwareUpdateInfo',
      params: { GUID: '1234abcd' },
    };

    return this.api.req(_rest, _rpc);
  }

  getFirmwareUpdateState() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getFirmwareUpdateState',
    };

    return this.api.req(_rest, _rpc);
  }

  close() {
    window.clearInterval(this.updateTimer);
    window.clearTimeout(this.timeOut);
    if (this.systemModeChanged && typeof this.systemModeChanged.dispose === 'function')
      this.systemModeChanged.dispose();
    if (this.systemPowerChanged && typeof this.systemPowerChanged.dispose === 'function')
      this.systemPowerChanged.dispose();
    if (this.onFirmwareUpdateInfo && typeof this.onFirmwareUpdateInfo.dispose === 'function')
      this.onFirmwareUpdateInfo.dispose();
    if (this.onUpdateState && typeof this.onUpdateState.dispose === 'function') this.onUpdateState.dispose();
  }
}

export default SystemServices;
