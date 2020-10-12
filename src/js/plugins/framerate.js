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
/** Frame Rate plugin provides frame rate related data and events.*/

import Plugin from '../core/plugin.js';

class FrameRate extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);

    this.renderInMenu = true;
    this.displayName = 'Frame Rate';
    this.mainDiv = document.getElementById('main');

    this.template = `
			<div class="title grid__col grid__col--8-of-8">
				Frame Rate
			</div>
			<div class="label grid__col grid__col--2-of-8">
				Collection frequency (in ms)
			</div>
			<div class="text grid__col grid__col--6-of-8">
				<input type="number" id="freq" size="20" required />
				<button id="frequency_button" type="button">Start</button>
				<button id="stop_button" type="button">Stop</button>
			</div>
			<div class="label grid__col grid__col--2-of-8">
				Minimum Frame Rate
			</div>
			<div id="Min_FPS" class="text grid__col grid__col--6-of-8">
				-
			</div>
			<div class="label grid__col grid__col--2-of-8">
				Maximum Frame Rate
			</div>
			<div id="Max_FPS" class="text grid__col grid__col--6-of-8">
				-
			</div>
			<div class="label grid__col grid__col--2-of-8">
				Average Frame Rate
			</div>
			<div id="Avg_FPS" class="text grid__col grid__col--6-of-8">
				-
			</div>
			<div class="title grid__col grid__col--8-of-8">
				Update FPS
			</div>
			<div class="label grid__col grid__col--2-of-8">
				Set new FPS
			</div>
			<div class="text grid__col grid__col--6-of-8">
				<input type="number" id="fps" size="20" required>
				<button id="fps_button" type="button">UPDATE</button>
			</div>
            `;
  }

  render() {
    this.mainDiv.innerHTML = this.template;
    this.minFps = document.getElementById('Min_FPS');
    this.maxFps = document.getElementById('Max_FPS');
    this.avgFps = document.getElementById('Avg_FPS');
    this.frequencyButton = document.getElementById('frequency_button');
    this.fpsButton = document.getElementById('fps_button');
    this.stopButton = document.getElementById('stop_button');
    this.fps = document.getElementById('fps');
    this.frequency = document.getElementById('freq');
    this.frequencyButton.onclick = this.set.bind(this);
    this.fpsButton.onclick = this.update.bind(this);
    this.stopButton.onclick = this.stopCollection.bind(this);
    this.onFpsEvent = this.api.t.on(this.callsign, 'onFpsEvent', notification => {
      this.minFps.innerHTML = notification.min;
      this.maxFps.innerHTML = notification.max;
      this.avgFps.innerHTML = notification.average;
    });
  }

  setFrequency(frequency) {
    const _rest = {
      method: 'PUT',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setCollectionFrequency',
      params: { frequency: frequency },
    };

    return this.api.req(_rest, _rpc);
  }

  updateFrequency(fps) {
    const _rest = {
      method: 'PUT',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'updateFps',
      params: { newFpsValue: parseInt(fps) },
    };

    return this.api.req(_rest, _rpc);
  }

  update() {
    this.updateFrequency(this.fps.value);
  }

  set() {
    if (this.frequency.checkValidity()) {
      this.setFrequency(this.frequency.value).then(() => {
        this.stop().then(() => {
          this.start();
        });
      });
    }
  }

  start() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'startFpsCollection',
    };

    return this.api.req(_rest, _rpc);
  }

  stopCollection() {
    this.stop().then(() => {
      this.minFps.innerHTML = '-';
      this.maxFps.innerHTML = '-';
      this.avgFps.innerHTML = '-';
    });
  }

  stop() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'stopFpsCollection',
    };

    return this.api.req(_rest, _rpc);
  }

  close() {
    this.stopCollection();
  }
}

export default FrameRate;
