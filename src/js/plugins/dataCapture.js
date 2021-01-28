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
/** Data capture plugin allows to capture audio and upload to specified URL. */

import Plugin from '../core/plugin.js';

class DataCapture extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.renderInMenu = true;
    this.displayName = 'Data Capture';
    this.mainDiv = document.getElementById('main');
  }
  render() {
    this.template = `
      <div class="title grid__col grid__col--8-of-8">Set Audio Capture Parameters</div>
      <div class="label grid__col grid__col--2-of-8">Buffer Duration(in seconds)</div>
      <div class="text grid__col grid__col--6-of-8">
        <input
          id="buffer"
          type="number"
          size="20"
          value="0"
          min="1"
          step="1"
          onkeypress="return event.charCode >= 48 && event.charCode <= 57"
          required
        />
        <button type="button" id="set_buffer">Set</button>
      </div>
      <div class="title grid__col grid__col--8-of-8">Get Audio Clip</div>
      <div class="label grid__col grid__col--2-of-8">Stream</div>
      <div class="text grid__col grid__col--6-of-8">
        <select id="stream" class="grid__col--5-of-8">
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
        </select>
      </div>
      <div class="label grid__col grid__col--2-of-8">Capture Mode</div>
      <div class="text grid__col grid__col--6-of-8">
        <select id="capture_mode" class="grid__col--5-of-8">
          <option value="preCapture">Precapture</option>
          <option value="postCapture">Post capture</option>
        </select>
      </div>
      <div class="label grid__col grid__col--2-of-8">Duration(in seconds)</div>
      <div class="text grid__col grid__col--6-of-8">
        <input
          id="duration"
          type="number"
          size="20"
          value="0"
          min="1"
          step="1"
          onkeypress="return event.charCode >= 48 && event.charCode <= 57"
          required
        />
      </div>
      <div class="label grid__col grid__col--2-of-8">URL</div>
      <div class="text grid__col grid__col--6-of-8">
        <input id="url" required />
      </div>
      <div class="text grid__col grid__col--8-of-8">
        <button type="button" id="get_button">Get</button>
      </div>
      <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>
      `;
    this.mainDiv.innerHTML = this.template;
    this.bufferDuration = document.getElementById('buffer');
    this.setBuffer = document.getElementById('set_buffer');
    this.stream = document.getElementById('stream');
    this.duration = document.getElementById('duration');
    this.captureMode = document.getElementById('capture_mode');
    this.uploadUrl = document.getElementById('url');
    this.getButton = document.getElementById('get_button');
    this.statusMessages = document.getElementById('statusMessages');
    this.setBuffer.onclick = this.enableAudioCapture.bind(this);
    this.getButton.onclick = this.getAudioClip.bind(this);
    this.onAudioClipReady = this.api.t.on(this.callsign, 'onAudioClipReady', notification => {
      if (notification.status) {
        this.statusMessage(`Upload success.<br>File name:${notification.fileName}`);
      } else {
        this.statusMessage(notification.message, true);
      }
    });
  }

  enableAudioCapture() {
    console.log(this.bufferDuration.value);
    const _rest = {
      method: 'PUT',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'enableAudioCapture',
      params: { bufferMaxDuration: parseInt(this.bufferDuration.value) },
    };

    return this.api.req(_rest, _rpc).then(result => {
      console.log(result);
      if (result.success) {
        if (result.error == 0) {
          this.statusMessage(`Enabled audio capture`);
        }
      } else {
        if (result.error == 255) {
          this.statusMessage('settop cannot accommodate any level of audio buffering', true);
        } else {
          this.statusMessage(
            `Buffer set failed.Request exceeds maximum allowed buffer size.Maximum supported buffer duration is ${result.error} seconds`,
            true
          );
        }
      }
    });
  }
  getAudioClip() {
    const _rest = {
      method: 'PUT',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getAudioClip',
      params: {
        clipRequest: {
          stream: this.stream.value,
          duration: this.duration.value,
          captureMode: this.captureMode,
          url: this.uploadUrl,
        },
      },
    };

    return this.api.req(_rest, _rpc).then(result => {
      console.log(result);
      if (result.success) {
        this.statusMessage('Request success');
      } else {
        this.statusMessage('Request failed', true);
      }
    });
  }

  statusMessage(message, error = false) {
    window.clearTimeout(this.statusMessageTimer);
    this.statusMessages.innerHTML = message;
    if (error) this.statusMessages.style = 'color: red';
    else this.statusMessages.style = '';
    this.statusMessageTimer = setTimeout(this.statusMessage.bind(this), 3000, '');
  }
  close() {
    window.clearTimeout(this.statusMessageTimer);
    if (this.onAudioClipReady && typeof this.onAudioClipReady.dispose === 'function') this.onAudioClipReady.dispose();
  }
}

export default DataCapture;
