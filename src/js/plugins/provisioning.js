/** The provision plugin checks the device identifier and is able to initiate a provisioning request if not provisioned
 */

import Plugin from '../core/Plugin.js';

class Provisioning extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
        Provisioning status
      </div>

      <div class="label grid__col grid__col--2-of-8">
        Device
      </div>
      <div id="device" class="text grid__col grid__col--6-of-8">
        -
      </div>
      <div class="label grid__col grid__col--2-of-8">
        Provisioned for
      </div>
      <div id="provisioning-tokens" class="text grid__col grid__col--6-of-8">
        -
      </div>
      <div class="label grid__col grid__col--2-of-8">
        Status
      </div>
      <div id="status" class="text grid__col grid__col--6-of-8">
        -
      </div>

      <div id="provisionLabel" class="label grid__col grid__col--2-of-8">
        Provisioning
      </div>
      <div class="text grid__col grid__col--6-of-8">
        <button type="button" id="provisionButton" onclick="tiggerProvisioningRequest()">Request</button>
      </div>`;

      var provisionButton = document.getElementById('provisionButton');
      provisionButton.onclick = this.tiggerProvisioningRequest.bind(this);

      this.update();
    }

    triggerProvisioning() {
        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'request'
        };

        return this.api.req(_rest, _rpc);
    }

    update() {
        api.getPluginData('Provisioning', function(error, response, status) {
            if (error !== null) {
                console.error(err);
                this.status(err);
                return;
            }

            if (response === null || response === undefined || response === '')
              return;

            var id = response.id;
            var tokens = response.tokens || [];

            document.getElementById('device').innerHTML = id;
            document.getElementById('status').innerHTML = (status == 200) ? 'provisioned' : 'not provisioned';
            if (status == 200 && tokens.length > 0) {
                document.getElementById('provisioning-tokens').innerHTML = tokens.join(', ');
            }
            //document.getElementById('provisionButton').style.display = (status == 200) ? 'none' : null;
            document.getElementById('provisionLabel').style.display = (status == 200) ? 'none' : null;
        });
    }

    tiggerProvisioningRequest() {
        var self = this;

        this.triggerProvisioning().then( response => {
            document.getElementById('provisionButton').style.display = 'none';
            document.getElementById('provisionLabel').style.display = 'none';

            setTimeout(self.update(), 3000);
        });
    }
 }

function name() {
    return  'Provisioning';
}

export { name };
export default Provisioning;
