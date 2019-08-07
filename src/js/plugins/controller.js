/**
 * Main controller plugin, renders a list of active plugins and the ability to interact with the plugins (deactivate/active/suspend/resume)
 */

import Plugin from '../core/Plugin.js'

class Controller extends Plugin {

    constructor(pluginData) {
        super(pluginData);
        this.plugins = undefined;
        this.mainDiv = undefined;

        api.addWebSocketListener('all', (data) => {
            if (this.rendered === false)
                return;

            // check if we have a state change
            if (data.state !== undefined)
                this.render();

            // data.data? ¯\_( ͡° ͜ʖ ͡°)_/¯
            if (data.data !== undefined && data.data.suspended !== undefined)
                this.render();

        });
    }

    /**
     * API
     */
    controllerStatus(plugin) {
        const _rpc = {
            plugin : 'Controller'
        };

        if (plugin)
            _rpc.method = `status@${plugin}`;
        else
            _rpc.method = 'status';

        return api.req(undefined, _rpc);
    }

    harakiri() {
        const _rest = {
            method  : 'PUT',
            path    : 'Controller/Harakiri',
            body    : null
        };

        const _rpc = {
            plugin : 'Controller',
            method : 'harakiri',
            params : {'callsign': this.callsign}
        };

        return api.req(_rest, _rpc);
    }

    initiateDiscovery(callback) {
        const _rest = {
            method  : 'PUT',
            path    : 'Controller/Discovery',
            body    : null
        };

        const _rpc = {
            plugin : 'Controller',
            method : 'startdiscovery',
            params : {'ttl': 1}
        };

        return api.req(_rest, _rpc);
    }

    getDiscovery(callback) {
        const _rest = {
            method  : 'GET',
            path    : 'Controller/Discovery',
            body    : null
        };

        const _rpc = {
            plugin : 'Controller',
            method : 'discover',
            params : {'ttl': 1}
        };

        return api.req(_rest, _rpc);
    }

    persist(callback) {
        const _rest = {
            method  : 'PUT',
            path    : 'Controller/Persist',
            body    : null
        };

        const _rpc = {
            plugin : 'Controller',
            method : 'storeconfig'
        };

        return api.req(_rest, _rpc);
    }

    /**
     * UI
     */
    toggleActivity(callsign) {
        var plugin;

        // find plugin
        for (var i=0; i<this.plugins.length; i++) {
            if (this.plugins[i].callsign === callsign) {
                plugin = this.plugins[i];
                break;
            }
        }

        if (plugin.state === 'deactivated') {
            console.debug('Activating ' + callsign);
            this.activate(callsign).then( (resp) => {
                if (plugins[ callsign ] !== undefined)
                    plugins[ callsign ].state = 'activated';

                plugin.state = 'activated';
            }).catch( e => {
                this.render();
            });
        } else {
            console.debug('Deactivating ' + callsign);
            this.deactivate(callsign).then( (resp) => {
                if (plugins[ callsign ] !== undefined)
                    plugins[ callsign ].state = 'deactivated';

                plugin.state = 'deactivated';
            }).catch(e => {
                this.render();
            });
        }
    }

    toggleSuspend(callsign) {
        var plugin;

        // find plugin
        for (var i=0; i<this.plugins.length; i++) {
            if (this.plugins[i].callsign === callsign) {
                plugin = this.plugins[i];
                break;
            }
        }

        if (plugin.state === 'deactivated') {
            console.debug('Activating ' + callsign);
            this.activate(callsign).then( resp => {
                if (plugins[ callsign ] !== undefined)
                    plugins[ callsign ].state = 'activated';

                // we have to rerender at this stage, we're going to be out of sync
                if (document.getElementById(callsign + 'suspend').checked === false)
                    this.resume(callsign).then( this.render.bind(this) );
                else
                    api.suspendPlugin(callsign).then( this.render.bind(this));
            });

            return;
        }

        if (plugin.state === 'resumed') {
            console.debug('Suspending ' + callsign);
            this.suspend(callsign).then( resp => {
                this.updateSuspendLabel(callsign, 'resume');

                if (plugins[ callsign ] !== undefined)
                    plugins[ callsign ].state = 'resumed';

                document.getElementById(callsign + 'suspend').checked = true;
                plugin.state = 'suspended';
            });
        } else {
            console.debug('Resuming ' + callsign);
            this.resume(callsign).then( resp => {
                this.updateSuspendLabel(callsign, 'suspend');

                if (plugins[ callsign ] !== undefined)
                    plugins[ callsign ].state = 'suspended';

                document.getElementById(callsign + 'suspend').checked = false;
                plugin.state = 'resumed';
            });
        }
    }

    clear() {
        this.mainDiv.innerHTML = '';
    }

    discover() {
        console.log('Initiating discovery');
        this.initiateDiscovery();

        setTimeout(function() {
            this.getDiscovery.then( data => {
                var discoveryList = data.bridges;
                var container = document.getElementById('discoveryList');
                container.innerHTML = '';

                for (var i=0; i<discoveryList.length; i++) {
                    var li = document.createElement("li");
                    li.innerHTML = discoveryList[i].locator;
                    container.appendChild(li);
                }
            });
        }, 3000);
    }

    render() {
        this.mainDiv = document.getElementById('main');
        this.mainDiv.innerHTML = `
          <div class="title grid__col grid__col--8-of-8">
            Plugins
          </div>
          <div id="controllerPlugins"></div>
          <div class="title grid__col grid__col--8-of-8">
            Device actions
          </div>
          <div class="text grid__col grid__col--8-of-8">
            <button type="button" id="persistButton">PERSIST</button>
          </div>
          <div class="text grid__col grid__col--8-of-8">
            <button type="button" id="harakiriButton">REBOOT</button>
          </div>
          <div class="title grid__col grid__col--8-of-8">
            Discover devices
          </div>
          <div class="label grid__col grid__col--2-of-8">
            <button type="button" id="discoverButton">DISCOVER</button>
          </div>
          <div class="text grid__col grid__col--6-of-8">
            <ul id="discoveryList"></ul>
          </div>
        </div>
        `;

        document.getElementById('persistButton').onclick = this.persist.bind(this);
        document.getElementById('harakiriButton').onclick = this.reboot.bind(this);
        document.getElementById('discoverButton').onclick = this.discover.bind(this);
        var controllerPluginsDiv = document.getElementById('controllerPlugins');

        this.status.then(  data => {
            var plugins = data.plugins;
            this.plugins = plugins; // store it

            for (var i=0; i < plugins.length; i++) {
                var plugin = plugins[i];
                var callsign = plugin.callsign;
                var controlAllowed = true;

                if (callsign === 'Controller')
                    continue;

                var labelDiv = document.createElement("div");
                labelDiv.className = "label grid__col grid__col--2-of-8";
                controllerPluginsDiv.appendChild(labelDiv);

                var label = document.createElement("label");
                label.innerHTML = callsign;
                label.setAttribute("for", callsign);
                labelDiv.appendChild(label);

                var div = document.createElement("div");
                div.className = "grid__col grid__col--6-of-8 ";
                div.id =  callsign + "MainDiv";
                controllerPluginsDiv.appendChild(div);

                var checkboxDiv = document.createElement("div");
                checkboxDiv.className = "checkbox";
                div.appendChild(checkboxDiv);

                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = callsign;
                if (plugin.state == "activated" || plugin.state == "resumed" || plugin.state == "suspended") {
                    checkbox.checked = true;
                }

                checkbox.onclick = this.toggleActivity.bind(this, callsign);
                checkboxDiv.appendChild(checkbox);

                var checkboxLabel = document.createElement("label");
                checkboxLabel.setAttribute("for", callsign);
                checkboxDiv.appendChild(checkboxLabel);

                if ( (plugin.state === 'suspended') || (plugin.state === 'resumed') ) {
                    var suspend = document.createElement("div");
                    suspend.id = callsign + "suspenddiv";
                    suspend.className = "suspend";
                    var suspendCheckbox = document.createElement("input");
                    suspendCheckbox.type = "checkbox";
                    suspendCheckbox.id = callsign + "suspend";
                    if (plugin.state == "suspended") {
                        suspendCheckbox.checked = true;
                    }

                    suspendCheckbox.onclick = this.toggleSuspend.bind(this, callsign);
                    suspend.appendChild(suspendCheckbox);

                    var suspendLabel = document.createElement("label");
                    suspendLabel.setAttribute("for", callsign + "suspend");
                    suspendLabel.id = callsign + "suspendlabel";
                    if (plugin.state == "suspended") {
                        suspendLabel.innerHTML = "resume";
                    } else {
                        suspendLabel.innerHTML = "suspend";
                    }
                    suspend.appendChild(suspendLabel);
                    div.appendChild(suspend);
                }
            }
        });

        this.rendered = true;
    }

    updateSuspendLabel(callsign, nextState) {
        var suspendLabel = document.getElementById(callsign + 'suspendlabel');
        suspendLabel.innerHTML = nextState;
    }

}

function name() {
    return  'Controller';
}

export { name }
export default Controller;
