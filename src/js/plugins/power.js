/** The Power plugin provides control on Power modes
 */

class Power extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.mainDiv = document.getElementById('main');
        this.state = 1;
        this.stateLookup = {
            1   : 'On',
            2   : 'Active standby',
            3   : 'Passive standby',
            4   : 'Suspend to Ram',
            5   : 'Hibernate',
            6   : 'Power Off'
        };
    }

    render()        {
        this.mainDiv.innerHTML = `
        <div class="label grid__col grid__col--2-of-8">
            Current State
        </div>
        <div id="powerState" class="text grid__col grid__col--6-of-8">
            -
        </div>

        <div class="label grid__col grid__col--2-of-8">
            <label for="number">Timeout (seconds)</label>
        </div>
        <div class="text grid__col grid__col--2-of-8">
            <input type="number" id="timeout" size="4" value="" />
        </div>
        <div class="grid__col grid__col--4-of-8"></div>

        <div class="label grid__col grid__col--2-of-8">Change state</div>
        <div class="text grid__col grid__col--2-of-8">
            <select id="stateSelector"></select>
        </div>`;


        this.powerStateDiv = document.getElementById('powerState');
        this.stateSelectorEl = document.getElementById('stateSelector');
        this.timeoutInput = document.getElementById('timeout');
        this.stateSelectorEl.onchange = this.changeState.bind(this);

        var stateList = Object.keys(this.stateLookup);
        if (this.stateSelectorEl.children.length === 0) {
            for (var j=0; j<stateList.length; j++) {
                var option = document.createElement('option');
                option.text = this.stateLookup[ stateList[j] ];
                option.value = stateList[j];

                this.stateSelectorEl.appendChild(option);
            }
        }

        this.update();
    }

    update(data) {
        api.getPluginData('Power/State', (error, resp) => {
            if (error) {
                console.error(error);
                return;
            }

            if (resp.PowerState !== undefined) {
                this.powerStateDiv.innerHTML = this.stateLookup[ resp.PowerState ];
                this.stateSelectorEl.children[ resp.PowerState - 1 ].selected = true;
            }
        });
    }

    changeState(nextState) {

        var body = { 
            'PowerState' : this.stateSelectorEl.value 
        };

        if (this.timeoutInput.value !== "")
            body.Timeout = this.timeoutInput.value;

        api.postPlugin(this.callsign, 'State', JSON.stringify(body), (error, resp) => {
            if (error) {
                console.error(error);
                return;
            }

            // only makes sense if were going from hot standby to running :-)
            if (nextState < 2)
                setTimeout(this.update, 5000);
        });
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Power = Power;
