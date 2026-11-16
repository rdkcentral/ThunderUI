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
/** Logging Preference plugin allows the server to control key press logging on the set-top box */

import Plugin from '../core/plugin.js';

class LoggingPreferences extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);

    this.renderInMenu = true;
    this.displayName = 'Logging Preferences';
    this.mainDiv = document.getElementById('main');

    this.template = `
			<div class="title grid__col grid__col--8-of-8">
				Logging Preferences
			</div>
			<div class="label grid__col grid__col--2-of-8">
				Keystroke Mask
			</div>
			<div class="checkbox">
				<input type="checkbox" id="LogPreference">
				<label for="LogPreference">
				</label>
			</div>
			<div id="KeyStrokeMaskStatus" class="text grid__col grid__col--2-of-8">
				-
			</div>
            `;
  }

  getKeyStrokeMask() {
    const _rpc = {
      plugin: this.callsign,
      method: 'isKeystrokeMaskEnabled',
    };

    return this.api.req(null, _rpc);
  }

  setKeyStrokeMask(bool) {
    const _rpc = {
      plugin: this.callsign,
      method: 'setKeystrokeMaskEnabled',
      params: { keystrokeMaskEnabled: bool },
    };

    return this.api.req(null, _rpc);
  }

  update() {
    this.getKeyStrokeMask().then(response => {
      if (response.keystrokeMaskEnabled) {
        this.logPreference.checked = true;
        this.keyStroke.innerHTML = 'Enabled';
      } else if (!response.keystrokeMaskEnabled) {
        this.logPreference.checked = false;
        this.keyStroke.innerHTML = 'Disabled';
      }
    });
  }

  render() {
    this.mainDiv.innerHTML = this.template;
    this.keyStroke = document.getElementById('KeyStrokeMaskStatus');
    this.logPreference = document.getElementById('LogPreference');
    this.update();
    this.logPreference.onclick = this.mask.bind(this);
    this.onKeystrokeMaskEnabledChange = this.api.t.on(
      this.callsign,
      'onKeystrokeMaskEnabledChange',
      this.update.bind(this)
    );
  }

  mask() {
    if (this.logPreference.checked) {
      this.setKeyStrokeMask(true);
    } else if (!this.logPreference.checked) {
      this.setKeyStrokeMask(false);
    }
  }
}

export default LoggingPreferences;
