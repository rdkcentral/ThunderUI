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
/** The network plugin manages the network configuration of the device
 */

import Plugin from '../core/plugin.js';

class NetworkControl extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.renderInMenu = true;
        this.displayName = 'Network';
        this.isUp = false;
        this.dns = [];
        this.networks = [];
        this.interfaces = [];
        this.modeList = ["Dynamic", "Static"];
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
            status
          </div>
          <div id="statusType" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div id="ipSettings" style="display: none">
            <div class="label grid__col grid__col--2-of-8">
              mode
            </div>
            <div class="text grid__col grid__col--6-of-8">
              <select id="mode" type="text" name="interfacemode"/>
              </select>
            </div>
            <div class="label grid__col grid__col--2-of-8">
              IP Address
            </div>
            <div class="text grid__col grid__col--6-of-8">
            <input id="ip" type="text" name="ip"/>
            </div>
            <div class="label grid__col grid__col--2-of-8">
              Gateway
            </div>
            <div class="text grid__col grid__col--6-of-8">
            <input id="gateway" type="text" name="gateway"/>
            </div>
            <div class="label grid__col grid__col--2-of-8">
              mask
            </div>
            <div class="text grid__col grid__col--6-of-8">
            <input id="mask" type="text" name="mask"/>
            </div>
          </div>
          <div class="label grid__col grid__col--2-of-8">
            DNS
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input id="dnslist" type="text" name="dns"/>
          </div>
        <div id="syncLabel" class="label grid__col grid__col--2-of-8">
          Control
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="save" onclick="">Save</button>
            <button type="button" id="toggleUp" onclick=""</button>
            <button type="button" id="flush" onclick="">Flush</button>
        </div>`;

      this.interfacesOptsEl   = document.getElementById("NetworkInterface");
      this.interfacesOptsEl.onchange = this.updateNetworkInterface.bind(this);

      let saveButton = document.getElementById('save');
      saveButton.onclick = this.save.bind(this);
      let toggleButton = document.getElementById('toggleUp');
      toggleButton.innerHTML = (this.isUp ? "Down": "Up");
      toggleButton.onclick = this.toggleUp.bind(this);
      let flushButton = document.getElementById('flush');
      flushButton.onclick = this.flush.bind(this);

      this.dnsEl          = document.getElementById('dnslist');
      this.ipEl           = document.getElementById('ip');
      this.gatewayEl      = document.getElementById('gateway');
      this.maskEl         = document.getElementById('mask');
      this.modeEl         = document.getElementById('mode');
      this.statusTypeEl   = document.getElementById('statusType');

      // FIXME not documented, guessing
      this.networkListener = this.api.t.on('NetworkControl', 'update', (data) => {
          console.log('NETWORK NOT', data);
          this.update();
      });

      this.update();
    }

    getInterfaceIsUp(iface) {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/Up/` + iface
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'up@' + iface
        };

        return this.api.req(_rest, _rpc).then( resp => {
            if (resp === undefined)
                return;

            // backwards compatibility with REST
            let isUp = resp.value ? resp.value : resp

            this.isUp = isUp;
            //this.toggleButton.innerHTML = (isUp ? "Down": "Up");
            var toggleButton = document.getElementById('toggleUp');
            toggleButton.innerHTML = (this.isUp ? "Down": "Up");
        });
    }

    getStatus(iface) {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/Status/` + iface
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'status@' + iface
        };

        return this.api.req(_rest, _rpc).then( resp => {
            if (resp === undefined)
                return;

            // backwards compatibility with REST
            let statustype = resp.statustype ? resp.statustype : resp;

            if (statustype === undefined)
                return;

            this.statustype = statustype;
            this.statusTypeEl.innerHTML = statustype;
            this.getNetwork(iface);
        });
    }

    getNetwork(iface) {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/Network/` + iface
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'network@' + iface
        };

        return this.api.req(_rest, _rpc).then( resp => {
            if (resp === undefined)
                return;

            // backwards compatibility with REST
            let network = resp.network ? resp.network : resp;

            if (network === undefined)
                return;

            this.networks = network;
            this.renderNetworkDetails();
        });
    }

    getDNS() {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/DNS`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'dns'
        };

        return this.api.req(_rest, _rpc).then( resp => {
            if (resp === undefined)
                return;

            // backwards compatibility with REST
            let dns = resp.dns ? resp.dns : resp;

            if (dns === undefined)
                return;

            this.dns = [];
            this.dnsEl.value = "";
            if (dns.length) {
                for (var i=0; i< dns.length; i++) {
                    this.dns.push(dns[i]);
                }
                this.dnsEl.value = this.dns;
            }
        });
    }
    getInterfaces() {
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/Interfaces`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'interfaces'
        };

        return this.api.req(_rest, _rpc).then( resp => {
            if (resp === undefined)
                return;

            // backwards compatibility with REST
            let interfaces = resp.interfaces ? resp.interfaces : resp;

            if (interfaces === undefined)
                return;

            let selectedIndex = this.interfacesOptsEl.selectedIndex;
            this.networks = [];
            this.interfaces = interfaces;
            this.interfacesOptsEl.innerHTML = '';
            for (var i=0; i< interfaces.length; i++) {
                var newChild = this.interfacesOptsEl.appendChild(document.createElement("option"));
                newChild.innerHTML = interfaces[i];
            }
            this.modeEl.innerHTML = '';
            for (var i=0; i<this.modeList.length; i++) {
                var modeChild = this.modeEl.appendChild(document.createElement("option"));
                modeChild.innerHTML = this.modeList[i];
            }

            this.interfacesOptsEl.selectedIndex = ((selectedIndex < 0) ? 0 : selectedIndex);
            this.getStatus(interfaces[this.interfacesOptsEl.selectedIndex]);
            this.getInterfaceIsUp(interfaces[this.interfacesOptsEl.selectedIndex]);
        });
    }

    toggleUp() {
        let iface = this.interfaces[ this.interfacesOptsEl.selectedIndex ];
        let toggledStatus = (this.isUp ? "Down" : "Up");

        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}/${toggledStatus}/${iface}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'up@' + iface,
            params : {
              'value' : !this.isUp
            }
        };

        return this.api.req(_rest, _rpc).then ( () => {
            this.getInterfaceIsUp(iface);
        });
    }

    flush() {
        let iface = this.interfaces[ this.interfacesOptsEl.selectedIndex ];

        const _rest = {
            method  : 'PUT',
            path    : `${this.callsign}/Flush/${iface}`
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'flush',
            params : {
              'interface' : iface
            }
        };

        return this.api.req(_rest, _rpc);
    }

    save() {
        this.setNetwork();
        this.setDNS();
    }

    setNetwork() {
        let iface = this.interfaces[ this.interfacesOptsEl.selectedIndex ];

        this.networks[0].mode = this.modeEl.value;
        this.networks[0].address = this.ipEl.value;
        this.networks[0].defaultgateway = this.gatewayEl.value;
        this.networks[0].mask = this.maskEl.value;

        const _rest = {
            method  : 'POST',
            path    : `${this.callsign}/Network/` + iface,
            body    : JSON.stringify(this.networks)
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'network@' + iface,
            params : {
              'value' : this.networks
            }
        };

        return this.api.req(_rest, _rpc);
    }

    setDNS() {
        this.dns = [this.dnsEl.value];
        const _rest = {
            method  : 'POST',
            path    : `${this.callsign}/DNS`,
            body    : this.dns.toString().split(',')
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'dns',
            params : {
              'value' : this.dns.toString().split(',')
            }
        };

        return this.api.req(_rest, _rpc);
    }

    update() {
        this.getDNS();
        this.getInterfaces();
    }

    renderNetworkDetails() {
        let network = this.networks[0];

        if (this.statustype == 'Available') {
            document.getElementById('ipSettings').style.display = 'block'
            this.modeEl.value       = network.mode;
            this.ipEl.value         = network.address;
            this.gatewayEl.value    = network.defaultgateway;
            this.maskEl.value       = network.mask;
        } else {
            document.getElementById('ipSettings').style.display = 'none'
        }
    }

    updateNetworkInterface(deviceInfo) {
        this.update();
    }

    close() {
      if (this.networkListener && typeof this.networkListener.dispose === 'function') this.networkListener.dispose();
    }
}

export default NetworkControl;
