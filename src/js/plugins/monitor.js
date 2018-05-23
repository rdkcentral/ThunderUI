/**  Monitor plugin
 * The monitor plugin collects additional system consumption metrics from the system
 * There is no seperate tab for the monitor, so it does not render anything. Instead it provides additional info for the WebKit and Netflix menu options.
 * We'll only provide that information if the monitor plugin is loaded, hence this plugin provides that information to the other plugins.
 */

class Monitor extends Plugin {

    constructor(pluginData) {
        super(pluginData);
        this.renderInMenu = false; // this plugin has no tab in the menu
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
