/** The wifi plugin provides details on the available Wifi Adapters, scans for networks and allows the user to join networks through the UI
 */

class Bluetooth extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.devices = [];
        this.displayName = 'Bluetooth';
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Status
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
        this.pairButton                 = document.getElementById('BT_Connect');
        this.connectButton              = document.getElementById('BT_Connect');
        this.disconnectButton           = document.getElementById('BT_Disconnect');

        //bind buttons
        this.scanButton.onclick         = this.scanForDevices.bind(this);
        this.pairButton.onclick         = this.pairDevice.bind(this);
        this.disconnectButton.onclick   = this.disconnect.bind(this);
        this.connectButton.onclick      = this.connect.bind(this);

        // ---- Devices -----
        this.devicesListEl              = document.getElementById('BT_Devices');
        //this.devicesListEl.onchange     = this.renderDeviceDetails.bind(this);

        // ---- Discovered Devices ----
        this.discoveredDevicesEl        = document.getElementById('BT_DiscoveredDevices');
        //this.discoveredDevicesEl.onchange = this.renderConfigDetails.bind(this);

        this.update();
    }

    /* ----------------------------- DATA ------------------------------*/

    update() {
        api.getPluginData(this.callsign + '/ShowDeviceList', (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (this.resp === undefined || this.resp.DeviceInfoList.length > 0)
                return;

            this.devices = this.resp.DeviceInfoList;
            this.renderStatus();
        });
    }

    /* ----------------------------- RENDERING ------------------------------*/

    renderStatus () {
        this.devicesListEl.innerHTML = '';
        for (var i=0; i<this.devices.length; i++) {
            var newChild = this.devicesListEl.appendChild(document.createElement("option"));
            newChild.innerHTML = `${this.devices[i].name}`;
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
        var idx = this.devicesListEl.selectedIndex;
        api.putPlugin(this.callsign, 'StartScan', null, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // get the results
            // FIXME, there should be a seperate API to provide results on the "scanned results". For now go back to this.update
            setTimeout(this.update.bind(this), 5000);
        });
    }

    pairDevice() {
        var idx = this.devicesListEl.selectedIndex;

        this.status(`Pairing with ${this.devices[idx].name}`);

        api.putPlugin(this.callsign, 'PairDevice', this,devices[idx].id, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // get the results
            // FIXME, there should be a seperate API to provide results on the "scanned results"
            setTimeout(this.update.bind(this), 5000);
        });
    }

    connect() {
        var idx = this.devicesListEl.selectedIndex;

        this.status(`Connecting to ${this.devices[idx].name}`);

        api.putPlugin(this.callsign, `Connect/${this.devices[idx].id}`, null, () =>{
            // update after 5s
            setTimeout(this.update.bind(this), 5000);
        });
    }

    disconnect() {
        var idx = this.devicesListEl.selectedIndex;

        this.status(`Connecting to ${this.devices[idx].name}`);

        api.deletePlugin(this.callsign, 'Connect/' + this.connected, null);
    }

}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Bluetooth = Bluetooth;
