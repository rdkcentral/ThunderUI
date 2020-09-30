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
/** Activity Monitor provides the ability to monitor memory and CPU usage by applications.*/

import Plugin from '../core/plugin.js';

class ActivityMonitor extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.monitored = false;
    this.displayName = 'Activity Monitor';
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `
            <div class="text grid__col grid__col--2-of-8">
                Memory Usage for all Applications
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <button type="button" id="memory_all" >Show</button>
            </div>
            <div class="text grid__col grid__col--8-of-8">
                <ul id="memory_usage"></ul>
            </div>
            <div class="text grid__col grid__col--8-of-8">
                ApplicationMemoryUsage
            </div>
            <div class="label grid__col grid__col--2-of-8">
                PID
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="number" id="pid">
                <button id="set_pid" type="button">SET</button>
            </div>
            <div class="label grid__col grid__col--2-of-8">
                App Name
            </div>
            <div id="app_name" class="text grid__col grid__col--6-of-8">
                -
            </div>
            <div class="label grid__col grid__col--2-of-8">
                Memory MB
            </div>
            <div id="memory_mb" class="text grid__col grid__col--6-of-8">
                -
            </div>
            <div class="text grid__col grid__col--8-of-8">
                Monitoring Applications
            </div>
            <div class="label grid__col grid__col--2-of-8">
                PID
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="number" id="pid_monitor">
            </div>
            <div class="label grid__col grid__col--2-of-8">
                Memory Threshold MB
            </div>
                <div class="text grid__col grid__col--6-of-8">
                <input type="number" id="memory_Threshold_MB">
                </div>
            </div>
            <div class="label grid__col grid__col--2-of-8">
                CPU Threshold Percent
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="number" id="cpu_Threshold_Percent">
            </div>
            <div class="label grid__col grid__col--2-of-8">
                CPU Threshold Second
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="number" id="cpu_Threshold_Second">
            </div>
            <div class="label grid__col grid__col--2-of-8">
                Memory Interval Seconds
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="number" id="memory_Interval_Seconds">
            </div>
            <div class="label grid__col grid__col--2-of-8">
                CPU Interval Seconds
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="number" id="cpu_Interval_Seconds">
            </div>
            <div class="text grid__col grid__col--8-of-8">
                <button id="enable_monitoring" type="button">Enable Monitoring</button>
            </div>
                `;
    this.pid_monitor = document.getElementById('pid_monitor');
    this.memory_Threshold_MB = document.getElementById('memory_Threshold_MB');
    this.cpu_Threshold_Percent = document.getElementById('cpu_Threshold_Percent');
    this.cpu_Threshold_Second = document.getElementById('cpu_Threshold_Second');
    this.memory_Interval_Seconds = document.getElementById('memory_Interval_Seconds');
    this.cpu_Interval_Seconds = document.getElementById('cpu_Interval_Seconds');
    this.enable_monitoring = document.getElementById('enable_monitoring');
    this.enable_monitoring.onclick = this.doMonitoring.bind(this);
    this.pid = document.getElementById('pid');
    this.app_name = document.getElementById('app_name');
    this.memory_mb = document.getElementById('memory_mb');
    this.set_pid = document.getElementById('set_pid');
    this.set_pid.onclick = this.showMemoryUsage.bind(this);
    this.memory_all = document.getElementById('memory_all');
    this.memory_all.onclick = this.showMemoryUsageAll.bind(this);
    this.memory_usage = document.getElementById('memory_usage');
  }

  doMonitoring() {
    if (this.enable_monitoring.innerHTML == 'Enable Monitoring') {
      this.enableMonitoring(
        this.pid_monitor.value,
        this.memory_Threshold_MB.value,
        this.cpu_Threshold_Percent.value,
        this.cpu_Threshold_Second.value,
        this.memory_Interval_Seconds.value,
        this.cpu_Interval_Seconds.value
      ).then(response => {
        if (response.success) {
          this.enable_monitoring.innerHTML = 'Disable Monitoring';
          this.monitored = true;
        }
      });
    } else {
      this.disableMonitoring().then(response => {
        if (response.success) {
          this.enable_monitoring.innerHTML = 'Enable Monitoring';
          this.monitored = false;
        }
      });
    }
  }

  showMemoryUsage() {
    this.getApplicationMemoryUsage(this.pid.value).then(response => {
      if (response.success == true) {
        this.app_name.innerHTML = response.applicationMemory.appName;
        this.memory_mb.innerHTML = response.applicationMemory.memoryMB;
      }
    });
  }

  showMemoryUsageAll() {
    if (this.memory_all.innerHTML == 'Show') {
      this.getAllMemoryUsage(this.pid.value).then(response => {
        if (response != null) {
          this.length = response.applicationMemory.length;
          for (var i = 0; i < response.applicationMemory.length; i++) {
            this.li = document.createElement('li' + i);
            this.applicationName = document.createElement('div');
            this.applicationName.id = 'applicationName_' + i;
            this.applicationName.className = 'label grid__col grid__col--2-of-8';
            this.applicationName.innerHTML = 'App Name';
            this.applicationNameValue = document.createElement('div');
            this.applicationNameValue.id = 'applicationNameValue_' + i;
            this.applicationNameValue.className = 'text grid__col grid__col--6-of-8';
            this.applicationNameValue.innerHTML = response.applicationMemory[i].appName;
            this.pid_app = document.createElement('div');
            this.pid_app.id = 'pid_' + i;
            this.pid_app.className = 'label grid__col grid__col--2-of-8';
            this.pid_app.innerHTML = 'PID';
            this.pidAppValue = document.createElement('div');
            this.pidAppValue.id = 'pidAppValue_' + i;
            this.pidAppValue.className = 'text grid__col grid__col--6-of-8';
            this.pidAppValue.innerHTML = response.applicationMemory[i].appPid;
            this.memoryInmb = document.createElement('div');
            this.memoryInmb.id = 'memoryInmb_' + i;
            this.memoryInmb.className = 'label grid__col grid__col--2-of-8';
            this.memoryInmb.innerHTML = 'Memory MB';
            this.memoryInmbValue = document.createElement('div');
            this.memoryInmbValue.id = 'memoryInmbValue_' + i;
            this.memoryInmbValue.className = 'text grid__col grid__col--6-of-8';
            this.memoryInmbValue.innerHTML = response.applicationMemory[i].memoryMB;
            this.spacing = document.createElement('div');
            this.spacing.id = 'spacing_' + i;
            this.spacing.className = 'text grid__col grid__col--8-of-8';
            this.li.appendChild(this.applicationName);
            this.li.appendChild(this.applicationNameValue);
            this.li.appendChild(this.pid_app);
            this.li.appendChild(this.pidAppValue);
            this.li.appendChild(this.memoryInmb);
            this.li.appendChild(this.memoryInmbValue);
            this.li.appendChild(this.spacing);
            this.memory_usage.appendChild(this.li);
            this.memory_all.innerHTML = 'Hide';
          }
        }
      });
    } else {
      for (var i = 0; i < this.length; i++) {
        document.getElementById('applicationName_' + i).remove();
        document.getElementById('applicationNameValue_' + i).remove();
        document.getElementById('pid_' + i).remove();
        document.getElementById('pidAppValue_' + i).remove();
        document.getElementById('memoryInmb_' + i).remove();
        document.getElementById('memoryInmbValue_' + i).remove();
        document.getElementById('spacing_' + i).remove();
        this.memory_all.innerHTML = 'Show';
      }
    }
  }

  getApplicationMemoryUsage(pid) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getApplicationMemoryUsage',
      params: { pid: pid },
    };

    return this.api.req(_rest, _rpc);
  }

  getAllMemoryUsage() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getAllMemoryUsage',
    };

    return this.api.req(_rest, _rpc);
  }

  enableMonitoring(pid, memoryMB, cpuPercent, cpuSeconds, memorySeconds, cpuIntervalSeconds) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'enableMonitoring',
      params: {
        config: [
          {
            appPid: pid,
            memoryThresholdMB: memoryMB,
            cpuThresholdPercent: cpuPercent,
            cpuThresholdSeconds: cpuSeconds,
          },
        ],
        memoryIntervalSeconds: memorySeconds,
        cpuIntervalSeconds: cpuIntervalSeconds,
      },
    };

    return this.api.req(_rest, _rpc);
  }

  disableMonitoring() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'disableMonitoring',
    };

    return this.api.req(_rest, _rpc);
  }

  close() {
    if (this.monitored) {
      this.disableMonitoring().then(response => {
        this.monitored = false;
      });
    }
  }
}

export default ActivityMonitor;
