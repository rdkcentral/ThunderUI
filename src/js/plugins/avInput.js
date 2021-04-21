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
/**AVInput API facilitates interactions with the Parker STB HDMI input.*/

import Plugin from '../core/plugin.js';

class AVInput extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'AV Input';
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `
        <div class="title grid__col grid__col--8-of-8">
        AV Input details
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Number of Inputs
        </div>
        <div id="inputs" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Current Video Mode
        </div>
        <div id="video_mode" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Content Protected
        </div>
        <div id="content_protected" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Active input
        </div>
        <div id="active_input" class="text grid__col grid__col--6-of-8">
        -
        </div>
        `;
    this.inputs = document.getElementById('inputs');
    this.video_mode = document.getElementById('video_mode');
    this.content_protected = document.getElementById('content_protected');
    this.active_input = document.getElementById('active_input');
    this.onAVInputActive = this.api.t.on(this.callsign, 'onAVInputActive', notification => {
      this.active_input.innerHTML = notification.url;
    });
    this.onAVInputInActive = this.api.t.on(this.callsign, 'onAVInputInActive', notification => {
      this.active_input.innerHTML = '-';
    });
    this.update();
  }

  numberOfInputs() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'numberOfInputs',
    };

    return this.api.req(_rest, _rpc);
  }

  numberOfInputs() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'numberOfInputs',
    };

    return this.api.req(_rest, _rpc);
  }

  currentVideoMode() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'currentVideoMode',
    };

    return this.api.req(_rest, _rpc);
  }

  contentProtected() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'contentProtected',
    };

    return this.api.req(_rest, _rpc);
  }

  update() {
    this.numberOfInputs().then(response => {
      this.inputs.innerHTML = response.numberOfInputs;
    });
    this.currentVideoMode().then(response => {
      this.video_mode.innerHTML = response.currentVideoMode;
    });
    this.contentProtected().then(response => {
      this.content_protected.innerHTML = response.isContentProtected;
    });
  }

  close() {
    if (this.onAVInputActive && typeof this.onAVInputActive.dispose === 'function') {
      this.onAVInputActive.dispose();
      this.onAVInputActive = null;
    }
    if (this.onAVInputInActive && typeof this.onAVInputInActive.dispose === 'function') {
      this.onAVInputInActive.dispose();
      this.onAVInputInActive = null;
    }
  }
}

export default AVInput;
