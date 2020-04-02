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
/** The volume control changes the output volume of the device
 */

import Plugin from '../core/plugin.js';

class VolumeControl extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Volume
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Muted
        </div>
        <div id="muted" class="text grid__col grid__col--6-of-8">
            -
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Volume level
        </div>
        <div id="volume" class="text grid__col grid__col--6-of-8">
            -
        </div>

        <div id="provisionLabel" class="label grid__col grid__col--2-of-8">
            Control
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="volumeUp">Up</button>
            <button type="button" id="volumeDown">Down</button>
            <button type="button" id="muteBtn">Mute</button>
        </div>`;

        this.mutedEl          = document.getElementById("muted");
        this.volumeEl         = document.getElementById("volume");
        this.muteBtn          = document.getElementById('muteBtn');
        document.getElementById('volumeUp').onclick = this.volumeChange.bind(this, 10);
        document.getElementById('volumeDown').onclick = this.volumeChange.bind(this, -10);
        muteBtn.onclick = this.mute.bind(this);

        this.update()
    }

    update() {
        this.muted().then( muted => {
            this.mutedEl.innerHTML = muted;
            muteBtn.innerHTML = (muted ? 'Unmute' : 'Mute');
        });

        this.volume().then( volume => {
            this.volumeEl.innerHTML = volume
        });
    }

    muted(mute) {
        const _rpc = {
            plugin : this.callsign,
            method : 'muted'
        };

        if (mute)
            _rpc.params = mute

        return this.api.req(null, _rpc);
    }

    volume(vol) {
        const _rpc = {
            plugin : this.callsign,
            method : 'volume'
        };

        if (vol)
            _rpc.params = vol

        return this.api.req(null, _rpc);
    }

    volumeChange(change) {
        this.volume().then( volume => {
            this.volume( volume + change ).then( this.update() )
        })
    }

    mute() {
        this.muted().then( muted => {
            this.muted( muted ? false : true ).then( this.update() )
        })
    }

}

export default VolumeControl;
