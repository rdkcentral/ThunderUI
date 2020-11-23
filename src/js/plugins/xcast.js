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
/**XCast plugin provides methods and events to support launching application from external source (E.g. DIAL, Alexa, WebPA) */

import Plugin from '../core/plugin.js';

class XCast extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.renderInMenu = true;
    this.displayName = 'XCast';
    this.mainDiv = document.getElementById('main');
  }

  render() {
    this.template = `
      <div class="title grid__col grid__col--8-of-8">XCast</div>
      <div class="label grid__col grid__col--2-of-8">API Version</div>
      <div id="version" class="text grid__col grid__col--6-of-8">-</div>
      <div class="label grid__col grid__col--2-of-8">Quirks</div>
      <div id="quirks" class="text grid__col grid__col--6-of-8">-</div>
      `;
    this.mainDiv.innerHTML = this.template;
    this.version = document.getElementById('version');
    this.quirks = document.getElementById('quirks');
    this.update();
  }

  update() {
    this.getVersion();
    this.getQuirks();
  }

  getVersion() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getApiVersionNumber',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        this.version.innerHTML = result.version;
      } else {
        this.version.innerHTML = 'Not Available';
      }
    });
  }

  getQuirks() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getQuirks',
    };

    return this.api.req(_rest, _rpc).then(result => {
      if (result.success) {
        if (result.quirks.length == 0) {
          this.quirks.innerHTML = '-';
        } else {
          this.quirks.innerHTML = result.quirks.join();
        }
      }
    });
  }
}

export default XCast;
