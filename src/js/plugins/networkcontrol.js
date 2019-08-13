/** The network plugin manages the network configuration of the device
 */

import Plugin from '../core/Plugin.js';

class NetworkControl extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.renderInMenu = true;
        this.displayName = 'Network';
        this.selectedNetworkInterface = 0;
        this.networks = [];
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `
          <div class="title grid__col grid__col--8-of-8">
            Network Control
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Network Interface
          </div>
          <div class="text grid__col grid__col--6-of-8">
            <select id="NetworkInterface">
            </select>
          </div>
          <div class="label grid__col grid__col--2-of-8">
            IP Address
          </div>
          <div id="ip" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Broadcast
          </div>
          <div id="broadcast" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Gateway
          </div>
          <div id="gateway" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            mask
          </div>
          <div id="mask" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            mode
          </div>
          <div id="mode" class="text grid__col grid__col--6-of-8">
            -
          </div>

          <div id="syncLabel" class="label grid__col grid__col--2-of-8">
            Control
          </div>
          <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="reload" onclick="">Reload</button>
            <button type="button" id="request" onclick="">Request</button>
            <button type="button" id="assign" onclick="">Assign</button>
            <button type="button" id="flush" onclick="">Flush</button>
          </div>`;

      this.interfacesOptsEl   = document.getElementById("NetworkInterface");
      this.interfacesOptsEl.onchange = this.updateNetworkInterface.bind(this);

      let reloadButton = document.getElementById('reload');
      reloadButton.onclick = this.reload.bind(this);

      let requestButton = document.getElementById('request');
      request.onclick = this.request.bind(this);

      let assignButton = document.getElementById('assign');
      assignButton.onclick = this.assign.bind(this);

      let flushButton = document.getElementById('flush');
      flushButton.onclick = this.flush.bind(this);

      this.ipEl           = document.getElementById('ip');
      this.broadcastEl    = document.getElementById('broadcast');
      this.gatewayEl      = document.getElementById('gateway');
      this.maskEl         = document.getElementById('mask');
      this.modeEl         = document.getElementById('mode');

      // FIXME not documented, guessing
      this.api.t.on('NetworkControl', 'networkupdate', (data) => {
          console.log('NETWORK NOT', data);
          this.update();
      });

      this.update();
    }

    network() {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'network'
        };

        return this.api.req(_rest, _rpc);
    }

    reload() {
        let device = this._addresses[ this.interfacesOptsEl.selectedIndex ].interface;

        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}/${device}/Reload`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'reload',
            params : {
              'device' : device
            }
        };

        return this.api.req(_rest, _rpc);
    }

    request() {
        let device = this._addresses[ this.interfacesOptsEl.selectedIndex ].interface;

        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}/${device}/Request`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'request',
            params : {
              'device' : device
            }
        };

        return this.api.req(_rest, _rpc);
    }

    assign() {
        let device = this._addresses[ this.interfacesOptsEl.selectedIndex ].interface;

        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}/${device}/Assign`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'assign',
            params : {
              'device' : device
            }
        };

        return this.api.req(_rest, _rpc);
    }

    flush() {
        let device = this._addresses[ this.interfacesOptsEl.selectedIndex ].interface;

        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}/${device}/Flush`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'flush',
            params : {
              'device' : device
            }
        };

        return this.api.req(_rest, _rpc);
    }

    update() {
        this.network().then( data => {
            let addresses = data.addresses ? data.addresses : data;

            this._addresses = addresses;

            this.interfacesOptsEl.innerHTML = '';
            for (var i=0; i<addresses.length; i++) {
                var newChild = this.interfacesOptsEl.appendChild(document.createElement("option"));
                newChild.innerHTML = addresses[i].interface;
            }

            this.interfacesOptsEl.selectedIndex = this.selectedNetworkInterface;
            let _selected = this._addresses[this.selectedNetworkInterface];

            this.ipEl.innerHTML         = _selected.address;
            this.broadcastEl.innerHTML  = _selected.broadcast;
            this.gatewayEl.innerHTML    = _selected.gateway;
            this.maskEl.innerHTML       = _selected.mask;
            this.modeEl.innerHTML       = _selected.mode;
        });
    }

    updateNetworkInterface(deviceInfo) {
        this.selectedNetworkInterface = this.interfacesOptsEl.selectedIndex;
        this.update();
    }
}

export default NetworkControl;
