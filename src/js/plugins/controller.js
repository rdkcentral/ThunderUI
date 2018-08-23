/**
 * Main controller plugin, renders a list of active plugins and the ability to interact with the plugins (deactivate/active/suspend/resume)
 */

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
            api.activatePlugin(callsign, (err, resp) => {
                if (err) {
                    this.render();
                    return;
                }

                if (plugins[ callsign ] !== undefined)
                    plugins[ callsign ].state = 'activated';

                plugin.state = 'activated';
            });
        } else {
            console.debug('Deactivating ' + callsign);
            api.deactivatePlugin(callsign, (err, resp) => {
                if (err) {
                    this.render();
                    return;
                }

                if (plugins[ callsign ] !== undefined)
                    plugins[ callsign ].state = 'deactivated';

                plugin.state = 'deactivated';
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
            api.activatePlugin(callsign, (err, resp) => {
                if (plugins[ callsign ] !== undefined)
                    plugins[ callsign ].state = 'activated';

                // we have to rerender at this stage, we're going to be out of sync
                if (document.getElementById(callsign + 'suspend').checked === false)
                    api.resumePlugin(callsign, this.render.bind(this));
                else
                    api.suspendPlugin(callsign, this.render.bind(this));
            });


            return;
        }

        if (plugin.state === 'resumed') {
            console.debug('Suspending ' + callsign);
            api.suspendPlugin(callsign, (err, resp) => {
                if (err === null) {
                    this.updateSuspendLabel(callsign, 'resume');

                    if (plugins[ callsign ] !== undefined)
                        plugins[ callsign ].state = 'resumed';

                    document.getElementById(callsign + 'suspend').checked = true;
                    plugin.state = 'suspended';
                }
            });
        } else {
            console.debug('Resuming ' + callsign);
            api.resumePlugin(callsign, (err, resp) => {
                if (err === null) {
                    this.updateSuspendLabel(callsign, 'suspend');

                    if (plugins[ callsign ] !== undefined)
                        plugins[ callsign ].state = 'suspended';

                    document.getElementById(callsign + 'suspend').checked = false;
                    plugin.state = 'resumed';
                }

            });
        }
    }

    clear() {
        this.mainDiv.innerHTML = '';
    }

    discover() {
        console.log('Initiating discovery');
        api.initiateDiscovery();

        setTimeout(function() {
            api.getDiscovery( function(error, data) {
                if (error) {
                    console.error(error);
                    return;
                }

                var discoveryList = data.bridges;
                var container = document.getElementById('discoveryList');
                container.innerHTML = '';

                for (var i=0; i<discoveryList.length; i++) {
                    var li = document.createElement("li");
                    li.innerHTML = discoveryList[i].locator;
                    container.appendChild(li);
                }
            });
        }, 1000);
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

        document.getElementById('persistButton').onclick = api.persist.bind(api, () => {});
        document.getElementById('harakiriButton').onclick = api.reboot.bind(api, () => {});
        document.getElementById('discoverButton').onclick = this.discover.bind(this);
        var controllerPluginsDiv = document.getElementById('controllerPlugins');

        api.getControllerPlugins( (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

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

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Controller = Controller;

