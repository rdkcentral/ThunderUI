/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Nuuday
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
/** Linear playback control plugin depends upon streamfs_fcc and provide handles for setting/getting channel URI, TSB playback position, trickplay etc. */

import Plugin from '../core/plugin.js';

class LinearPlaybackControl extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.api.t.on('LinearPlaybackControl', 'speedchanged', (data) => {
            this.eventTrickPlaySpeed.innerHTML = data.speed;
        });
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Linear Playback Control
        </div>

        <div class="label grid__col grid__col--2-of-8">Channel presets</div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="linear_channel_presets"></select>
        </div>
            
        <div class="label grid__col grid__col--2-of-8">
            <label for="linear_channel_uri">Channel URI</label>
        </div>

        <div class="text grid__col grid__col--6-of-8">
            <input type="text" id="linear_channel_uri"/>
            <button id="set_channel_button" type="button">SET</button>
            <button id="get_channel_button" type="button">GET</button>
        </div>
            
        <div class="label grid__col grid__col--2-of-8">
            <label for="linear_channel_seek">Seek</label>
        </div>

        <div class="text grid__col grid__col--6-of-8">
            <input type="text" id="linear_channel_seek"/>
            <button id="set_seek_button" type="button">SET</button>
            <button id="get_seek_button" type="button">GET</button>
        </div>
        
        <div class="label grid__col grid__col--2-of-8">
            <label for="trick_play_speed">Trick play speed</label>
        </div>

        <div class="text grid__col grid__col--6-of-8">
            <input type="text" id="trick_play_speed"/>
            <button id="set_trick_play_speed_button" type="button">SET</button>
            <button id="get_trick_play_speed_button" type="button">GET</button>
        </div>

        <div class="title grid__col grid__col--8-of-8">Event data</div>
        <div class="label grid__col grid__col--2-of-8">Trick play speed [s]</div>
        <div id="event_trick_play_speed" class="text grid__col grid__col--6-of-8">-</div>

        <div class="title grid__col grid__col--8-of-8">Status</div>
        <div class="label grid__col grid__col--2-of-8">Trick play speed [s]</div>
        <div id="status_trick_play_speed" class="text grid__col grid__col--6-of-8">-</div>
        <div class="label grid__col grid__col--2-of-8">Seek position [s]</div>
        <div id="status_seek_pos_seconds" class="text grid__col grid__col--6-of-8">-</div>
        <div class="label grid__col grid__col--2-of-8">TSB size [s]</div>
        <div id="status_tsb_size_seconds" class="text grid__col grid__col--6-of-8">-</div>
        <div class="label grid__col grid__col--2-of-8">Seek position [bytes]</div>
        <div id="status_seek_pos_bytes" class="text grid__col grid__col--6-of-8">-</div>
        <div class="label grid__col grid__col--2-of-8">TSB size [bytes]</div>
        <div id="status_tsb_size_bytes" class="text grid__col grid__col--6-of-8">-</div>
        <div class="label grid__col grid__col--2-of-8">TSB size max. [bytes]</div>
        <div id="status_max_tsb_size_bytes" class="text grid__col grid__col--6-of-8">-</div>
        <div class="label grid__col grid__col--2-of-8">Stream source lost</div>
        <div id="status_stream_source_lost" class="text grid__col grid__col--6-of-8">-</div>
        <div class="label grid__col grid__col--2-of-8">Stream source loss count</div>
        <div id="status_stream_source_loss_count" class="text grid__col grid__col--6-of-8">-</div>
        
        <div class="text grid__col grid__col--8-of-8">
            <button id="get_status_button" type="button">Get status</button>
        </div>`;
        
        this.channel_presets = [
            { Name:"Select a channel",   URL:""},
            { Name:"Test Chan 1",   URL:"239.100.0.1"},
            { Name:"Test Chan 2",   URL:"239.100.0.2"},
            { Name:"Test Chan 3",   URL:"239.100.0.3"}
        ];

        var presetsElement = document.getElementById('linear_channel_presets');
        if (presetsElement.children.length === 0) {
            for (var j=0; j<this.channel_presets.length; j++) {
                var option = document.createElement('option');
                option.text = this.channel_presets[j].Name;
                option.value = this.channel_presets[j].URL;
                presetsElement.appendChild(option);
            }
        }

        var channelPresets = document.getElementById('linear_channel_presets');
        channelPresets.onchange = this.setUrlFromPreset.bind(this);

        var setChannelButton = document.getElementById("set_channel_button");
        setChannelButton.onclick = this.setChannel.bind(this);

        var getChannelButton = document.getElementById("get_channel_button");
        getChannelButton.onclick = this.getChannel.bind(this);

        var setSeekButton = document.getElementById("set_seek_button");
        setSeekButton.onclick = this.setSeek.bind(this);

        var getSeekButton = document.getElementById("get_seek_button");
        getSeekButton.onclick = this.getSeek.bind(this);

        var setTrickPlaySpeedButton = document.getElementById("set_trick_play_speed_button");
        setTrickPlaySpeedButton.onclick = this.setTrickPlaySpeed.bind(this);

        var getTrickPlaySpeedButton = document.getElementById("get_trick_play_speed_button");
        getTrickPlaySpeedButton.onclick = this.getTrickPlaySpeed.bind(this);

        var getStatusButton = document.getElementById("get_status_button");
        getStatusButton.onclick = this.getStatus.bind(this);

        this.eventTrickPlaySpeed = document.getElementById('event_trick_play_speed');
    }

    rpcSetChannel(channel) {
        const _rpc = {
            plugin: this.callsign,
            method: 'channel',
            params: {
                'channel': channel
            }

        };

        return this.api.req(null, _rpc);
    }

    rpcSetSeek(seek) {
        const _rpc = {
            plugin : this.callsign,
            method : 'seek',
            params : {
                'seekPosInSeconds' : seek
            }

        };

        return this.api.req(null, _rpc);
    }

    rpcSetTrickPlaySpeed(speed) {
        const _rpc = {
            plugin : this.callsign,
            method : 'trickplay',
            params : {
                'speed' : speed
            }

        };

        return this.api.req(null, _rpc);
    }

    rpcGet(endpoint) {
        const _rpc = {
            plugin: this.callsign,
            method: endpoint
        };
        return this.api.req(null, _rpc);
    }

    setUrlFromPreset() {
        var idx = document.getElementById('linear_channel_presets').selectedIndex;

        if (idx > 0) {
            console.log("Index= " + idx)
            this.rpcSetChannel(this.channel_presets[idx].URL).then( resp => { this.getChannel(); } );
        }
    }

    setChannel() {
        var lastSetUrl = document.getElementById('linear_channel_uri').value;
        var snapshotImage = document.getElementById("set_channel_button");
        this.rpcSetChannel(lastSetUrl)
    }

    getChannel() {
        document.getElementById('linear_channel_uri').value = '-';
        this.rpcGet('channel').then( resp => {
            if (resp === undefined)
                return;

            document.getElementById('linear_channel_uri').value = resp.channel;
        }).catch( error => { alert("Error reading channel endpoint"); });
    }

    setSeek() {
        var lastSetSeek = document.getElementById('linear_channel_seek').value;
        var snapshotImage = document.getElementById("set_seek_button");
        this.rpcSetSeek(lastSetSeek)
    }

    getSeek() {
        document.getElementById('linear_channel_seek').value = '-';
        this.rpcGet('seek').then( resp => {
            if (resp === undefined)
                return;

            document.getElementById('linear_channel_seek').value = resp.seekPosInSeconds;
        }).catch( error => { alert("Error reading seek endpoint"); });
    }

    setTrickPlaySpeed() {
        var lastSetSpeed = document.getElementById('trick_play_speed').value;
        var snapshotImage = document.getElementById("set_trick_play_speed_button");
        this.rpcSetTrickPlaySpeed(lastSetSpeed)
    }

    getTrickPlaySpeed() {
        document.getElementById('trick_play_speed').value = '-';
        this.rpcGet('trickplay').then( resp => {
            if (resp === undefined)
                return;

            document.getElementById('trick_play_speed').value = resp.speed;
        }).catch( error => { alert("Error reading seek endpoint"); });
    }

    getStatus() {
        document.getElementById('status_trick_play_speed').innerHTML = '-';
        document.getElementById('status_seek_pos_seconds').innerHTML = '-';
        document.getElementById('status_tsb_size_seconds').innerHTML = '-';
        document.getElementById('status_seek_pos_bytes').innerHTML = '-';
        document.getElementById('status_tsb_size_bytes').innerHTML = '-';
        document.getElementById('status_max_tsb_size_bytes').innerHTML = '-';
        document.getElementById('status_stream_source_lost').innerHTML = '-';
        document.getElementById('status_stream_source_loss_count').innerHTML = '-';

        this.rpcGet('status').then( resp => {
            if (resp === undefined)
                return;

            document.getElementById('status_trick_play_speed').innerHTML = resp.trickPlaySpeed;
            document.getElementById('status_seek_pos_seconds').innerHTML = resp.seekPosInSeconds;
            document.getElementById('status_tsb_size_seconds').innerHTML = resp.currentSizeInSeconds;
            document.getElementById('status_seek_pos_bytes').innerHTML = resp.seekPosInBytes;
            document.getElementById('status_tsb_size_bytes').innerHTML = resp.currentSizeInBytes;
            document.getElementById('status_max_tsb_size_bytes').innerHTML = resp.maxSizeInBytes;
            document.getElementById('status_stream_source_lost').innerHTML = resp.streamSourceLost;
            document.getElementById('status_stream_source_loss_count').innerHTML = resp.streamSourceLossCount;
        }).catch( error => { alert("Error reading status endpoint"); });
    }
}

export default LinearPlaybackControl;
