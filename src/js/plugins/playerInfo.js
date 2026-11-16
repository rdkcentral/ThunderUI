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
/** Device info plugin provides device specific information, such as cpu usage and serial numbers */

import Plugin from '../core/plugin.js';

class PlayerInfo extends Plugin {

  constructor(pluginData, api) {
    super(pluginData, api);

    this.renderInMenu = true;
    this.displayName = 'Player Info';
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
             Player general information
            </div>
  
            <div class="label grid__col grid__col--2-of-8">
            Audio
            </div>
            <div id="audio" class="text grid__col grid__col--6-of-8">
              -
            </div>
            <div class="label grid__col grid__col--2-of-8">
            Video
            </div>
            <div id="video" class="text grid__col grid__col--6-of-8">
              -
            </div>
            <div class="label grid__col grid__col--2-of-8">
            Dolbymode
            </div>
            <div class="text grid__col grid__col--6-of-8">
            <input type="text" id="dolbymod" size="20"/>
            <button id="dolbymode_button" type="button">SET</button>
            </div>
              `;

    this.audio = document.getElementById('audio');
    this.video = document.getElementById('video');
    this.dolbymod = document.getElementById("dolbymod");
    this.dolbymode_button = document.getElementById("dolbymode_button");
    this.dolbymode_button.onclick = this.setDolbymode.bind(this);
    this.update();
  }

  setDolbymod(dolbymod) {
    if (dolbymod === '')
      return;

    console.log('Setting dolbymod ' + dolbymod + ' for ' + this.callsign);

    const _rpc = {
      plugin: this.callsign,
      method: 'dolbymode',
      params: dolbymod
    };

    this.api.req(null, _rpc);
  }

  setDolbymode() {
    this.setDolbymod(this.dolbymod.value);
  }

  playerInfo() {
    const _rpc = {
      plugin: this.callsign,
      method: 'playerinfo'
    };

    return this.api.req(null, _rpc);
  }

  dolbymodeInfo() {
    const _rpc = {
      plugin: this.callsign,
      method: 'dolbymode'
    };

    return this.api.req(null, _rpc);
  }

  update() {
    this.playerInfo().then(response => {
      this.audio.innerHTML = response.audio[0];
      this.video.innerHTML = response.video[0];
    });
    this.dolbymodeInfo().then(response => {
      this.dolbymod.innerHTML = response;
    });
  }

}

export default PlayerInfo;
