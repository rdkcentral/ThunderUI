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
/** User Preferences provides UI language related information*/

import Plugin from '../core/plugin.js';

class UserPreferences extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.renderInMenu = true;
    this.displayName = 'User Preferences';
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `
            <div class="title grid__col grid__col--8-of-8">
                User Preferences
            </div>
            <div class="label grid__col grid__col--2-of-8">
                UI Language
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="string" id="ui_language">
                <button id="set_language" type="button">SET</button>
            </div>
            <div class="label grid__col grid__col--2-of-8">
                Current UI language
            </div>
            <div id="current_ui_language" class="text grid__col grid__col--6-of-8">
                -
            </div>
                    `;
    this.current_ui_language = document.getElementById('current_ui_language');
    this.ui_language = document.getElementById('ui_language');
    this.set_language = document.getElementById('set_language');
    this.set_language.onclick = this.updateUIlanguage.bind(this);
    this.update();
  }

  setUIlanguage(language) {
    const _rpc = {
      plugin: this.callsign,
      method: 'setUILanguage',
      params: { language: language },
    };

    return this.api.req(null, _rpc);
  }

  getUILanguage() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getUILanguage',
    };

    return this.api.req(null, _rpc);
  }

  updateUIlanguage() {
    this.setUIlanguage(this.ui_language.value).then(response => {
      this.update();
    });
  }

  update() {
    this.getUILanguage().then(response => {
      this.current_ui_language.innerHTML = response.language;
    });
  }
}

export default UserPreferences;
