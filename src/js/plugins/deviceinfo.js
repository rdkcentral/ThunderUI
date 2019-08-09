/** Device info plugin provides device specific information, such as cpu usage and serial numbers */

import Plugin from '../core/Plugin.js';

class DeviceInfo extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.renderInMenu = true;
        this.displayName = 'Device Info';
        this.deviceInfoDiv = undefined;
        this.mainDiv = document.getElementById('main');
        this.selectedNetworkInterface = 0;

        this.deviceNameEl       = undefined;
        this.serialNumberEl     = undefined;
        this.deviceIdEl         = undefined;
        this.versionEl          = undefined;
        this.uptimeEl           = undefined;
        this.totalRamEl         = undefined;
        this.usedRamEl          = undefined;
        this.freeRamEl          = undefined;
        this.usedGpuRamEl       = undefined;
        this.freeGpuRamEl       = undefined;
        this.totalGpuRamEl      = undefined;
        this.cpuLoadEl          = undefined;

        this.interfacesOptsEl   = undefined;
        this.macIdEl            = undefined;
        this.ipAddressEl        = undefined;

        this.template = `<div class="title grid__col grid__col--8-of-8">
            Device
          </div>

          <div class="label grid__col grid__col--2-of-8">
            Name
          </div>
          <div id="DeviceName" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            S/N
          </div>
          <div id="SerialNumber" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Identifier
          </div>
          <div id="DeviceId" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Version
          </div>
          <div id="Version" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Network Interface
          </div>
          <div class="text grid__col grid__col--6-of-8">
            <select id="NetworkInterface">
            </select>
          </div>
          <div class="label grid__col grid__col--2-of-8">
            MAC
          </div>
          <div id="MAC_ID" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            IP
          </div>
          <div id="IpAddress" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Uptime
          </div>
          <div id="Uptime" class="text grid__col grid__col--6-of-8">
            -
          </div>

          <div class="title grid__col grid__col--8-of-8">
            RAM
          </div>

          <div class="label grid__col grid__col--2-of-8">
          Total RAM
          </div>
          <div id="TotalRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Used RAM
          </div>
          <div id="UsedRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Free RAM
          </div>
          <div id="FreeRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Total GPU RAM
          </div>
          <div id="TotalGpuRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Used GPU RAM
          </div>
          <div id="UsedGpuRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Free GPU RAM
          </div>
          <div id="FreeGpuRam" class="text grid__col grid__col--6-of-8">
            -
          </div>

          <div class="title grid__col grid__col--8-of-8">
            CPU
          </div>

          <div class="label grid__col grid__col--2-of-8">
            CPU Load
          </div>
          <div id="CpuLoad" class="text grid__col grid__col--6-of-8">
            -
          </div>`;
    }


    status() {
        const _rest = {
            method  : 'GET',
            path    : 'DeviceInfo'
        };

        const _rpc = {
            plugin : 'DeviceInfo',
            method : 'systeminfo'
        };

        return this.api.req(_rest, _rpc);
    }

    systeminfo() {
        const _rest = {
            method  : 'GET',
            path    : 'DeviceInfo'
        };

        const _rpc = {
            plugin : 'DeviceInfo',
            method : 'systeminfo'
        };

        return this.api.req(_rest, _rpc);
    }

    addresses() {
        const _rest = {
            method  : 'GET',
            path    : 'DeviceInfo'
        };

        const _rpc = {
            plugin : 'DeviceInfo',
            method : 'addresses'
        };

        return this.api.req(_rest, _rpc);
    }

    socketinfo() {
        const _rest = {
            method  : 'GET',
            path    : 'DeviceInfo'
        };

        const _rpc = {
            plugin : 'DeviceInfo',
            method : 'socketinfo'
        };

        return this.api.req(_rest, _rpc);
    }

    update() {
        this.status().then( deviceInfo => {
            this.deviceNameEl.innerHTML         = deviceInfo.systeminfo.devicename;
            this.deviceIdEl.innerHTML           = deviceInfo.systeminfo.deviceid;
            this.serialNumberEl.innerHTML       = deviceInfo.systeminfo.serialnumber;
            this.versionEl.innerHTML            = deviceInfo.systeminfo.version;
            this.uptimeEl.innerHTML             = deviceInfo.systeminfo.uptime;
            this.totalRamEl.innerHTML           = this.bytesToMbString(deviceInfo.systeminfo.totalram);
            this.usedRamEl.innerHTML            = this.bytesToMbString(deviceInfo.systeminfo.totalram - deviceInfo.systeminfo.freeram);
            this.freeRamEl.innerHTML            = this.bytesToMbString(deviceInfo.systeminfo.freeram);
            this.totalGpuRamEl.innerHTML        = this.bytesToMbString(deviceInfo.systeminfo.totalgpuram);
            this.freeGpuRamEl.innerHTML         = this.bytesToMbString(deviceInfo.systeminfo.freegpuram);
            this.usedGpuRamEl.innerHTML         = this.bytesToMbString(deviceInfo.systeminfo.totalgpuram - deviceInfo.systeminfo.freegpuram);
            this.cpuLoadEl.innerHTML            = parseFloat(deviceInfo.systeminfo.cpuload).toFixed(1) + " %";

            this.interfacesOptsEl.innerHTML = '';
            for (var i=0; i<deviceInfo.addresses.length; i++) {
                var newChild = this.interfacesOptsEl.appendChild(document.createElement("option"));
                newChild.innerHTML = deviceInfo.addresses[i].name;
            }

            this.interfacesOptsEl.selectedIndex = this.selectedNetworkInterface;

            this.macIdEl.innerHTML = deviceInfo.addresses[this.selectedNetworkInterface].mac;

            if (deviceInfo.addresses[this.selectedNetworkInterface].ip !== undefined)
                this.ipAddressEl.innerHTML = deviceInfo.addresses[this.selectedNetworkInterface].ip;
            else
                this.ipAddressEl.innerHTML = '-';

        });
    }

    render() {
        this.mainDiv.innerHTML = this.template;

        this.deviceNameEl       = document.getElementById("DeviceName");
        this.deviceIdEl         = document.getElementById("DeviceId");
        this.serialNumberEl     = document.getElementById("SerialNumber");
        this.versionEl          = document.getElementById("Version");
        this.uptimeEl           = document.getElementById("Uptime");
        this.totalRamEl         = document.getElementById("TotalRam");
        this.usedRamEl          = document.getElementById("UsedRam");
        this.freeRamEl          = document.getElementById("FreeRam");
        this.totalGpuRamEl      = document.getElementById("TotalGpuRam");
        this.freeGpuRamEl       = document.getElementById("FreeGpuRam");
        this.usedGpuRamEl       = document.getElementById("UsedGpuRam");
        this.cpuLoadEl          = document.getElementById("CpuLoad");

        this.interfacesOptsEl   = document.getElementById("NetworkInterface");
        this.interfacesOptsEl.onchange = this.updateNetworkInterface.bind(this);
        this.macIdEl            = document.getElementById("MAC_ID");
        this.ipAddressEl        = document.getElementById("IpAddress");

        this.update();
    }

    updateNetworkInterface(deviceInfo) {
        this.selectedNetworkInterface = this.interfacesOptsEl.selectedIndex;
        this.update();
    }

    bytesToMbString(bytes) {
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }
}

function name() {
    return  'DeviceInfo';
}

export { name };
export default DeviceInfo;
