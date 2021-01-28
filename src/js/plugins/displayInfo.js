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

class DisplayInfo extends Plugin {

  constructor(pluginData, api) {
    super(pluginData, api);

    this.renderInMenu = true;
    this.displayName = 'Display Info';
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
           Display general information
          </div>

          <div class="label grid__col grid__col--2-of-8">
            Total GPU
          </div>
          <div id="total_gpu" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
          Free GPU
          </div>
          <div id="free_gpu" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
          Audio Pass through
          </div>
          <div id="audio_pass_through" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
          HDMI display
          </div>
          <div id="hdmi_display" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
          Width
          </div>
          <div id="width" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
          Height
          </div>
          <div id="height" class="text grid__col grid__col--6-of-8">
            -
          </div>

          <div class="label grid__col grid__col--2-of-8">
          HDCP Protection
          </div>
          <div id="hdcp_protection" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
          HDR Type
          </div>
          <div id="hdr_type" class="text grid__col grid__col--6-of-8">
            -
          </div>
            `;

    this.total_gpu = document.getElementById('total_gpu');
    this.free_gpu = document.getElementById('free_gpu');
    this.audio_pass_through = document.getElementById('audio_pass_through');
    this.hdmi_display = document.getElementById('hdmi_display');
    this.width = document.getElementById('width');
    this.height = document.getElementById('height');
    this.hdcp_protection = document.getElementById('hdcp_protection');
    this.hdr_type = document.getElementById('hdr_type');
    this.update();
  }

  displayInfo() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'displayinfo'
    };

    return this.api.req(_rest, _rpc);
  }

  update() {
    this.displayInfo().then(response => {
      this.total_gpu.innerHTML = response.totalgpuram;
      this.free_gpu.innerHTML = response.freegpuram;
      this.audio_pass_through.innerHTML = response.audiopassthrough;
      this.hdmi_display.innerHTML = response.connected;
      this.width.innerHTML = response.width;
      this.height.innerHTML = response.height;
      this.hdcp_protection.innerHTML = response.hdcpprotection;
      this.hdr_type.innerHTML = response.hdrtype;
    });
  }

}

export default DisplayInfo;
