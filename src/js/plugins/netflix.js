/** The Netflix plugin provides details on the netflix instance
 */

class Netflix extends Plugin {

    constructor(pluginData) {
        super(pluginData);
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            ESN
        </div>

        <div class="label grid__col grid__col--2-of-8">
            ID
        </div>
        <div id="netflix-esn" class="text grid__col grid__col--6-of-8">
            -
        </div>

        <div id="form-netflix">
            <div id="NetflixMemory" class="memoryInfo"></div>
            <div>
                <div class="title grid__col grid__col--8-of-8">Memory</div>
                <div class="label grid__col grid__col--2-of-8">Current State</div>
                <div id="NetflixStateInfo" class="text grid__col grid__col--6-of-8"></div>
                <div class="label grid__col grid__col--2-of-8"></div>
                <div class="label grid__col grid__col--6-of-8">
                    <button id="NetflixSuspendButton" type="button"></button>
                </div>
            </div>
        </div>`;

        this.interval = setInterval(this.update.bind(this), conf.refresh_interval);
        this.update();
    }

    update(data) {
        var self = this;
        api.getPluginData('Netflix', (error, data) => {
            if (data.esn)
                document.getElementById('netflix-esn').innerHTML = data.esn;

            var state = data.suspended ? 'Suspended' : 'Resumed';
            var netflixStateEl = document.getElementById('NetflixStateInfo');
            netflixStateEl.innerHTML = state;

            var nextState = 'Suspend';
            if (data.suspended === true) nextState = 'Resume';

            var netflixButton = document.getElementById('NetflixSuspendButton');
            netflixButton.innerHTML = nextState.toUpperCase();
            netflixButton.onclick = this.toggleSuspend.bind(this, nextState);

            // get memory data and div if the monitor plugin is loaded
            if (plugins.Monitor !== undefined && plugins.Monitor.getMonitorDataAndDiv !== undefined) {
                var memoryDiv = document.getElementById(this.callsign + 'Memory');
                plugins.Monitor.getMonitorDataAndDiv(this.callsign, (d) => {
                    if (d === undefined)
                        return;

                    memoryDiv.innerHTML = '';
                    memoryDiv.appendChild(d);
                });
            }
        });
    }

    close() {
        clearInterval(this.interval);
    }

    toggleSuspend(nextState) {
        var self = this;

        if (nextState === 'Resume') {
            api.resumePlugin('Netflix', function (err, resp) {
                if (err)
                    self.render();

                self.update({ suspended : false });
            });
        } else {
            api.suspendPlugin('Netflix', function (err, resp) {
                if (err)
                    self.render();

                self.update({ suspended : true });
            });
        }
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Netflix = Netflix;
