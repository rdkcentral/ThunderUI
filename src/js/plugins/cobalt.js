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
/** The WebKitBrowser plugin renders webkit information and provides control to the WPE WebKit browser
 */

import WebKitBrowser from './webkit.js'

class Cobalt extends WebKitBrowser {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.template = `<div id="content_{{callsign}}" class="grid">

            <div class="title grid__col grid__col--8-of-8">Presets / URL</div>

            <div class="label grid__col grid__col--2-of-8">URL</div>
            <div id="{{callsign}}_current_url" class="text grid__col grid__col--6-of-8">-</div>

            <div class="label grid__col grid__col--2-of-8">
                <label for="{{callsign}}_url">Custom URL</label>
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="text" id="{{callsign}}_url" size="20"/>
                <button id="{{callsign}}_button" type="button">SET</button>
                <button id="{{callsign}}_reloadbutton" type="button">RELOAD</button>
            </div>

            <div class="label grid__col grid__col--2-of-8">URL presets</div>
            <div class="text grid__col grid__col--6-of-8">
                <select id="{{callsign}}_linkPresets"></select>
            </div>

            <div class="title grid__col grid__col--8-of-8">Performance</div>
            <div class="label grid__col grid__col--2-of-8">FPS</div>
            <div id="{{callsign}}_fps" class="text grid__col grid__col--6-of-8">-</div>
            <div id="{{callsign}}Memory" class="memoryInfo"></div>

            <div class="title grid__col grid__col--8-of-8">Tools</div>

            <div class="label grid__col grid__col--2-of-8">Current State</div>
                <div id="{{callsign}}StateInfo" class="text grid__col grid__col--6-of-8"></div>
                <div class="label grid__col grid__col--2-of-8"></div>
                <div class="label grid__col grid__col--6-of-8">
                    <button id="{{callsign}}SuspendButton" type="button"></button>
            </div>

            <div class="label grid__col grid__col--2-of-8">Visibility</div>
            <div id="{{callsign}}VisibilityStateInfo" class="text grid__col grid__col--6-of-8"></div>
            <div class="label grid__col grid__col--2-of-8"></div>
            <div class="text grid__col grid__col--6-of-8">
                <button type="button" id="{{callsign}}VisibilityButton">HIDE</button>
            </div>

            <div class="label grid__col grid__col--2-of-8">Web Inspector</div>
            <div class="text grid__col grid__col--6-of-8">
                <button type="button" id="{{callsign}}Inspector">INSPECT</button>
            </div>

        </div>`;

    }
}

export default Cobalt;
