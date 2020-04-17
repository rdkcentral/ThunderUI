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
/** The WebKitBrowser plugin renders webkit information and provides control to the WPE WebKit browser
 */

import Plugin from '../core/plugin.js';

class Spark extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
        this.url = '';
        this.isHidden = false;
        this.isSuspended = false;
        this.lastSetUrlKey = 'lastSetUrl' + this.callsign;
        this.lastSetUrl = window.localStorage.getItem(this.lastSetUrlKey) || '';

        this.template = `<div id="content_{{callsign}}" class="grid">

            <div class="title grid__col grid__col--8-of-8">Presets / URL</div>

            <div class="label grid__col grid__col--2-of-8">
                <label for="{{callsign}}_url">Custom URL</label>
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="text" id="{{callsign}}_url" size="20"/>
                <button id="{{callsign}}_button" type="button">SET</button>
            </div>

            <div class="label grid__col grid__col--2-of-8">URL presets</div>
            <div class="text grid__col grid__col--6-of-8">
                <select id="{{callsign}}_linkPresets"></select>
            </div>

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
        </div>`;

        this.presets = [
            { Name:"Select a preset",   URL:""},
            { Name:"http://www.sparkui.org/examples/gallery/picturepile.js",        URL:"http://www.sparkui.org/examples/gallery/picturepile.js"},
            { Name:"http://www.sparkui.org/examples/gallery/gallery.js",            URL:"http://www.sparkui.org/examples/gallery/gallery.js"},
        ];

        //setup notifications
        this.sparkUrlListener = this.api.t.on('Spark', 'urlchange', data => {
            if (data.url && data.loaded) {
                this.url = data.url;
                this.handleNotification();
            }
        });

        this.sparkVisibilityListener = this.api.t.on('Spark', 'visibilitychange', data => {
            if (typeof data.hidden === 'boolean') {
                this.isHidden = data.hidden;
                this.handleNotification();
            }
        });

        this.sparkStateListener = this.api.t.on('Spark', 'statechange', data => {
            if (typeof data.suspended === 'boolean') {
                this.isSuspended = data.suspended;
                this.handleNotification();
            }
        });
    }

    handleNotification(json) {
        if (this.rendered === false)
            return;

        this.update();
    }

    render()        {
        var mainDiv = document.getElementById('main');
        var sparkHtmlString = this.template.replace(/{{callsign}}/g, this.callsign);
        mainDiv.innerHTML = sparkHtmlString;

        //updateUrl
        document.getElementById(this.callsign + '_url').value = this.lastSetUrl;

        // bind the button
        var urlButton = document.getElementById(this.callsign + '_button');
        urlButton.onclick = this.getAndSetUrl.bind(this);

        // bind dropdown
        var linkPresets = document.getElementById(this.callsign + '_linkPresets');
        linkPresets.onchange = this.getAndSetUrlFromPresets.bind(this);

        // add presets
        var presetsElement = document.getElementById(this.callsign + '_linkPresets');
        if (presetsElement.children.length === 0) {
            for (var j=0; j<this.presets.length; j++) {
                var option = document.createElement('option');
                option.text = this.presets[j].Name;
                option.value = this.presets[j].URL;

                presetsElement.appendChild(option);
            }
        }

        window.addEventListener('keydown', this.handleKey.bind(this));

        var urlInputEl = document.getElementById(this.callsign + '_url');
        urlInputEl.onblur = function() {
            if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = false;
        };

        urlInputEl.onfocus = function() {
            if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = true;
        };

        this.update();

        this.rendered = true;
    }

    close() {
        window.removeEventListener('keydown', this.handleKey.bind(this), false);

        if (this.sparkUrlListener && typeof this.sparkUrlListener.dispose === 'function') this.sparkUrlListener.dispose();
        if (this.sparkStateListener && typeof this.sparkStateListener.dispose === 'function') this.sparkStateListener.dispose();
        if (this.sparkVisibilityListener && typeof this.sparkVisibilityListener.dispose === 'function') this.sparkVisibilityListener.dispose();

        delete this.socketListenerId;
        delete this.isHidden;
        delete this.isSuspended;

        this.rendered = false;
    }

    update() {
        var state = this.isSuspended ? 'Suspended' : 'Resumed';
        var nextState = this.isSuspended ? 'Resume' : 'Suspend';

        var stateEl = document.getElementById(this.callsign + 'StateInfo');
        stateEl.innerHTML = state;

        var suspendButton = document.getElementById(this.callsign + 'SuspendButton');
        suspendButton.innerHTML = nextState.toUpperCase();
        suspendButton.onclick = this.toggleSuspend.bind(this, nextState);

        var visibilityState = this.isHidden ? 'Hidden' : 'Visible';
        var nextVisibilityState = this.isHidden ? 'Show' : 'Hide';

        var visbilityStateEl = document.getElementById(this.callsign + 'VisibilityStateInfo');
        visbilityStateEl.innerHTML = visibilityState.toUpperCase();

        var visibilityButton = document.getElementById(this.callsign + 'VisibilityButton');
        visibilityButton.innerHTML = nextVisibilityState.toUpperCase();
        visibilityButton.onclick = this.toggleVisibility.bind(this, nextVisibilityState);
    }

    setUrl(url) {
        if (url === '')
            return;

        console.log('Setting url ' + url + ' for ' + this.callsign);
        document.getElementById(this.callsign + '_linkPresets').selectedIndex = 0;

        const _rest = {
            method  : 'POST',
            path    : this.callsign + '/URL',
            body    : body
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'seturl',
            params : body
        };

        this.api.req(_rest, _rpc);
    }

    getAndSetUrl() {
        this.lastSetUrl = document.getElementById(this.callsign + '_url').value;

        this.setUrl(this.lastSetUrl);
        window.localStorage.setItem(this.lastSetUrlKey, this.lastSetUrl);
    }

    getAndSetUrlFromPresets() {
        var idx = document.getElementById(this.callsign + '_linkPresets').selectedIndex;
        if (idx > 0)
            this.setUrl(this.presets[idx].URL);
    }

    handleKey(e) {
        var input = document.getElementById(`${this.callsign}_url`);

        if (e.which === 13 && input && input === document.activeElement)
            this.getAndSetUrl();
    }

    toggleSuspend(nextState) {
        var self = this;

        if (nextState === 'Resume')
            this.resume();
        else
            this.suspend();
    }

    toggleVisibility(nextState) {
        var self = this;

        if (nextState === 'Show')
            this.show();
        else
            this.hide();
    }
}

export default Spark;
