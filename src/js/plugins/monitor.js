/**  Monitor plugin
 * The monitor plugin collects additional system consumption metrics from the system
 * There is no seperate tab for the monitor, so it does not render anything. Instead it provides additional info for the WebKit and Netflix menu options.
 * We'll only provide that information if the monitor plugin is loaded, hence this plugin provides that information to the other plugins.
 */

class Monitor extends Plugin {

    constructor(pluginData) {
        super(pluginData);
        this.observablesList = [];
        this.restartList = [];
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
        api.getPluginData(this.callsign, (error, data) => {
        if (error) {
            console.error(error);
            return;
        }
        var plugins = [];
        for (var i=0; i<data.length; i++) {
            plugins[i] = data[i].name;
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
       var i = observables.selectedIndex;
       var body = '{"observable" : "' + observables.options[i].text + '","restartlimit" :"' +restart.value+'"}';
       api.postPlugin(this.callsign,'',body, (err, resp) => {
       if (err !== null) {
           console.error(err);
           return;
       }
       });
    }

    getMonitorDataAndDiv(plugin, callback) {
        var self = this;
        api.getPluginData('Monitor', function (error, data) {
            if (error) {
                console.error(error);
                self.callback('');
                return;
            }

            // Monitor returns a list of measurements, find the right plugin and return it to the callback
            for (var i=0; i<data.length; i++) {
                var _p = data[i];

                if (_p.name === plugin) {
                    self.createMonitorDiv(_p, callback);
                    break;
                }

                // we didnt find anything
                if (i === data.length-1)
                    callback();
            }
        });
    }

    createMonitorDiv(data, callback) {
        if (data === null || data === undefined)
            callback();

        // we only care about resident memory data
        if (data.measurment === undefined || data.measurment.resident === undefined)
            callback();

        // embedded dev's cant spell measurement
        var measurementData = data.measurment;

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
            text.innerHTML = this.bytesToMbString(measurementData.resident[i]);
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

        callback(div);
    }

    bytesToMbString(bytes) {
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }

}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Monitor = Monitor;
