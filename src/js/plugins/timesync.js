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
/** The time plugin manages the time set on the device
 */

import Plugin from '../core/plugin.js';

class TimeSync extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.renderInMenu = true;
        this.displayName = 'Time';
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `
          <div class="title grid__col grid__col--8-of-8">
            Time
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Current time
          </div>
          <div id="time" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Source
          </div>
          <div id="source" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Last synced
          </div>
          <div id="synced" class="text grid__col grid__col--6-of-8">
            -
          </div>

          <div class="label grid__col grid__col--2-of-8">
              <label for="settime">Set time</label>
            </div>
          <div class="text grid__col grid__col--6-of-8">
              <input type="text" id="timeinput" size="20"/>
              <button id="setTime" type="button">SET</button>
          </div>

          <div id="syncLabel" class="label grid__col grid__col--2-of-8">
            Control
          </div>
          <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="sync" onclick="">Sync</button>
          </div>`;


      let setButton = document.getElementById('setTime');
      setButton.onclick = this.setTime.bind(this);

      let syncButton = document.getElementById('sync');
      syncButton.onclick = this.syncTime.bind(this);

      this.timeEl         = document.getElementById('time');
      this.sourceEl       = document.getElementById('source');
      this.syncedEl       = document.getElementById('synced');

      // FIXME not documented, guessing
      this.api.t.on('TimeSync', 'update', (data) => {
          console.log('TIME NOT', data);
          this.update();
      });

      this.update();
    }

    syncTime() {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'synctime'
        };

        return this.api.req(_rest, _rpc);
    }

    setTime() {
        let time = document.getElementById('timeinput').value;

        const _rest = {
            method  : 'POST',
            path    : `${this.callsign}`,
            body    : { 'time' : time }
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'time',
            params : time
        };

        return this.api.req(_rest, _rpc);
    }

    getTime() {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'time'
        };

        return this.api.req(_rest, _rpc);
    }

    update() {
        this.getTime().then( data => {
            this.timeEl.innerHTML = data;

            this.syncTime().then( data => {
                this.sourceEl.innerHTML = data.source;
                this.syncedEl.innerHTML = data.time;
            });
        });
    }
}

export default TimeSync;
