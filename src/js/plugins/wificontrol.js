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
/** The wifi plugin provides details on the available Wifi Adapters, scans for networks and allows the user to join networks through the UI
 */

import Plugin from '../core/plugin.js';

class WifiControl extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
        this.displayName = 'WiFi';

        this.configs = [];
        this.networks = [];
        this.configinfo = [];
        this.connecting = false;
        this.connected = undefined;
        this.scanning = false;
        this.statusMessageTimer = null;
        this.rendered = false;
        this.wlanInterface = 'wlan0'; //FIXME, this can be anything really...

        this.wifiScanListener = this.api.t.on('WifiControl', 'scanresults', (data) => {
            if (this.rendered === true)
                this.getNetworks();
        });

        this.wifiConnectionListener = this.api.t.on('WifiControl', 'connectionchange', (data) => {
            this.connected = data.connected;

            if (this.rendered === true)
                this.update();
        });
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Status
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Connected to
        </div>
        <div id="Wifi_Connected" class="text grid__col grid__col--6-of-8"></div>

        <div class="label grid__col grid__col--2-of-8">
            Scanning
        </div>
        <div id="Wifi_Scanning" class="text grid__col grid__col--6-of-8">
            False
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Wireless networks
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="Wifi_WirelessNetwork"></select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="Wifi_scanForNetworksButton">Scan for networks</button>
        </div>

        <div class="title grid__col grid__col--8-of-8">
            Configs
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Configs
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="Wifi_Configs"></select>
        </div>

        <div id="Wifi_SSID_Label" class="label grid__col grid__col--2-of-8">
            SSID
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="Wifi_SSID" type="text" name="SSID"/>
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Mode
        </div>
        <div id="Wifi_Mode" class="text grid__col grid__col--6-of-8">
        </div>
        <!-- disable for now
        <div class="label grid__col grid__col--2-of-8"></div>
        <div class="label grid__col grid__col--6-of-8">
            <button id="Wifi_ToggleModeButton" type="button">Toggle</button>
        </div>
        -->
        <div class="label grid__col grid__col--2-of-8">
            Hidden
        </div>
        <div id="Wifi_Hidden" class="text grid__col grid__col--6-of-8"></div>
        <div id="Wifi_Method_Label" class="label grid__col grid__col--2-of-8">
            Method
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="Wifi_Method"/>
        </div>
        <div id="Wifi_Password_Label" class="label grid__col grid__col--2-of-8">
            Password
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="Wifi_Password" type="text" name="password"/>
        </div>
        <div class="label grid__col grid__col--2-of-8 toggleButtonLabel">Controls</div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="Wifi_saveButton">Save</button>
            <button type="button" id="Wifi_deleteButton">Remove</button>
        </div>
        <div class="label grid__col grid__col--2-of-8 toggleButtonLabel2"></div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="Wifi_connectButton">Connect</button>
            <button type="button" id="Wifi_disconnectButton">Disconnect</button>
        </div>

        <br>
        <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>
        `;

        // bind elements

        // ---- button ----
        this.scanButton                 = document.getElementById('Wifi_scanForNetworksButton');
        this.saveButton                 = document.getElementById('Wifi_saveButton');
        this.deleteButton               = document.getElementById('Wifi_deleteButton');
        this.connectButton              = document.getElementById('Wifi_connectButton');
        this.disconnectButton           = document.getElementById('Wifi_disconnectButton');
        //this.modeButton                 = document.getElementById('Wifi_ToggleModeButton');

        //bind buttons
        this.scanButton.onclick         = this.scanForNetworks.bind(this);
        this.deleteButton.onclick       = this.deleteConfig.bind(this);
        this.saveButton.onclick         = this.saveConfig.bind(this);
        this.disconnectButton.onclick   = this.disconnect.bind(this);
        this.connectButton.onclick      = this.connect.bind(this);
        //this.modeButton.onclick         = this.toggleMode.bind(this);

        // ---- Status -----
        this.connectedStatus            = document.getElementById('Wifi_Connected');
        this.scanningStatus             = document.getElementById('Wifi_Scanning');
        this.statusMessages             = document.getElementById('statusMessages');

        // ---- Networks -----
        this.networkListEl              = document.getElementById('Wifi_WirelessNetwork');
        this.networkListEl.onchange     = this.renderNetworkDetails.bind(this);

        // ---- Configs ----
        this.configListEl               = document.getElementById('Wifi_Configs');
        this.configListEl.onchange      = this.renderConfigDetails.bind(this);

        // ---- Network info ----
        this.ssidEl                     = document.getElementById('Wifi_SSID');
        this.methodEl                   = document.getElementById('Wifi_Method');
        this.passwordEl                 = document.getElementById('Wifi_Password');
        this.accesspointEl              = document.getElementById('Wifi_Mode');
        this.hiddenEl                   = document.getElementById('Wifi_Hidden');

        this.update();
        setTimeout(this.getNetworks.bind(this), 200);
        setTimeout(this.getConfigs.bind(this), 400);

        this.rendered = true;
    }

    /* ----------------------------- DATA ------------------------------*/
    update() {
        this.status().then( resp => {
            // bail out if the plugin returns nothing
            if (resp === undefined)
                return;

            this.connected = resp.connectedssid;

            if (typeof resp.isscanning === 'boolean')
                this.scanning = resp.isscanning;

            this.renderStatus();
        });
    }

    scanForNetworks() {
        const _rpc = {
            plugin : this.callsign,
            method : 'scan',
        };

        this.api.req(null, _rpc).then( resp => {
            this.update();
            // get the results
            setTimeout(this.getNetworks.bind(this), 5000);
        });
    }

    getConfig(ssid) {
        this.update();

        const _rpc = {
            plugin : this.callsign,
            method : 'config@' + ssid,
        };

        this.api.req(null, _rpc).then( resp => {
            if (resp === undefined)
                return;
            if (resp.config === undefined)
                return;

            this.configinfo.push(resp.config);
            this.renderConfigDetails();
        });
    }

    getConfigs() {
        this.update();

        const _rpc = {
            plugin : this.callsign,
            method : 'configs',
        };

        this.api.req(null, _rpc).then( resp => {
            if (resp === undefined)
                return;
            if (resp.configs === undefined)
                return;

            this.configs = resp.configs;
            this.configinfo = [];
            this.configListEl.innerHTML = '';

            for (var i=0; i<resp.configs.length; i++) {
                var newChild = this.configListEl.appendChild(document.createElement("option"));
                newChild.innerHTML = `${resp.configs[i]}`;
                this.getConfig(`${resp.configs[i]}`);
            }
        });
    }

    getNetworks() {
        this.update();

        const _rpc = {
            plugin : this.callsign,
            method : 'networks'
        };

        this.api.req(null, _rpc).then( resp => {
            // bail out if the plugin returns nothing
            if (resp === undefined)
                return;

            this.networks = [];

            if (this.rendered === false)
                return;

            this.networkListEl.innerHTML = '';
            for (var i=0; i<resp.networks.length; i++) {
                // some networks return /x00/x00/x00/x00 and we're filtering out that at the json parse in core/wpe.js, so lets skip it
                if (resp.networks[i].ssid === '')
                    continue;

                // store the same list in this.networks
                this.networks.push(resp.networks[i]);

                var newChild = this.networkListEl.appendChild(document.createElement("option"));
                newChild.innerHTML = `${resp.networks[i].ssid} (${resp.networks[i].signal})`;
            }
        });
    }

    handleNotification(json) {
        if (this.rendered === false)
            return;

        this.update()
        var data = json.data || {};

        // the event connected just provides an async boolean, rerender the network status
        if (data.event && data.event === 'Connected') {
            this.statusMessage('WLAN connection established');
            this.update();
        }


        // check if we've joined succesfull, else retry DHCP request
        if (data.callsign === 'NetworkControl' && data.data && data.data.interface) {
            if (data.data.ip) {
                if (data.data.interface === wlan) {
                    this.statusMessage('Connection succesfull.');
                    this.joining = false;
                    this.update();
                }
            } else if (data.data.status === 11) {
                // Ignore wlan DHCP failure when not in joining progress
                if (data.data.interface === this.wlanInterface && this.joining === false) return;

                this.statusMessage('DHCP request failure. Retrying...');
                this.requestDHCP();
            }
        }

        if (typeof data.scanning === 'boolean') {
            this.scanning = data.scanning;
            this.renderStatus();
        }

        if (data.event === 'NetworkUpdate') {
            this.getNetworks();
        }

    }

    /* ----------------------------- RENDERING ------------------------------*/

    statusMessage(message) {
        window.clearTimeout(this.statusMessageTimer);
        this.statusMessages.innerHTML = message;

        // clear after 5s
        this.statusMessageTimer = setTimeout(this.statusMessage.bind(this), 5000, '');
    }

    renderStatus () {
        if (this.rendered === false)
            return;

        this.connectedStatus.innerHTML = this.connected !== '' ? this.connected : 'Not Connected';
        this.scanningStatus.innerHTML = this.scanning === true ? 'True' : 'False';
    }

    renderNetworkDetails() {
        var idx = this.networkListEl.selectedIndex;

        this.ssidEl.value = ''
        this.methodEl.innerHTML = '';
        this.passwordEl.value = '';

        if (idx < 0 || this.networks.length <= 0)
            return;

        this.ssidEl.value = this.networks[idx].ssid;
        
        for (var i=0; i<this.networks[idx].security.length; i++) {
            var newChild = this.methodEl.appendChild(document.createElement("option"));
            newChild.innerHTML = this.networks[idx].security[i];
        }
    }

    renderConfigDetails() {
        var idx = this.configListEl.selectedIndex;

        this.ssidEl.value = '';
        this.accesspointEl.innerHTML = '';
        this.hiddenEl.innerHTML = '';
        this.methodEl.innerHTML = '';
        this.passwordEl.value = '';

        if (idx < 0 || this.configs.length === 0) {
            return;
        }

        for (var i=0; i<this.configinfo.length; i++) {
            if (this.configs[idx] == this.configinfo[i].ssid) {

                this.ssidEl.value = this.configs[idx];
                this.accesspointEl.innerHTML = this.configinfo[i].accesspoint === true ? 'Access Point' : 'Client';
                this.hiddenEl.innerHTML = this.configinfo[i].hidden === true ? 'True' : 'False';
                var newChild = this.methodEl.appendChild(document.createElement("option"));
                newChild.innerHTML = this.configinfo[i].method;

                this.passwordEl.value = this.configinfo[i].secret !== undefined ? this.configinfo[i].secret : '';
            }
        }
    }

    /* ----------------------------- BUTTONS ------------------------------*/
    toggleConnectDisconnect() {
        if (this.connected !== '')
            this.disconnect();
        else
            this.connect();
    }

    saveConfig() {
        var self = this;
        var idx = this.networkListEl.selectedIndex;

        var config = {
            ssid : this.ssidEl.value,
            accesspoint : false,
        };

        if (this.passwordEl.value !== '')
            config.secret= this.passwordEl.value;

        config.method = this.methodEl.value;

        const _rpc = {
            plugin : this.callsign,
            method : 'config@' + `${this.ssidEl.value}`,
            params : { 'value': config }
        };

        this.api.req(null, _rpc).then( resp => {
            self.statusMessage(`Saved config for ${this.ssidEl.value}`);
            self.getConfigs();
        });
    }

    deleteConfig() {
        var self = this;
        var idx = this.configListEl.selectedIndex;
        this.statusMessage(`Deleting config ${this.configs[idx].ssid}`);
        var config = {
            ssid : "",
            accesspoint : false,
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'config@' + `${this.configs[idx]}`,
            params : { 'value': config }
        };

        this.api.req(null, _rpc).then( resp => {
            self.connecting = true;
            self.getConfigs();
        });
    }

    requestDHCP() {
        this.statusMessage('Requesting DHCP for wlan0');

        const _rpc = {
            plugin : 'NetworkControl',
            method : 'request',
            params : {
                device: this.wlanInterface
            }
        };

        this.api.req(null, _rpc);
    }

    connect() {
        var idx = this.configListEl.selectedIndex;

        this.statusMessage(`Connecting to ${this.configs[idx]}`);

        const _rpc = {
            plugin : this.callsign,
            method : 'connect',
            params : {
                configssid: this.configs[idx]
            }
        };

        this.api.req(null, _rpc).then( () => {
            this.connecting = true;
            setTimeout(this.requestDHCP.bind(this), 5000);
        });
    }

    disconnect() {
        if (this.connected === undefined || this.connected === '')
            return;

        const _rpc = {
            plugin : this.callsign,
            method : 'disconnect',
            params : {
                configssid: this.connected
            }
        };

        this.statusMessage(`Disconnecting from ${this.connected}`);
        this.api.req(null, _rpc);
    }

    close() {
        this.rendered = false;

        if (this.wifiConnectionListener && typeof this.wifiConnectionListener.dispose === 'function') this.wifiConnectionListener.dispose();
        if (this.wifiScanListener && typeof this.wifiScanListener.dispose === 'function') this.wifiScanListener.dispose();
    }
}

export default WifiControl;
