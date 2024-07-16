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
/** The bluetooth plugin provides details on the available bluetooth devices, scans for new devices and allows the user to connect the device through UI
*/

import Plugin from '../core/plugin.js';

class BluetoothControl extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this._devices = [];
        this.scanning = new Set();
        this.discoverable = new Set();
        this.displayName = 'BluetoothControl';
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `
        <div class="title grid__col grid__col--8-of-8">
            Status
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Scanning
        </div>
        <div id="BT_Scanning" class="text grid__col grid__col--6-of-8">
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Discoverable
        </div>
        <div id="BT_Discoverable" class="text grid__col grid__col--6-of-8">
        </div>

        <div class="title grid__col grid__col--8-of-8">
            Device
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Select device
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_Devices"></select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Name
        </div>
        <div id="BT_Name" class="text grid__col grid__col--6-of-8">
            -
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Type
        </div>
        <div id="BT_Type" class="text grid__col grid__col--6-of-8">
            -
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Connected
        </div>
        <div id="BT_Connected" class="text grid__col grid__col--6-of-8">
            -
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Paired
        </div>
        <div id="BT_Paired" class="text grid__col grid__col--6-of-8">
            -
        </div>

        <div class="label grid__col grid__col--2-of-8">Controls</div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_Connect">Connect</button>
            <button type="button" id="BT_Disconnect">Disconnect</button>
            <button type="button" id="BT_Pair">Pair</button>
            <button type="button" id="BT_Unpair">Unpair</button>
            <button type="button" id="BT_AbortPairing">Abort Pariring</button>
            <button type="button" id="BT_Forget">Forget</button>
        </div>

        <div class="label grid__col grid__col--2-of-8">BLE Remote Control Unit</div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_AssignRemote">Assign</button>
            <button type="button" id="BT_RevokeRemote">Revoke</button>
        </div>

        <div class="label grid__col grid__col--2-of-8">BR/EDR Audio Sink</div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_AssignAudioSink">Assign</button>
            <button type="button" id="BT_RevokeAudioSink">Revoke</button>
        </div>

        <div class="title grid__col grid__col--8-of-8">
            Discovery
        </div>
        <div class="label grid__col grid__col--2-of-8">Bluetooth LowEnergy</div>
        <div class="grid__col grid__col--6-of-8">
            <div class="checkbox">
                <input type="checkbox" id="BT_LE" checked></input>
                <label for="BT_LE"></label>
            </div>
        </div>
        <div class="label grid__col grid__col--2-of-8">Scan</div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_StartScan">Scan</button>
            <button type="button" id="BT_StopScan">Stop</button>
        </div>
        <div class="label grid__col grid__col--2-of-8">Visibility</div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_SetDiscoverable">Discoverable</button>
            <button type="button" id="BT_StopDiscoverable">Stop</button>
        </div>
        <br>

        <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>
        `;

        // bind elements

        // ---- button ----
        this.startScanButton            = document.getElementById('BT_StartScan');
        this.stopScanButton             = document.getElementById('BT_StopScan');
        this.setDiscoverableButton      = document.getElementById('BT_SetDiscoverable');
        this.stopDiscoverableButton     = document.getElementById('BT_StopDiscoverable');
        this.pairButton                 = document.getElementById('BT_Pair');
        this.unpairButton               = document.getElementById('BT_Unpair');
        this.abortPairingButton         = document.getElementById('BT_AbortPairing');
        this.forgetButton               = document.getElementById('BT_Forget');
        this.connectButton              = document.getElementById('BT_Connect');
        this.disconnectButton           = document.getElementById('BT_Disconnect');
        this.btLowEnergyButton          = document.getElementById('BT_LE');
        this.assignRemoteButton         = document.getElementById('BT_AssignRemote');
        this.revokeRemoteButton         = document.getElementById('BT_RevokeRemote');
        this.assignAudioSinkButton      = document.getElementById('BT_AssignAudioSink');
        this.revokeAudioSinkButton      = document.getElementById('BT_RevokeAudioSink');

        // ---- device list ----
        this.deviceList                 = document.getElementById('BT_Devices')
        this.deviceList.onchange        = this.renderDevice.bind(this);

        // Bind buttons
        this.startScanButton.onclick    = this.startScan.bind(this);
        this.stopScanButton.onclick     = this.stopScan.bind(this);
        this.setDiscoverableButton.onclick  = this.setDiscoverable.bind(this);
        this.stopDiscoverableButton.onclick = this.stopDiscoverable.bind(this);
        this.pairButton.onclick         = this.pairDevice.bind(this);
        this.unpairButton.onclick       = this.unpairDevice.bind(this);
        this.abortPairingButton.onclick = this.abortPairingDevice.bind(this);
        this.forgetButton.onclick       = this.forgetDevice.bind(this);
        this.disconnectButton.onclick   = this.disconnect.bind(this);
        this.connectButton.onclick      = this.connect.bind(this);
        this.assignRemoteButton.onclick = this.assignRemote.bind(this);
        this.revokeRemoteButton.onclick = this.revokeRemote.bind(this);
        this.assignAudioSinkButton.onclick = this.assignAudioSink.bind(this);
        this.revokeAudioSinkButton.onclick = this.revokeAudioSink.bind(this);

        // ---- Text fields
        this.nameEl                     = document.getElementById("BT_Name");
        this.typeEl                     = document.getElementById("BT_Type");
        this.connectedEl                = document.getElementById("BT_Connected");
        this.pairedEl                   = document.getElementById("BT_Paired")

        // ---- Status -----
        this.scanningStatus             = document.getElementById('BT_Scanning');
        this.discoverableStatus         = document.getElementById('BT_Discoverable');
        this.statusMessages             = document.getElementById('statusMessages');

        this.scanStartedListener = this.api.t.on("BluetoothControl", "scanstarted", this.scanStarted.bind(this));
        this.scanCompleteListener = this.api.t.on("BluetoothControl", "scancomplete", this.scanComplete.bind(this));
        this.discoverableStartedListener = this.api.t.on("BluetoothControl", "discoverablestarted", this.discoverableStarted.bind(this));
        this.discoverableCompleteListener = this.api.t.on("BluetoothControl", "discoverablecomplete", this.discoverableComplete.bind(this));
        this.deviceStateListener = this.api.t.on("BluetoothControl", "devicestatechange", this.deviceUpdated.bind(this));

        this.update(true)
    }


    /* -------------------------- NOTIFICATIONS ---------------------------*/

    deviceUpdated(params) {
        this.renderDevice()
        this.updateStatus(`${params.address} is ${params.state}`)
    }

    scanStarted(params) {
        this.scanning.add(params.type)
        this.update()
        this.updateStatus(`${params.type} scan in progress...`);
    }

    scanComplete(params) {
        this.scanning.delete(params.type)
        this.update(true)
        this.updateStatus(`${params.type} scan complete`);
    }

    discoverableStarted(params) {
        this.discoverable.add(params.type)
        this.update()
        this.updateStatus(`${params.type} adapter now discoverable...`);
    }

    discoverableComplete(params) {
        this.discoverable.delete(params.type)
        this.update()
        this.updateStatus(`${params.type} adapter no longer discoverable`);
    }

    /* ----------------------------- DATA ------------------------------*/

    devices() {
        const _rpc = {
            plugin : 'BluetoothControl',
            method : 'getdevicelist'
        };

        return this.api.req(null, _rpc).then( devices => {
            // bail out if the plugin returns nothing
            if (devices === undefined)
                return;

            this._devices = []
            if (devices && devices.length)
                devices.forEach( (entry) => { this._devices.push({ address : entry.address, type: entry.type }) });

            return this._devices
        });
    }

    device(address, type) {
        const _rpc = {
            plugin: 'BluetoothControl',
            method: 'getdeviceinfo',
            params: { address: address, type: type }
        }

        return this.api.req(null, _rpc)
    }


    /* ----------------------------- RENDERING ------------------------------*/

    updateDeviceList() {
        this.deviceList.innerHTML = '';

        if (this._devices && this._devices.length){
            this._devices.forEach( (d) => {
                var newDeviceChild = this.deviceList.appendChild(document.createElement("option"));
                newDeviceChild.innerHTML = d.address
            });

            this.renderDevice()
        }
    }

    renderDevice() {
        let idx = this.deviceList.selectedIndex;
        if (idx === -1 || this._devices.length === 0) {
            this.nameEl.innerHTML = '-'
            this.typeEl.innerHTML = '-'
            this.connectedEl.innerHTML = '-'
            this.pairedEl.innerHTML = '-'
            return
        }

        let address = this._devices[idx].address
        let type = this._devices[idx].type
        this.device(address, type).then( (data)=>{
            if (data)
                this._devices[idx] = { address, ...data }

            this.nameEl.innerHTML = this._devices[idx].name
            this.typeEl.innerHTML = this._devices[idx].type
            this.connectedEl.innerHTML = this._devices[idx].connected
            this.pairedEl.innerHTML = this._devices[idx].paired
        })
    }

    updateStatus(message, error = false) {
        window.clearTimeout(this.statusMessageTimer);
        this.statusMessages.innerHTML = message;

        if (error)
            this.statusMessages.style = 'color: red'
        else
            this.statusMessages.style = ''

        // clear after 5s
        this.statusMessageTimer = setTimeout(this.updateStatus, 5000, '');
    }

    update(devices = false) {
        this.scanningStatus.innerHTML = this.scanning.size == 0? "idle" : Array.from(this.scanning).join(', ')
        this.discoverableStatus.innerHTML = this.discoverable.size == 0? "idle" : Array.from(this.discoverable).join(', ')
        if (devices) {
            this.devices().then( () => {
                this.updateDeviceList()
            })
        }
    }

    /* ----------------------------- BUTTONS ------------------------------*/

    startScan() {
        const _rpc = {
            plugin : 'BluetoothControl',
            method : 'scan',
            params : {
                type : this.btLowEnergyButton.checked ? 'LowEnergy' : 'Classic',
                timeout: 12
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    stopScan() {
        const _rpc = {
            plugin : 'BluetoothControl',
            method : 'stopscanning',
            params : {
                type : this.btLowEnergyButton.checked ? 'LowEnergy' : 'Classic'
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    setDiscoverable() {
        const _rpc = {
            plugin : 'BluetoothControl',
            method : 'setdiscoverable',
            params : {
                type : this.btLowEnergyButton.checked ? 'LowEnergy' : 'Classic',
                timeout: 30
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    stopDiscoverable() {
        const _rpc = {
            plugin : 'BluetoothControl',
            method : 'stopdiscoverable',
            params : {
                type : this.btLowEnergyButton.checked ? 'LowEnergy' : 'Classic'
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    pairDevice() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Pairing to ${this._devices[idx].name}`);

        const _rpc = {
            plugin : this.callsign,
            method : 'pair',
            params : {
                "address" : this._devices[idx].address,
                "type" : this._devices[idx].type
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    unpairDevice() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Unpairing ${this._devices[idx].name}`);

        const _rpc = {
            plugin : this.callsign,
            method : 'unpair',
            params : {
                "address" : this._devices[idx].address,
                "type" : this._devices[idx].type
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    abortPairingDevice() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Aborting pairing to ${this._devices[idx].name}`);

        const _rpc = {
            plugin : this.callsign,
            method : 'abortpairing',
            params : {
                "address" : this._devices[idx].address,
                "type" : this._devices[idx].type
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    forgetDevice() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Removing ${this._devices[idx].name}`);

        const _rpc = {
            plugin : this.callsign,
            method : 'forget',
            params : {
                "address" : this._devices[idx].address,
                "type" : this._devices[idx].type
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })

        this.update(true)
    }

    connect() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Connecting to ${this._devices[idx].name}`);

        const _rpc = {
            plugin : this.callsign,
            method : 'connect',
            params : {
                "address" : this._devices[idx].address,
                "type" : this._devices[idx].type
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    disconnect() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Disconnecting from ${this._devices[idx].name}`);

        const _rpc = {
            plugin : this.callsign,
            method : 'disconnect',
            params : {
                "address" : this._devices[idx].address,
                "type" : this._devices[idx].type
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    assignRemote() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Assigning ${this._devices[idx].name} as BLE remote control unit`);

        const _rpc = {
            plugin : 'BluetoothRemoteControl',
            method : 'assign',
            params : {
                "address" : this._devices[idx].address
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    revokeRemote() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Revoking BLE remote ${this._devices[idx].name}`);

        const _rpc = {
            plugin : 'BluetoothRemoteControl',
            method : 'revoke',
            params : {
                "address" : this._devices[idx].address
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    assignAudioSink() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Assigning ${this._devices[idx].name} as BR/EDR audio sink`);

        const _rpc = {
            plugin : 'BluetoothAudio',
            method : 'sink::assign',
            params : {
                "address" : this._devices[idx].address
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    revokeAudioSink() {
        var idx = this.deviceList.selectedIndex;
        this.updateStatus(`Revoking BR/EDR audio sink ${this._devices[idx].name}`);

        const _rpc = {
            plugin : 'BluetoothAudio',
            method : 'sink::revoke',
            params : {
                "address" : this._devices[idx].address
            }
        };

        this.api.req(null, _rpc).catch( e => {
            if (e.message)
                this.updateStatus(`Error: ${e.message}`, true);
        })
    }

    close() {
        clearInterval(this.statusMessageTimer);

        if (this.scanStartedListener && typeof this.scanStartedListener.dispose === 'function') this.scanStartedListener.dispose();
        if (this.scanCompleteListener && typeof this.scanCompleteListener.dispose === 'function') this.scanCompleteListener.dispose();
        if (this.discoverableStartedListener && typeof this.discoverableStartedListener.dispose === 'function') this.discoverableStartedListener.dispose();
        if (this.discoverableCompleteListener && typeof this.discoverableCompleteListener.dispose === 'function') this.discoverableCompleteListener.dispose();
        if (this.deviceStateListener && typeof this.deviceStateListener.dispose === 'function') this.deviceStateListener.dispose();
    }
}

export default BluetoothControl;
