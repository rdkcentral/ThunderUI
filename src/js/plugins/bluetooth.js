/** The bluetooth plugin provides details on the available bluetooth devices, scans for new devices and allows the user to connect the device through UI
*/
class BluetoothControl extends Plugin {

    constructor(pluginData) {
        super(pluginData);

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
        this.connectedDeviceList       = document.getElementById('BT_ConnectedDevices');

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
        api.req('GET', api.getURLStart('http') + this.callsign, null,
                     'BluetoothControl.1.status', {}, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined)
                return;

            if(resp.devices !== undefined) {
                this.discoveredDevices = resp.devices;
                this.renderDiscoveredDevices();
                this.renderPairedDevices();
                this.renderConnectedDevices();
            }

            if (typeof resp.scanning === 'boolean')
                this.scanning = resp.scanning;
                this.devStatus = resp.devices;
                this.renderStatus();
        });
    }


    /* ----------------------------- RENDERING ------------------------------*/

    renderStatus () {
        if (this.devStatus !== undefined) {
            for (var i =0; i<this.devStatus.length;i++) {
                if (this.devStatus[i].connected =="true") {
                    this.disconnectButton.disabled = false;
                }
            }
        }
        this.scanningStatus.innerHTML = this.scanning === true ? 'ON' : 'OFF';
        if(!this.scanning) {
            this.scanButton.disabled = false;
            clearInterval(this.Timer);
	    }
    }

    renderDiscoveredDevices () {
        this.discoveredDeviceList.innerHTML = '';
        for (var i=0; i<this.discoveredDevices.length; i++) {
            var newChild = this.discoveredDeviceList.appendChild(document.createElement("option"));
            if (this.discoveredDevices[i].name === "")
                newChild.innerHTML = `${this.discoveredDevices[i].address}`;
            else
                newChild.innerHTML = `${this.discoveredDevices[i].name}`;
        }
    }

    renderPairedDevices () {
        this.pairedDeviceList.innerHTML = '';
        if(this.discoveredDevices.length !==0){
            this.pairButton.disabled = false;
        }
        for (var i=0; i<this.discoveredDevices.length; i++) {
            if(this.discoveredDevices[i].paired) {
                var newChild = this.pairedDeviceList.appendChild(document.createElement("option"));
                this.pairedDevices.push( this.discoveredDevices[i]);
                if (this.discoveredDevices[i].name === "")
                    newChild.innerHTML = `${this.discoveredDevices[i].address}`;
                else
                    newChild.innerHTML = `${this.discoveredDevices[i].name}`;
                this.pairButton.disabled = false;
            }
        }
        if(this.pairedDevices.length !== 0)
            this.connectButton.disabled = false;
    }

    renderConnectedDevices () {
        this.connectedDeviceList.innerHTML = '';
        this.connectedDevices = [];
        if(this.pairedDevices.length !==0){
            this.connectButton.disabled = false;
        }
        for (var i=0; i<this.discoveredDevices.length; i++) {
            if(this.discoveredDevices[i].connected) {
                var newChild = this.connectedDeviceList.appendChild(document.createElement("option"));
                this.connectedDevices.push( this.discoveredDevices[i]);
                if (this.discoveredDevices[i].name === "")
                    newChild.innerHTML = `${this.discoveredDevices[i].address}`;
                else
                    newChild.innerHTML = `${this.discoveredDevices[i].name}`;
            }
        }

        if(this.connectedDevices.length ===0){
            this.disconnectButton.disabled = true;
        } else {
            this.disconnectButton.disabled = false;
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
        var f = document.getElementById("BT_DeviceType");
        var device = f.options[f.selectedIndex].value;

        api.req('PUT', api.getURLStart('http') + this.callsign +'/Scan/?LowEnergy='+device,
                     null,'BluetoothControl.1.status',{}, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }
            this.scanButton.disabled = true;
            setTimeout(this.update.bind(this), 100);
            // update every 3s
            this.Timer = setInterval(this.update.bind(this), 3000);
        });
    }

    pairDevice() {
        var idx = this.discoveredDeviceList.selectedIndex;
        if (this.discoveredDevices[idx].name === "")
            this.status(`Pairing to ${this.discoveredDevices[idx].address}`);
        else
            this.status(`Pairing to ${this.discoveredDevices[idx].name}`);
        var body = '{"address" : "' + this.discoveredDevices[idx].address + '"}'
	    api.req('PUT',api.getURLStart('http') + this.callsign + '/Pair',body,
                     'BluetoothControl.1.status',{}, (err,resp) =>{
        if (err !== null) {
                console.error(err);
                return;
            }
            this.pairButton.disabled = true;
            setTimeout(this.update.bind(this), 1000);
            this.connectButton.disabled = false;
            });
    }

    connect() {
        var idx = this.pairedDeviceList.selectedIndex;
        if (this.pairedDevices[idx].name === "")
            this.status(`Connecting to ${this.pairedDevices[idx].address}`);
        else
            this.status(`Connecting to ${this.pairedDevices[idx].name}`);

        var body = '{"address" : "' + this.pairedDevices[idx].address + '"}'
        api.req('PUT',api.getURLStart('http') + this.callsign + '/Connect', body,
                     'BluetoothControl.1.status',{},(err,resp) =>{
            if (err !== null) {
                console.error(err);
                return;
            }
            setTimeout(this.update.bind(this), 1000);
            this.disconnectButton.disabled = false;
        });
    }

    disconnect() {
        var idx = this.connectedDeviceList.selectedIndex;
        if (this.connectedDevices[idx].name === "")
            this.status(`Disconnecting to ${this.connectedDevices[idx].address}`);
        else
            this.status(`Disconnecting to ${this.connectedDevices[idx].name}`);

        var body = '{"address"  : "' + this.connectedDevices[idx].address + '"}';
        api.req('DELETE',api.getURLStart('http') + this.callsign + '/Connect', body,
                        'BluetoothControl.1.status',{}, (err,resp) =>{
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

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.BluetoothControl = BluetoothControl;
