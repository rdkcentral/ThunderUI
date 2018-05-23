/** The footer bar provides stats on the current device */

class Footer {
    constructor() {
        this.renderInMenu   = false;
        this.connected      = true;
        this.footer         = document.getElementById('statusBar');

        this.footer.innerHTML = `
            <div class="status">
                <label>Version</label>
                <span id="statusBarVersion">-</span>
            </div>

            <div class="status">
                <label>Serial</label>
                <span id="statusBarSerial">-</span>
            </div>

            <div class="status">
                <label>Uptime</label>
                <span id="statusBarUptime">-</span>
            </div>

            <div class="status">
                <label>CPU load</label>
                <span id="statusBarCpuLoad">-</span>
            </div>

            <div class="status">
                <label>RAM used</label>
                <span id="statusBarUsedRam">-</span>
                <span>/</span>
                <span id="statusBarTotalRam">-</span>
            </div>

            <div class="status">
                <label>GPU RAM used</label>
                <span id="statusBarGpuRamUsed">-</span>
                <span>/</span>
                <span id="statusBarGpuRamTotal">-</span>
            </div>

            <div class="status">
                <label class="statusBarKeyPress" id="keyPressedLabel">Last key send</label>
                <span class="statusBarKeyPress" id="keyPressed">-</span>
            </div>

            <span id="pause-button" onclick="pause();">hide statistics</span>
          `;

        // bind span elements
        this.versionSpan      = document.getElementById('statusBarVersion');
        this.uptimeSpan       = document.getElementById('statusBarUptime');
        this.serialSpan       = document.getElementById('statusBarSerial');
        this.cpuLoadSpan      = document.getElementById('statusBarCpuLoad');
        this.usedRamSpan      = document.getElementById('statusBarUsedRam');
        this.totalRamSpan     = document.getElementById('statusBarTotalRam');
        this.gpuUsedRamSpan   = document.getElementById('statusBarGpuRamUsed');
        this.gpuTotalRamSpan  = document.getElementById('statusBarGpuRamTotal');

        // hooks
        document.getElementById('pause-button').onclick = this.togglePause.bind(this);
        this.pauseButton      = document.getElementById('pause-button');

        if (plugins.DeviceInfo === undefined)
            return;

        // start update loop
        this.interval = setInterval(this.update.bind(this), conf.refresh_interval);
        this.update();

    }

    render(error, deviceInfo) {
        if (error !== null) {
            console.error(error);
            this.deviceIsConnected(false);
            return;
        }

        if (deviceInfo === undefined)
            return;

        this.deviceIsConnected(true);

        this.versionSpan.innerHTML      = deviceInfo.systeminfo.version;
        this.serialSpan.innerHTML       = deviceInfo.systeminfo.deviceid;
        this.uptimeSpan.innerHTML       = deviceInfo.systeminfo.uptime;
        this.totalRamSpan.innerHTML     = this.bytesToMbString(deviceInfo.systeminfo.totalram);
        this.usedRamSpan.innerHTML      = this.bytesToMbString(deviceInfo.systeminfo.totalram - deviceInfo.systeminfo.freeram);
        this.gpuTotalRamSpan.innerHTML  = this.bytesToMbString(deviceInfo.systeminfo.totalgpuram);
        this.gpuUsedRamSpan.innerHTML   = this.bytesToMbString(deviceInfo.systeminfo.totalgpuram - deviceInfo.systeminfo.freegpuram);
        this.cpuLoadSpan.innerHTML      = parseFloat(deviceInfo.systeminfo.cpuload).toFixed(1) + " %";
    }

    update() {
        if (this.paused === true || plugins.DeviceInfo.state === 'deactivated')
            return;

        api.getPluginData('DeviceInfo', this.render.bind(this));
    }

    togglePause() {
        this.pauseButton.innerHTML = (this.paused === true) ? 'hide statistics' : 'show statistics';

        var elements = this.footer.getElementsByClassName('status'),
            i = 0;

        if (this.paused === true) {
            for(i; i < elements.length; i++) {
                elements[i].style.display = 'block';
            }
            this.footer.style.padding = '5px';
        } else {
            for(i; i < elements.length; i++) {
                elements[i].style.display = 'none';
            }
            this.footer.style.padding = '0px';
        }

        document.getElementById('notifications-block').style.bottom = (this.paused === true) ? "300px" : "60px";

        this.paused = (this.paused === true) ? false : true;
    }

    deviceIsConnected(connected) {
        // state did not change
        if (this.connected === connected)
            return;

        var disconnectedEl = document.getElementById('disconnected');
        var disconnectedHtml = `<div id="disconnectedBlock">
            <div id="message">No connection with device</div>
            <div id="reconnect" class="loading">Attempting to connect</div>
        </div>`;

        if (connected === true) {
            disconnectedEl.innerHTML = '';
            disconnectedEl.style.display = 'none';

            //refresh state after coming back online
            plugins.menu.render();
            renderCurrentPlugin();
        } else {
            disconnectedEl.innerHTML = disconnectedHtml;
            disconnectedEl.style.display = 'block';
        }

        this.connected = connected;
    }

    bytesToMbString(bytes) {
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }
}
