/** Device info plugin provides device specific information, such as cpu usage and serial numbers */

import Plugin from '../core/plugin.js';

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

        this.chartOptions       = {interval: 1000,maxElements: 50}
        this.ramChart           = undefined;
        this.gpuChart           = undefined;
        this.cpuChart           = undefined;
        this.chartIntervalId    = undefined;

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
          </div>
          
          <div class="title grid__col grid__col--8-of-8">
            CPU / GPU / RAM Graphs
            
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Poll interval in milliseconds
          </div>
          <div id="FreeRam" class="text grid__col grid__col--6-of-8">
            <input type="number" id="graph_poll_interval" value="1000" >
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Max elements per graph
          </div>
          <div id="FreeRam" class="text grid__col grid__col--6-of-8">
            <input type="number" id="graph_max_elements" value="50" >
          </div>          
          
          </div>
          <div class="text grid__col grid__col--8-of-8">
            <button type="button" id="startGraphs" >Start graphs</button>
          </div>
          <div id="graphs" style="display: none">
              <div class="title grid__col grid__col--8-of-8">
                RAM realtime
              </div>
              <div class="title grid__col grid__col--8-of-8">
                <canvas id="graph_ram" width="800" height="250"></canvas>
              </div>
                <div class="title grid__col grid__col--8-of-8">
                GPU RAM realtime
              </div>
              <div class="title grid__col grid__col--8-of-8">
                <canvas id="graph_gpu" width="800" height="250"></canvas>               
              </div>
                <div class="title grid__col grid__col--8-of-8">
                CPU realtime
              </div>
              <div class="title grid__col grid__col--8-of-8">
                <canvas id="graph_cpu" width="800" height="250"></canvas>               
              </div>    
          </div>      
            `;
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
        this.systeminfo().then( deviceInfo => {

            // backwards compatibility
            let systeminfo = deviceInfo.systeminfo ? deviceInfo.systeminfo : deviceInfo;

            this.deviceNameEl.innerHTML         = systeminfo.devicename;
            this.deviceIdEl.innerHTML           = systeminfo.deviceid;
            this.serialNumberEl.innerHTML       = systeminfo.serialnumber;
            this.versionEl.innerHTML            = systeminfo.version;
            this.uptimeEl.innerHTML             = systeminfo.uptime;
            this.totalRamEl.innerHTML           = this.bytesToMbString(systeminfo.totalram);
            this.usedRamEl.innerHTML            = this.bytesToMbString(systeminfo.totalram - systeminfo.freeram);
            this.freeRamEl.innerHTML            = this.bytesToMbString(systeminfo.freeram);
            this.totalGpuRamEl.innerHTML        = this.bytesToMbString(systeminfo.totalgpuram);
            this.freeGpuRamEl.innerHTML         = this.bytesToMbString(systeminfo.freegpuram);
            this.usedGpuRamEl.innerHTML         = this.bytesToMbString(systeminfo.totalgpuram - systeminfo.freegpuram);
            this.cpuLoadEl.innerHTML            = parseFloat(systeminfo.cpuload).toFixed(1) + " %";


            this.addresses().then( data => {
                let addresses = data.addresses ? data.addresses : data;

                this.interfacesOptsEl.innerHTML = '';
                for (var i=0; i<addresses.length; i++) {
                    var newChild = this.interfacesOptsEl.appendChild(document.createElement("option"));
                    newChild.innerHTML = addresses[i].name;
                }

                this.interfacesOptsEl.selectedIndex = this.selectedNetworkInterface;

                this.macIdEl.innerHTML = addresses[this.selectedNetworkInterface].mac;

                if (addresses[this.selectedNetworkInterface].ip !== undefined)
                    this.ipAddressEl.innerHTML = addresses[this.selectedNetworkInterface].ip;
                else
                    this.ipAddressEl.innerHTML = '-';
            });


        });
        var provisionButton = document.getElementById('startGraphs');
        provisionButton.onclick = this.startRealtimeGraphs.bind(this);

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

    startRealtimeGraphs() {
        this.chartOptions.maxElements = parseInt(document.getElementById('graph_max_elements').value)
        this.chartOptions.interval = parseInt(document.getElementById('graph_poll_interval').value)
        this.cpuChart = this.generateGraph('CPU usage',document.getElementById('graph_cpu').getContext('2d'), '#34c749', '%');
        this.ramChart = this.generateGraph('RAM used',document.getElementById('graph_ram').getContext('2d'),'#fc5652', 'MB');
        this.gpuChart = this.generateGraph('GPU RAM used',document.getElementById('graph_gpu').getContext('2d'), '#fdbc40', 'MB');
        this.chartIntervalId = setInterval(this.updateGraphs.bind(this), this.chartOptions.interval);
        document.getElementById('graphs').style.display = 'block';
    }

    generateGraph(title, ctx, color, suffix) {

        let config = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: title,
                    backgroundColor: color,
                    borderColor: color,
                    data: [],
                    fill: false,
                }]
            },
            options: {
                responsive: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: function(value, index, values) {
                                return value + suffix;
                            }
                        }
                    }]
                }
            }
        };
        return new Chart(ctx, config);
    }

    updateGraphs() {
        let self = this;

        this.systeminfo().then((sysInfo) => {
            const xLabel = self.getTimestampForGraph();
            if (self.ramChart) {
                self.ramChart.config.data.labels.push(xLabel);
                self.ramChart.config.data.datasets[0].data.push((sysInfo.totalram - sysInfo.freeram)  / 1024 / 1024)
                if (self.ramChart.config.data.labels.length > self.chartOptions.maxElements) {
                    self.ramChart.config.data.labels.shift();
                    self.ramChart.config.data.datasets[0].data.shift();
                }
                self.ramChart.update();
            }

            if (self.gpuChart) {
                self.gpuChart.config.data.labels.push(xLabel);
                self.gpuChart.config.data.datasets[0].data.push((sysInfo.totalgpuram - sysInfo.freegpuram)  / 1024 / 1024)
                if (self.gpuChart.config.data.labels.length > self.chartOptions.maxElements) {
                    self.gpuChart.config.data.labels.shift();
                    self.gpuChart.config.data.datasets[0].data.shift();
                }
                self.gpuChart.update();
            }
            if (self.cpuChart) {
                self.cpuChart.config.data.labels.push(xLabel);
                self.cpuChart.config.data.datasets[0].data.push(parseFloat(sysInfo.cpuload).toFixed(1))
                if (self.cpuChart.config.data.labels.length > self.chartOptions.maxElements) {
                    self.cpuChart.config.data.labels.shift();
                    self.cpuChart.config.data.datasets[0].data.shift();
                }
                self.cpuChart.update();
            }
        });
    }

    close() {
        clearInterval(this.chartIntervalId)
        delete this.ramChart;
        delete this.cpuChart;
        delete this.gpuChart;
    }

    updateNetworkInterface(deviceInfo) {
        this.selectedNetworkInterface = this.interfacesOptsEl.selectedIndex;
        this.update();
    }

    bytesToMbString(bytes) {
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }

    getTimestampForGraph() {
        const date = new Date();
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

    }
}

export default DeviceInfo;
