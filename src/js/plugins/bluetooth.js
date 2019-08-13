/** The bluetooth plugin provides details on the available bluetooth devices, scans for new devices and allows the user to connect the device through UI
*/

import Plugin from '../core/plugin.js';

class BluetoothControl extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.discoveredDevices = [];
        this.pairedDevices = [];
        this.connectedDevices = [];
        this.devStatus = [];
        this.scanning = false;
        this.displayName = 'BluetoothControl';
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="label grid__col grid__col--2-of-8">
            Device Type
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_DeviceType">
                <option value="1" selected="selected">LOW ENERGY</option>
                <option value="0">REGULAR</option>
            </select>
        </div>

        <div class="title grid__col grid__col--8-of-8">
            Status
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Connected Devices
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_ConnectedDevices"></select>
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Scanning
        </div>
        <div id="BT_Scanning" class="text grid__col grid__col--6-of-8">
            OFF
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Paired devices
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_PairedDevices"></select>
        </div>

        <div class="label grid__col grid__col--2-of-8"></div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_Connect">Connect</button>
            <button type="button" id="BT_Disconnect">Disconnect</button>
        </div>

        <div class="title grid__col grid__col--8-of-8">
            Discovery
        </div>


        <div class="label grid__col grid__col--2-of-8">
            Discovered Devices
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_DiscoveredDevices"></select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_ScanForDevices">Scan</button>
            <button type="button" id="BT_Pair">Pair</button>
        </div>

        <br>

        <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>
        `;


        // bind elements

        // ---- button ----
        this.scanButton                 = document.getElementById('BT_ScanForDevices');
        this.pairButton                 = document.getElementById('BT_Pair');
        this.connectButton              = document.getElementById('BT_Connect');
        this.disconnectButton           = document.getElementById('BT_Disconnect');

        // Bind buttons
        this.scanButton.onclick         = this.scanForDevices.bind(this);
        this.pairButton.onclick         = this.pairDevice.bind(this);
        this.disconnectButton.onclick   = this.disconnect.bind(this);
        this.connectButton.onclick      = this.connect.bind(this);

        // ---- Status -----
        this.scanningStatus             = document.getElementById('BT_Scanning');
        this.statusMessages             = document.getElementById('statusMessages');

        // ---- Connected Devices -----
        this.connectedDeviceList        = document.getElementById('BT_ConnectedDevices');

        // ---- Paired Devices -----
        this.pairedDeviceList           = document.getElementById('BT_PairedDevices');

        // ---- Discovered Devices ----
        this.discoveredDeviceList       = document.getElementById('BT_DiscoveredDevices');

        // Disable buttons
        this.pairButton.disabled = true;
        this.connectButton.disabled = true;
        this.disconnectButton.disabled = true;

        setTimeout(this.update.bind(this), 1000);
    }

    /* ----------------------------- DATA ------------------------------*/

    update() {
        this.status().then( status => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined)
                return;

            if(resp.devices !== undefined) {
                this.discoveredDevices = resp.devices;
                this.renderDevices();
            }

            if (typeof resp.scanning === 'boolean')
                this.scanning = resp.scanning;

            this.renderStatus();
        });
    }


    /* ----------------------------- RENDERING ------------------------------*/

    renderStatus () {
        this.scanningStatus.innerHTML = this.scanning === true ? 'ON' : 'OFF';

        if(!this.scanning) {
            this.scanButton.disabled = false;

	    if (this.discoveredDevices.length)
            this.pairButton.disabled = false;

	    if (this.pairedDevices.length)
            this.connectButton.disabled = false;

	    if (this.connectedDevices.length)
            this.disconnectButton.disabled = false;
            clearInterval(this.Timer);
	    }
    }

    renderDevices() {
        this.pairedDeviceList.innerHTML = '';
        this.discoveredDeviceList.innerHTML = '';
        this.connectedDeviceList.innerHTML = '';
        this.connectedDevices = [];

        for (var i=0; i<this.discoveredDevices.length; i++) {
            var newDeviceChild = this.discoveredDeviceList.appendChild(document.createElement("option"));
            newDeviceChild.innerHTML = this.discoveredDevices[i].name !== '' ? this.discoveredDevices[i].name : this.discoveredDevices[i].address;

            if (this.discoveredDevices[i].paired) {
                var newPairedChild = this.pairedDeviceList.appendChild(document.createElement("option"));
                this.pairedDevices.push( this.discoveredDevices[i]);

                newPairedChild.innerHTML = this.discoveredDevices[i].name !== '' ? this.discoveredDevices[i].name : this.discoveredDevices[i].address;
            }

            if(this.discoveredDevices[i].connected) {
                var newConnectedChild = this.connectedDeviceList.appendChild(document.createElement("option"));
                this.connectedDevices.push( this.discoveredDevices[i]);

                newConnectedChild.innerHTML = this.discoveredDevices[i].name !== '' ? this.discoveredDevices[i].name : this.discoveredDevices[i].address;
            }
        }
    }

    updateStatus(message) {
        window.clearTimeout(this.statusMessageTimer);
        this.statusMessages.innerHTML = message;

        // clear after 5s
        this.statusMessageTimer = setTimeout(this.updateStatus, 5000, '');
    }

    /* ----------------------------- BUTTONS ------------------------------*/

    scanForDevices() {
        this.renderStatus(`Start scanning`);
        var f = document.getElementById("BT_DeviceType");
        var device = f.options[f.selectedIndex].value;

        const _rest = {
            method  : 'PUT',
            path    : '/Scan/?LowEnergy='+device,
            body    : null
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'status',
        };

        this.api.req(_rest, _rpc).then( resp => {
            this.scanButton.disabled = true;
            this.pairButton.disabled = true;
	        this.connectButton.disabled = true;
	        this.disconnectButton.disabled = true;
            setTimeout(this.update.bind(this), 100);
            // update every 3s
            this.Timer = setInterval(this.update.bind(this), 3000);
        });
    }

    pairDevice() {
        var idx = this.discoveredDeviceList.selectedIndex;

        if (this.discoveredDevices[idx].name === "")
            this.renderStatus(`Pairing to ${this.discoveredDevices[idx].address}`);
        else
            this.renderStatus(`Pairing to ${this.discoveredDevices[idx].name}`);

        const _rest = {
            method  : 'PUT',
            path    : '/Pair',
            body    : '{"address" : "' + this.discoveredDevices[idx].address + '"}'
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'pair',
            body   : '{"address" : "' + this.discoveredDevices[idx].address + '"}'
        };

        this.api.req(_rest, _rpc).then( resp => {
            this.pairButton.disabled = true;
            setTimeout(this.update.bind(this), 1000);
        });
    }

    connect() {
        var idx = this.pairedDeviceList.selectedIndex;
        if (this.pairedDevices[idx].name === "")
            this.renderStatus(`Connecting to ${this.pairedDevices[idx].address}`);
        else
            this.renderStatus(`Connecting to ${this.pairedDevices[idx].name}`);

        const _rest = {
            method  : 'PUT',
            path    : '/Connect',
            body    : '{"address" : "' + this.discoveredDevices[idx].address + '"}'
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'connect',
            body   : '{"address" : "' + this.discoveredDevices[idx].address + '"}'
        };

        this.api.req(_rest, _rpc).then( resp => {
            if (err !== null) {
                console.error(err);
                return;
            }
            this.connectButton.disabled = true;
            setTimeout(this.update.bind(this), 1000);
        });
    }

    disconnect() {
        var idx = this.connectedDeviceList.selectedIndex;
        if (this.connectedDevices[idx].name === "")
            this.renderStatus(`Disconnecting to ${this.connectedDevices[idx].address}`);
        else
            this.renderStatus(`Disconnecting to ${this.connectedDevices[idx].name}`);

        const _rest = {
            method  : 'DELETE',
            path    : '/Connect',
            body    : '{"address" : "' + this.discoveredDevices[idx].address + '"}'
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'pair',
            body   : '{"address" : "' + this.discoveredDevices[idx].address + '"}'
        };

        api.req(_rest, _rpc).then( resp => {
            if (err !== null) {
                console.error(err);
                return;
            }
        this.disconnectButton.disabled = true;
        setTimeout(this.update.bind(this), 1000);
        });
    }
    close() {
        clearInterval(this.Timer);
        clearInterval(this.statusMessageTimer);
    }
}

export default BluetoothControl;
