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
/**  Monitor plugin
 * The monitor plugin collects additional system consumption metrics from the system
 * There is no seperate tab for the monitor, so it does not render anything. Instead it provides additional info for the WebKit and Netflix menu options.
 * We'll only provide that information if the monitor plugin is loaded, hence this plugin provides that information to the other plugins.
 */

import Plugin from '../core/plugin.js';

class Monitor extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
        this.observablesList = [];
        this.restartList = [];
    }

    getMemoryInfo(plugin) {
        const _rpc = {
            plugin : 'Monitor',
            method : 'status'
        };

        return this.api.req(null, _rpc);
    }

    render() {
        var mainDiv = document.getElementById('main');
        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8"></div>
        <table class="title grid__col grid__col--8-of-8">
        <tr><td><div class="text grid__col grid__col--6-of-8">Observables</div></td>
        <td><div class="text grid__col grid__col--6-of-8">
            <select id="observables" style="width: fit-content;"></select>                   </div></td><td rowspan="4">
        <div id="plugOutput"></div></td></tr><tr><td>
        <div class="text grid__col grid__col--6-of-8">RestartThreshold</div></td><td><div class="text grid__col grid__col--6-of-8"><select id="restart" style="width: -webkit-fill-available;"> </select>
        </div> </td></tr><tr><td></td><td>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="setRestart" style="width: 100%;"> Set</button></div></td></tr></table>`;

        this.getObservableList();

        this.observableListEl              = document.getElementById('observables');
        this.restartListEl                 = document.getElementById('restart');

        this.bt_setRestart                 = document.getElementById('setRestart');
        this.bt_setRestart.onclick         = this.setRestartThreshold.bind(this);
    }

    getObservableList() {
        this.status().then(data => {
            var plugins = [];
            for (var i=0; i<data.length; i++) {
                plugins[i] = data[i].name ? data[i].name : data[i].observable;
            }
            this.observablesList = plugins;
            this.renderObservables();
        });
    }
    renderObservables() {
         this.observableListEl.innerHTML = '';
         for (var i=0; i<this.observablesList.length; i++){
            var newChild = this.observableListEl.appendChild(document.createElement("option"));
            newChild.innerHTML = `${this.observablesList[i]}`;
         }
         var restartLimit= [];
         for (i=1; i<=20; i++) {
            restartLimit[i] = i;
         }
         this.restartList = restartLimit;
         this.restartListEl.innerHTML = '';
         for (i=1; i<=20; i++) {
           var newOptionChild = this.restartListEl.appendChild(document.createElement("option"));
           newOptionChild.innerHTML = `${this.restartList[i]}`;
        }
    }
    setRestartThreshold(){
        const i = observables.selectedIndex;

        const _rpc = {
            plugin : this.callsign,
            method : 'restartlimits',
            params : {
                callsign: observables.options[i].text,
                operational: {
                    limit: restart.value
                },
                memory : {
                    limit: restart.value
                }
            }
        };

        this.api.req(null, _rpc);
    }

    getMonitorDataAndDiv(plugin, callback) {
        var self = this;

        return new Promise( (resolve, reject) => {
            this.getMemoryInfo(plugin).then( data => {
                // Monitor returns a list of measurements, find the right plugin and return it to the callback

                let pluginData = data.filter( _p => {
                    if (_p.observable === plugin || _p.name === plugin)
                        return true
                    else
                        return valse
                });

                if (pluginData && pluginData[0])
                    resolve( self.createMonitorDiv(pluginData[0]) );
                else
                    reject();
            });
        });

    }

    createMonitorDiv(data) {
        // compatibility with old API
        if (data.measurment !== undefined)
            data.measurements = data.measurment;

        // we only care about resident memory data
        if (data.measurements === undefined || data.measurements.resident === undefined)
            return;

        var measurementData = data.measurements;
        var div = document.createElement('div');

        var titleDiv = document.createElement('div');
        titleDiv.className = "title grid__col grid__col--8-of-8";
        titleDiv.innerHTML = "Memory";
        div.appendChild(titleDiv);

        for (var i in measurementData.resident) {
            var labelDiv = document.createElement('div');
            labelDiv.className = "label grid__col grid__col--2-of-8";
            div.appendChild(labelDiv);

            var label = document.createElement('label');
            label.innerHTML = i;
            labelDiv.appendChild(label);

            var text = document.createElement('div');
            text.className = "text grid__col grid__col--6-of-8";
            let memoryData = measurementData.resident[i];
            if (measurementData.shared[i]) memoryData -= measurementData.shared[i];
            text.innerHTML = this.bytesToMbString(memoryData);
            div.appendChild(text);
        }

        var measurementsDiv = document.createElement('div');
        measurementsDiv.className = "label grid__col grid__col--2-of-8";
        div.appendChild(measurementsDiv);

        var measurementsLabel = document.createElement('label');
        measurementsLabel.innerHTML = 'measurements';
        measurementsDiv.appendChild(measurementsLabel);

        var countText = document.createElement('div');
        countText.className = "text grid__col grid__col--6-of-8";
        countText.innerHTML = measurementData.count;
        div.appendChild(countText);

        var processDiv = document.createElement('div');
        processDiv.className = "label grid__col grid__col--2-of-8";
        div.appendChild(processDiv);

        var processLabel = document.createElement('label');
        processLabel.innerHTML = 'process';
        processDiv.appendChild(processLabel);

        var processText = document.createElement('div');
        processText.className = "text grid__col grid__col--6-of-8";
        processText.innerHTML = measurementData.process.last;
        div.appendChild(processText);

        return div;
    }

    bytesToMbString(bytes) {
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }

}

export default Monitor;
