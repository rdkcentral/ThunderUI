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

/**
 *  The Firmware plugin upgrades the firmware
 */
import Plugin from '../core/plugin.js';

class FirmwareManager extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'FirmwareControl';
  }

  render() {
    var mainDiv = document.getElementById('main');
    mainDiv.innerHTML = `
    <div class='title grid__col grid__col--8-of-8'>Upgrade</div>

    <div class='label grid__col grid__col--2-of-8'>Name</div>
    <div class='text grid__col grid__col--6-of-8'>
    <input type='text' id='name' size='20'/>    
    </div>

    <div class='label grid__col grid__col--2-of-8'>Location</div>
    <div class='text grid__col grid__col--6-of-8'>
    <input type='text' id='location' size='20'/>    
    </div>
   
    <div class='label grid__col grid__col--2-of-8'>Progress Interval</div>
    <div class='text grid__col grid__col--6-of-8'>
    <input type='text' id='progressinterval' size='20'/>    
    </div>

    <div class='label grid__col grid__col--2-of-8'>HMAC</div>
    <div class='text grid__col grid__col--6-of-8'>
    <input type='text' id='hmac' size='20'/>    
    </div>

    <div class='label grid__col grid__col--2-of-8'>Type</div>
    <div class='grid__col grid__col--3-of-8'>
      <select id='type' name='type'>
        <option value='CDL'>CDL</option>
        <option value='RCDL'>RCDL</option>       
      </select>
    </div>
    <div class='label grid__col grid__col--3-of-8'></div>
    
    <div class='label grid__col grid__col--2-of-8'></div>
    <div class='grid__col grid__col--6-of-8'>
      <button type='button' id='upgradebutton'>Upgrade</button>
    </div>
    <div id='statusMessages' class='text grid__col grid__col--8-of-8'></div>

    `;
    this.name = document.getElementById('name');
    this.location = document.getElementById('location');
    this.progress_interval = document.getElementById('progressinterval');
    this.hmac = document.getElementById('hmac');
    this.type = document.getElementById('type');
    this.statusMessages = document.getElementById('statusMessages');
    this.upgrade_button = document.getElementById('upgradebutton');
    this.upgrade_button.onclick = this.upgrade.bind(this);

    this.deviceStateListener = this.api.t.on(
      this.callsign,
      'upgradeprogress',
      (notification) => {
        if (notification.error != 'none') {
          this.updateStatus(
            'Status: ' +
            notification.status +
            ' Error: ' +
            notification.error +
            ' Progress:  ' +
            notification.progress
          );
        } else {
          this.updateStatus(
            'Status:' +
            notification.status +
            ' Progress: ' +
            notification.progress
          );
        }
      }
    );
  }

  updateStatus(message) {
    window.clearTimeout(this.statusMessageTimer);
    this.statusMessages.innerHTML = message;
    this.statusMessageTimer = setTimeout(this.updateStatus, 5000, '');
  }

  upgrade() {
    const _rpc = {
      plugin: this.callsign,
      method: 'upgrade',
      params: {
        name: this.name.value,
        location: this.location.value,
        type: this.type.value,
        ...((this.progress_interval.value && this.progress_interval.value.trim()) && {
          progressinterval: this.progress_interval.value,
        }),
        ...((this.hmac.value && this.hmac.value.trim()) && { hmac: this.hmac.value }),
      },
    };

    
    return this.api
      .req(null, _rpc)
      .then((result) => {
        if (result)
          console.log(result);
      })
      .catch((e) => {
        if (e.code) {
          this.updateStatus('Error in upgrade: ' + e.code + ' ' + e.message);
        } else {
          this.updateStatus('Error in upgrade');
        }

      });
  }
}

export default FirmwareManager;
