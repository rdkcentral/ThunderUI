/** The Power plugin provides control on Power modes
 */

import Plugin from '../core/Plugin.js';

class Power extends Plugin {

    constructor(pluginData, api) {
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

    state() {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/State`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'state'
        };

        return this.api.req(_rest, _rpc);
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
        this.state().then( resp => {
            if (resp.PowerState !== undefined) {
                this.powerStateDiv.innerHTML = this.stateLookup[ resp.PowerState ];
                this.stateSelectorEl.children[ resp.PowerState - 1 ].selected = true;
            }
        });
    }

    changeState(nextState) {
        const _rest = {
            method  : 'POST',
            path    : `${this.callsign}/State`,
            body    : {
                'PowerState' : this.stateSelectorEl.value,
            }
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'state',
            params : {
                'powerstate' : this.stateSelectorEl.value
            }
        };

        if (this.timeoutInput.value !== '') {
            _rest.body.Timeout = this.timeoutInput.value;
            _rpc.body.timeout = this.timeoutInput.value;
        }

        //FIXME doesn't have a rpc specification yet
        this.api.req(_rest).then( () => {
            if (nextState < 2)
                setTimeout(this.update, 5000);
        });
    }
}

function name() {
    return  'Power';
}

export { name };
export default Power;
