/** The bluetooth plugin provides details on the available bluetooth devices, scans for new devices and allows the user to connect the device through UI
 */
class Bluetooth extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.discoveredDevices = [];
        this.pairedDevices = [];
        this.scanning = false;
        this.connected = undefined;
        this.displayName = 'Bluetooth';
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Status
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Connected to
        </div>
        <div id="BT_Connected" class="text grid__col grid__col--6-of-8"></div>

        <div class="label grid__col grid__col--2-of-8">
            Scanning
        </div>
        <div id="BT_Scanning" class="text grid__col grid__col--6-of-8">
            OFF
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Connected devices
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_Devices"></select>
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

        //bind buttons
        this.scanButton.onclick         = this.scanForDevices.bind(this);
        this.pairButton.onclick         = this.pairDevice.bind(this);
        this.disconnectButton.onclick   = this.disconnect.bind(this);
        this.connectButton.onclick      = this.connect.bind(this);

        // ---- Status -----
        this.connectedStatus            = document.getElementById('BT_Connected');
        this.scanningStatus             = document.getElementById('BT_Scanning');
        this.statusMessages             = document.getElementById('statusMessages');

        // ---- Devices -----
        this.devicesListEl              = document.getElementById('BT_Devices');

        // ---- Discovered Devices ----
        this.discoveredDevicesEl        = document.getElementById('BT_DiscoveredDevices');

        this.checkDeviceScanning();
        this.getPairedDevices();
        setTimeout(this.update.bind(this), 2000);
    }

    /* ----------------------------- DATA ------------------------------*/

    update() {
        api.getPluginData(this.callsign, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined)
                return;

            this.connected = resp.connected;

            if (typeof resp.scanning === 'boolean')
                this.scanning = resp.scanning;

            this.renderStatus();
        });
    }

    getPairedDevices() {
        api.getPluginData(this.callsign + '/PairedDevices', (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined || resp.DeviceList.length < 0)
                return;

            this.pairedDevices = resp.DeviceList;

            this.renderPairedDevices();
        });
    }

    getDiscoveredDevices() {
        if (this.scanning === true) {
            api.getPluginData(this.callsign + '/DiscoveredDevices', (err, resp) => {
                    if (err !== null) {
                    console.error(err);
                    return;
                }

                // bail out if the plugin returns nothing
                if (resp === undefined || resp.DeviceList.length < 0)
                    return;

                this.discoveredDevices = resp.DeviceList;
                this.renderDiscoveredDevices();
            });
        }
    }

    checkDeviceScanning() {
        api.getPluginData(this.callsign, (err, resp) => {
            if (resp.scanning) {
                this.stopScan();
            }
        });
    }

    /* ----------------------------- RENDERING ------------------------------*/

    renderStatus () {
        if (this.connected !== '') {
            var deviceInfo = this.pairedDevices.find(deviceInfo=>deviceInfo.Address==this.connected);
            this.connectedStatus.innerHTML = deviceInfo.Name;
        } else
            this.connectedStatus.innerHTML = 'Not Connected';

        this.scanningStatus.innerHTML = this.scanning === true ? 'ON' : 'OFF';
    }

    renderPairedDevices () {
        this.devicesListEl.innerHTML = '';
        for (var i=0; i<this.pairedDevices.length; i++) {
            var newChild = this.devicesListEl.appendChild(document.createElement("option"));
            if (this.pairedDevices[i].Name === "")
                newChild.innerHTML = `${this.pairedDevices[i].Address}`;
            else
                newChild.innerHTML = `${this.pairedDevices[i].Name}`;
        }
    }

    renderDiscoveredDevices () {
        this.discoveredDevicesEl.innerHTML = '';
        for (var i=0; i<this.discoveredDevices.length; i++) {
            var newChild = this.discoveredDevicesEl.appendChild(document.createElement("option"));
            if (this.discoveredDevices[i].Name === "")
                newChild.innerHTML = `${this.discoveredDevices[i].Address}`;
            else
                newChild.innerHTML = `${this.discoveredDevices[i].Name}`;

            newChild.value = JSON.stringify(this.discoveredDevices[i]);
        }
    }

    status(message) {
        window.clearTimeout(this.statusMessageTimer);
        this.statusMessages.innerHTML = message;

        // clear after 5s
        this.statusMessageTimer = setTimeout(this.status, 5000, '');
    }

    /* ----------------------------- BUTTONS ------------------------------*/

    scanForDevices() {
        this.status(`Start scanning`);
        api.putPlugin(this.callsign, 'Scan', null, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // update after 2s
            setTimeout(this.update.bind(this), 2000);

            // update discovered device list in every 4s
            this.Timer = setInterval(this.getDiscoveredDevices.bind(this), 4000);

            this.status(`Scanning...`);
            // stop scan after 1 min
            setTimeout(this.stopScan.bind(this), 60000);

        });
    }

    stopScan() {
        this.status(`Stopping Scan`);
        api.putPlugin(this.callsign, 'StopScan', null, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            clearInterval(this.Timer);
            setTimeout(this.update.bind(this), 2000);
            this.status(`Scan stopped`);
        });
    }

    pairDevice() {
        var val = JSON.parse(document.getElementById('BT_DiscoveredDevices').value);
        if (val.Name === "")
            this.status(`Pairing with ${val.Address}`);
        else
            this.status(`Pairing with ${val.Name}`);

        api.putPlugin(this.callsign, 'Pair', '{"Address" : "' + val.Address + '"}', (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // update Paired device list after 2s
            setTimeout(this.getPairedDevices.bind(this), 2000);
            setTimeout(this.renderPairedDevices.bind(this), 3000);
        });
    }

    connect() {
        var idx = this.devicesListEl.selectedIndex;

        this.status(`Connecting to ${this.pairedDevices[idx].Name}`);
        api.putPlugin(this.callsign, 'Connect', '{"Address" : "' + this.pairedDevices[idx].Address + '"}', (err,resp) =>{
            if (err !== null) {
                console.error(err);
                return;
            }

            // update after 2s
            setTimeout(this.update.bind(this), 2000);
        });
    }

    disconnect() {
        this.status(`Disconnecting to ${this.connected}`);
        api.deletePlugin(this.callsign, 'Connect', null, (err,resp) =>{
            if (err !== null) {
                console.error(err);
                return;
            }

            // update after 2s
            setTimeout(this.update.bind(this), 2000);
        });
    }

}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Bluetooth = Bluetooth;
