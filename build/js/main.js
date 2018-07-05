/**
 * WPE Framework UI configuration file
 */
conf = {
    'refresh_interval'  : 5000,
    'cache_period'      : 500, // time the WPE API will cache the requests to prevent the device from being overladed
    'startPlugin'       : 'Controller', // the initial plugin to load
};
;/**
 * WPE Framework application.js
 *
 * Main WPE Framework UI application - initializes and starts the UI (short: WFUI?)
 * The landing page can be configured in conf.js (exposed through wfui.conf)
 */

(function () {
    /**
    * Create the initial structure & globals
    */

    // public
    plugins             = {};       // wfui plugins
    api                 = undefined; // WPE API

    // private
    var bootStep        = 1;
    var fetchedPlugins  = [];
    var mainDiv         = document.getElementById('main');
    var activePlugin    = window.localStorage.getItem(this.lastActivePlugin) || undefined;

    /**
    * Main initialization function
    *
    * Goes through a series of bootSteps to initialize the application, each step calls init again
    * Within the init a loadingPage is rendered to show progress of the boot
    * @memberof application
    */
    function init(){
        if (bootStep === 1){
            /*
             * BOOT Step 1 - Init the WPE API
             */
            console.debug('Initializing WPE API');
            var hostname = document.getElementById("hostname") && document.getElementById("hostname").value;
            if ((hostname === null) || (hostname === ""))
                hostname = window.location.hostname;

            port = document.getElementById("port") && document.getElementById("port").value;
            if ((port === null) || (port === "")) {
                if (window.location.host === window.location.hostname)
                    port = 80;
                else
                    port = window.location.host.substring(window.location.hostname.length + 1);
            }

            if ((port !== "") && (port !== 80))
                hostname += ":" + port;

            // check if wpe.js is already loaded, if not wait
            if (window.WpeApi === undefined) {
                console.debug('WPE API is not ready yet, retrying...');
                setTimeout(init, 1000);
                return;
            }

            // initialize the WPE Framework API
            api = new window.WpeApi(hostname);
            initNext();
        /*
         * BOOT Step 2 - Get the list of plugins and init each plugin
         */
        } else if (bootStep === 2){
            console.debug('Getting list of plugins from Framework');
            api.getControllerPlugins( (err, data) => {
                if (err) {
                    console.error(err);
                    setTimeout(init, conf.refresh_interval); // device is probably offline, retrying
                    return;
                }

                fetchedPlugins = data.plugins;
                initNext();
            });
        /*
         * Boot step 3 - register each plugin
         */
        } else if (bootStep === 3){
            console.debug('Loading plugins');
            // check which plugins are present on the device
            for (var i=0; i<fetchedPlugins.length; i++) {
                var pluginName = fetchedPlugins[i].callsign;
                var pluginClass = fetchedPlugins[i].classname;

                // try to init the plugin
                if (pluginClasses[ pluginClass ] !== undefined) {
                    console.debug('Initializing plugin ' + pluginName);
                    plugins[ pluginName ] = new pluginClasses[ pluginClass ](fetchedPlugins[i]);
                } else {
                    console.debug('Unsupported plugin: ' + pluginName);
                }

                if (i===fetchedPlugins.length-1)
                    initNext();
            }
        /*
         * Boot step 4 - initialize the menu
         */
        } else if (bootStep === 4){
            console.debug('Rendering menu');
            plugins.menu = new Menu();
            plugins.menu.render(activePlugin !== undefined ? activePlugin : conf.startPlugin);
            initNext();
        /*
         * Boot step 5 - render the default plugin from conf.startPlugin or the last visited from local
         */
        } else if (bootStep === 5){
            showPlugin(activePlugin !== undefined ? activePlugin : conf.startPlugin);
            initNext();
        /*
         * Boot step 6 - start the footer status bar
         */
        } else if (bootStep === 6){
            plugins.footer = new Footer();

            initNext();
        /*
         * Boot step 7 - start the notification socket
         */
        } else if (bootStep === 7){
            api.startWebSocket();
            initNext();
        /*
         * Boot step 8 - start the socket notification console
         */
        } else if (bootStep === 8){
            plugins.notifications = new Notifications();
        }
    }

    /** Find the next bootstep and go run that */
    function initNext() {
        console.debug('Bootstep ' + bootStep + ' completed');

        bootStep++;
        init();
    }

    /** (global) renders a plugin in the main div */
    showPlugin = function(callsign) {
        if (plugins[ callsign ] === undefined)
            return;

        if (activePlugin !== undefined && plugins[ activePlugin ] !== undefined)
            plugins[ activePlugin ].close();

        document.getElementById('main').innerHTML = '';
        plugins[ callsign ].render();
        activePlugin = callsign;
        window.localStorage.setItem(this.lastActivePlugin, callsign);
    };

    /** (global) refresh current active plugin */
    renderCurrentPlugin = function() {
        document.getElementById('main').innerHTML = '';
        plugins[ activePlugin ].render();
    };

    init();

})();
;/** The base plugin class applies for all plugins. Each plugin must match the name as it is returned from the WPE Framework
 * The supports object toggles what the plugin supports for the main ui
 */

class Plugin {

    /** Constructor
     * @{param} Name of the plugin for display on the UI
     * @{param} Support object to indicate plugin capabilities for the UI. Such as suspend/resume, toggle visibility and whether or not the plugin renders
     */
    constructor(pluginData) {
        this.callsign = pluginData.callsign;
        this.configuration = pluginData.configuration;
        this.classname = pluginData.classname;
        this.state = pluginData.state; // suspended, resumed, deactivated, activated
        this.supportsSuspended = false;
        this.supportsVisibility = false;
        this.renderInMenu = true;
        this.displayName = undefined;
    }

    /** The render function is called when the plugin needs to render on screen */
    render()        {}


    /** Theclose function is called when the plugin needs to clean up */
    close()         {}
}
;/*
 * WPE Framework API
 */

(function() {
    class WpeApi {
        constructor(host) {
            this.host = host;
            this.prefixForService = 'Service';
            this.mainDiv = document.getElementById('main');

            this.requestCache = {};
            this.socket = null;
            this.socketListeners = [];
        };


        lessTenSomeTimeAgo(date) {
            let someTimeAgo = Date.now() - conf.cache_period;
            return date > someTimeAgo;
        };

        createCacheKey(method, URL, body) {
            var cacheKey = method + '-' + URL;
            if (body)
                cacheKey += btoa(body);

            return cacheKey;
        };

        addToCache(method, URL, body, response) {
            var cacheKey = this.createCacheKey(method, URL, body);
            if (this.requestCache[ cacheKey ] === undefined) {
                var date = new Date();
                this.requestCache[ cacheKey ] = {
                    response    : response,
                    timestamp   : date.toISOString()
                };
            }
        };

        checkFromCache(method, URL, body, response) {
            var cacheKey = this.createCacheKey(method, URL, body);

            if (this.requestCache[ cacheKey ] !== undefined) {
                var d = new Date(this.requestCache[ cacheKey ].timestamp);

                if (this.lessTenSomeTimeAgo(d) === true) {
                    return this.requestCache[ cacheKey ].response;
                } else {
                    // it has expired, clear it
                    this.requestCache[ cacheKey ] = undefined;
                    return;
                }
            }

            return;
        };

        handleRequest(method, URL, body, callback) {
            var self = this;

            // check cache
            var cachedResponse = this.checkFromCache(method, URL, body);
            if (cachedResponse !== undefined) {
                console.debug('Serving ' + method + ' : ' + URL + ' from cache');
                callback(null, cachedResponse);
                return;
            }

            var xmlHttp = new XMLHttpRequest();
            //console.log(method + ' ' + URL + (body!==null ? '\n' + body : ''));
            xmlHttp.open(method, URL, true);
            if (callback) {
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4) {
                        if (xmlHttp.status >= 200 && xmlHttp.status <= 299) {
                            var resp;
                            if (xmlHttp.responseText !== '') {
                                try {
                                    resp = JSON.parse( xmlHttp.responseText.replace(/\\x([0-9A-Fa-f]{2})/g, '') );
                                } catch(e) {}
                            }
                            //console.log('RESP: ', resp);

                            // add to cache
                            self.addToCache(method, URL, body, resp);
                            callback(null, resp, xmlHttp.status);
                        } else if (xmlHttp.status >= 300) {
                            //console.log('ERR: ' + xmlHttp.responseText);
                            callback(xmlHttp.responseText, null);
                        } else if (xmlHttp.status === 0) {
                            //console.log('ERR: connection interrupted');
                            callback('Connection interrupted', null);
                        }
                    }
                };

                xmlHttp.ontimeout = function () {
                    callback('Connection timed out', null);
                };
            }
            if (body !== null)
                xmlHttp.send(body);
            else
                xmlHttp.send();
        }

        getURLStart(protocol, addControllerCallsign) {
            var url = protocol + "://" + this.host + '/' + this.prefixForService + '/';
            return url;
        };

        activatePlugin(plugin, callback) {
            this.handleRequest('PUT', this.getURLStart('http') + 'Controller/Activate/' + plugin, null, callback);
        };

        deactivatePlugin(plugin, callback) {
            this.handleRequest('PUT', this.getURLStart('http') + 'Controller/Deactivate/' + plugin, null, callback);
        };

        suspendPlugin(plugin, callback) {
            this.handleRequest('POST', this.getURLStart('http') + plugin + '/Suspend', null, callback);
        };

        resumePlugin(plugin, callback) {
            this.handleRequest('POST', this.getURLStart('http') + plugin + '/Resume', null, callback);
        };

        showPlugin(plugin, callback) {
            this.handleRequest('POST', this.getURLStart('http') + plugin + '/Show', null, callback);
        };

        hidePlugin(plugin, callback) {
            this.handleRequest('POST', this.getURLStart('http') + plugin + '/Hide', null, callback);
        };

        getPluginData(plugin, callback) {
            this.handleRequest('GET', this.getURLStart('http') + plugin, null, callback);
        };

        switchPlugin(plugin, callback) {
            this.handleRequest('PUT', this.getURLStart('http') + 'Controller/Switch/' + plugin, null, callback);
        };

        getControllerPlugins(callback) {
            this.handleRequest('GET', this.getURLStart('http') + 'Controller/Plugins', null, callback);
        };

        getMemoryInfo(plugin, callback) {
            this.handleRequest('GET', this.getURLStart('http') + 'Monitor/' + plugin, null, callback);
        };

        initiateDiscovery(callback) {
            this.handleRequest('PUT', this.getURLStart('http') + 'Controller/Discovery', null);
        };

        getDiscovery(callback) {
            this.handleRequest('GET', this.getURLStart('http') + 'Controller/Discovery', null, callback);
        };

        persist(callback) {
            this.handleRequest('PUT', this.getURLStart('http') + "Controller/Persist", null, callback);
        };

        reboot(callback) {
            this.handleRequest('PUT', this.getURLStart('http') + "Controller/Harakiri", null, callback);
        };

        sendKey(key, callback) {
            var body = '{"code":"' + key + '"}';
            this.handleRequest('PUT', this.getURLStart('http') + 'RemoteControl/keymap/Send', body, callback);
        };

        sendKeyPress(key, callback) {
            var body = '{"code":"' + key + '"}';
            this.handleRequest('PUT', this.getURLStart('http') + 'RemoteControl/keymap/Press', body, callback);
        };

        sendKeyRelease(key, callback) {
            var body = '{"code":"' + key + '"}';
            this.handleRequest('PUT', this.getURLStart('http') + 'RemoteControl/keymap/Release', body, callback);
        };

        toggleTracing(module, id, state, callback) {
            this.handleRequest('PUT', this.getURLStart('http') + 'Tracing' +  '/' + module + '/' + id + '/' + state, null, callback);
        };

        setUrl(plugin, url, callback) {
            var body = '{"url":"' + url + '"}';
            this.handleRequest('POST', this.getURLStart('http') + plugin + '/URL', body, callback);
        };

        startWebShell(callback) {
            var webShellSocket = new WebSocket(this.getURLStart('ws') + 'WebShell', 'raw');
            callback(null, webShellSocket);
        };

        startWebSocket() {
            if (this.socket) this.socket.close();
            this.socket = new WebSocket(this.getURLStart('ws') + 'Controller', 'notification');
            var self = this;
            this.socket.onmessage = function(e){
                var data = {};
                var callsign = '';
                try {
                    data = JSON.parse(e.data);
                    for (var i in data) {
                        if (i === 'callsign') {
                            callsign = data[i];
                            break;
                        }
                    }
                } catch (e) {
                    return console.error('SocketNotificationError', e);
                }

                for(var i in self.socketListeners)
                    if (!self.socketListeners[i].callsign || callsign === self.socketListeners[i].callsign) self.socketListeners[i].fn(data);

            };
        };

        addWebSocketListener(method, callsign) {
            var obj = {
                fn: method,
                callsign: callsign
            };
            if (typeof method === 'function' && this.socketListeners.indexOf(obj) === -1)
                this.socketListeners.push(obj);

            return this.socketListeners.length - 1;
        };

        removeWebSocketListener(index) {
            if (this.socketListeners[index])
                this.socketListeners.splice(index, 1);
        };

        getSnapshotLocator(callback) {
            return this.getURLStart('http') + 'Snapshot/Capture?' + new Date().getTime();
        };

        triggerProvisioning(callback) {
            this.handleRequest('PUT', this.getURLStart('http') + 'Provisioning', null, callback);
        };

        putPlugin(plugin, action, body, callback) {
            this.handleRequest('PUT', this.getURLStart('http') + plugin + '/' + action, body, callback);
        };

        postPlugin(plugin, action, body, callback) {
            this.handleRequest('POST', this.getURLStart('http') + plugin + '/' + action, body, callback);
        };

        deletePlugin(plugin, action, body, callback) {
            this.handleRequest('DELETE', this.getURLStart('http') + plugin + '/' + action, body, callback);
        };

    }


window.WpeApi = WpeApi;

})();
;/** The footer bar provides stats on the current device */

class Footer {
    constructor() {
        this.renderInMenu   = false;
        this.connected      = true;
        this.footer         = document.getElementById('statusBar');

        this.footer.innerHTML = `
            <div class="status">
                <label>Version</label>
                <span id="statusBarVersion">-</span>
            </div>

            <div class="status">
                <label>Serial</label>
                <span id="statusBarSerial">-</span>
            </div>

            <div class="status">
                <label>Uptime</label>
                <span id="statusBarUptime">-</span>
            </div>

            <div class="status">
                <label>CPU load</label>
                <span id="statusBarCpuLoad">-</span>
            </div>

            <div class="status">
                <label>RAM used</label>
                <span id="statusBarUsedRam">-</span>
                <span>/</span>
                <span id="statusBarTotalRam">-</span>
            </div>

            <div class="status">
                <label>GPU RAM used</label>
                <span id="statusBarGpuRamUsed">-</span>
                <span>/</span>
                <span id="statusBarGpuRamTotal">-</span>
            </div>

            <div class="status">
                <label class="statusBarKeyPress" id="keyPressedLabel">Last key send</label>
                <span class="statusBarKeyPress" id="keyPressed">-</span>
            </div>

            <span id="pause-button" onclick="pause();">hide statistics</span>
          `;

        // bind span elements
        this.versionSpan      = document.getElementById('statusBarVersion');
        this.uptimeSpan       = document.getElementById('statusBarUptime');
        this.serialSpan       = document.getElementById('statusBarSerial');
        this.cpuLoadSpan      = document.getElementById('statusBarCpuLoad');
        this.usedRamSpan      = document.getElementById('statusBarUsedRam');
        this.totalRamSpan     = document.getElementById('statusBarTotalRam');
        this.gpuUsedRamSpan   = document.getElementById('statusBarGpuRamUsed');
        this.gpuTotalRamSpan  = document.getElementById('statusBarGpuRamTotal');

        // hooks
        document.getElementById('pause-button').onclick = this.togglePause.bind(this);
        this.pauseButton      = document.getElementById('pause-button');

        if (plugins.DeviceInfo === undefined)
            return;

        // start update loop
        this.interval = setInterval(this.update.bind(this), conf.refresh_interval);
        this.update();

    }

    render(error, deviceInfo) {
        if (error !== null) {
            console.error(error);
            this.deviceIsConnected(false);
            return;
        }

        if (deviceInfo === undefined)
            return;

        this.deviceIsConnected(true);

        this.versionSpan.innerHTML      = deviceInfo.systeminfo.version;
        this.serialSpan.innerHTML       = deviceInfo.systeminfo.deviceid;
        this.uptimeSpan.innerHTML       = deviceInfo.systeminfo.uptime;
        this.totalRamSpan.innerHTML     = this.bytesToMbString(deviceInfo.systeminfo.totalram);
        this.usedRamSpan.innerHTML      = this.bytesToMbString(deviceInfo.systeminfo.totalram - deviceInfo.systeminfo.freeram);
        this.gpuTotalRamSpan.innerHTML  = this.bytesToMbString(deviceInfo.systeminfo.totalgpuram);
        this.gpuUsedRamSpan.innerHTML   = this.bytesToMbString(deviceInfo.systeminfo.totalgpuram - deviceInfo.systeminfo.freegpuram);
        this.cpuLoadSpan.innerHTML      = parseFloat(deviceInfo.systeminfo.cpuload).toFixed(1) + " %";
    }

    update() {
        if (this.paused === true || plugins.DeviceInfo.state === 'deactivated')
            return;

        api.getPluginData('DeviceInfo', this.render.bind(this));
    }

    togglePause() {
        this.pauseButton.innerHTML = (this.paused === true) ? 'hide statistics' : 'show statistics';

        var elements = this.footer.getElementsByClassName('status'),
            i = 0;

        if (this.paused === true) {
            for(i; i < elements.length; i++) {
                elements[i].style.display = 'block';
            }
            this.footer.style.padding = '5px';
        } else {
            for(i; i < elements.length; i++) {
                elements[i].style.display = 'none';
            }
            this.footer.style.padding = '0px';
        }

        document.getElementById('notifications-block').style.bottom = (this.paused === true) ? "300px" : "60px";

        this.paused = (this.paused === true) ? false : true;
    }

    deviceIsConnected(connected) {
        // state did not change
        if (this.connected === connected)
            return;

        var disconnectedEl = document.getElementById('disconnected');
        var disconnectedHtml = `<div id="disconnectedBlock">
            <div id="message">No connection with device</div>
            <div id="reconnect" class="loading">Attempting to connect</div>
        </div>`;

        if (connected === true) {
            disconnectedEl.innerHTML = '';
            disconnectedEl.style.display = 'none';

            //refresh state after coming back online
            plugins.menu.render();
            renderCurrentPlugin();
        } else {
            disconnectedEl.innerHTML = disconnectedHtml;
            disconnectedEl.style.display = 'block';
        }

        this.connected = connected;
    }

    bytesToMbString(bytes) {
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }
}
;/** The side navigation menu provides navigation across the different plugins */

class Menu {
    constructor() {
        this.top            = document.getElementById('top');
        this.renderInMenu   = false;

        var bodyEl = document.getElementsByTagName('body')[0];

        try {
            document.createEvent('TouchEvent');
            this.nav.style.left = '-600px';
            bodyEl.classList.remove('desktop');
            bodyEl.className = 'touch';
            this.isTouchDevice = true;
        } catch(e) {}

        // add the top header + logo + keyboard hooks
        this.top.innerHTML = `<div id="header" class="header">
          <div id="button-left" class="fa fa-bars left"></div>
        </div>

        <!--navigation-->
        <div id="menu" class="navigation"></div>
        `;

        this.header = document.getElementById('header');
        this.nav = document.getElementById('menu');

        // for some reason WPE Framework stores everything under /UI/ and relative paths dont work :( so heres a workaround
        var logoLoadError = false;
        var logo = new Image();
        logo.alt = 'Metrological';
        logo.onload = () => {
            this.header.appendChild(logo);
        };

        logo.onerror= () => {
            if (logoLoadError === true)
                return;

            logo.src='UI/img/ml.svg';
            logoLoadError = true;
        };

        logo.src='img/ml.svg';

        // hooks
        document.getElementById('button-left').onclick = this.showMenu.bind(this);

        window.onresize = function () {
            if (this.isTouchDevice === true)
                return;

            var menu = document.getElementById('menu');
            if (window.innerWidth > 960) {
                menu.style.left = '0px';
            } else {
                menu.style.left = '-600px';
            }
        };
    }

    clear() {
        this.nav.innerHTML = '';
    }

    render(activePlugin) {
        this.clear();

        api.getControllerPlugins( (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            var _plugins = data.plugins;
            var enabledPlugins = Object.keys(plugins);
            var ul = document.createElement('ul');

            for (var i = 0; i<_plugins.length; i++) {
                var plugin = _plugins[i];

                if (plugin.state !== 'deactivated' && enabledPlugins.indexOf(plugin.callsign) != -1 && plugins[ plugin.callsign ].renderInMenu === true) {
                    console.debug('Menu :: rendering ' + plugin.callsign);
                    var li = document.createElement('li');
                    li.id = "item_" + plugin.callsign;

                    if (activePlugin === undefined && i === 0) {
                        li.className = 'menu-item active';
                    } else if (activePlugin === plugin.callsign) {
                        li.className = 'menu-item active';
                    } else {
                        li.className = 'menu-item';
                    }

                    li.appendChild(document.createTextNode(plugins[ plugin.callsign ].displayName !== undefined ? plugins[ plugin.callsign ].displayName : plugin.callsign));
                    li.onclick = this.toggleMenuItem.bind(null, plugin.callsign);
                    ul.appendChild(li);
                    this.nav.appendChild(ul);
                }
            }
        });
    }

    update() {
        // just re-render for now
        this.render();
    }

    toggleMenuItem(callsign) {
        var items = document.getElementsByClassName('menu-item');
        for (var i = 0; i < items.length; i++) {
            if ('item_' + callsign === items[i].id) {
                items[i].className = 'menu-item active';
            } else {
                items[i].className = 'menu-item';
            }

        }

        showPlugin(callsign);
    }

    showMenu() {
        var menu = document.getElementById('menu');

        if (menu.style.left === '0px') {
            menu.style.left = '-600px';
        } else {
            menu.style.left = '0px';
        }
    }
}
;/** The footer bar provides stats on the current device */

class Notifications {
    constructor() {
        this.renderInMenu = false;
        api.addWebSocketListener(this.handleNotification.bind());

        document.getElementById('hide-notifications').onclick = this.toggleVisibility.bind(this);
    }

    handleNotification(data) {
        document.getElementById('notifications-block').style.display = "block"


        var div = document.createElement('div')

        var string = ''

        var i = 0
        for (var key1 in data) {
            if (data[key1] === 'Monitor') {
                div.className = 'red'
            }
            if (key1 === "callsign") {
                var label = document.createElement('label')
                label.innerHTML = '"' + data[key1] + '"'
                div.appendChild(label)
            } else if (key1 === "data") {
                string = string + key1 + ': {'
                var o = 0
                for (var key2 in data.data) {
                    string = string + key2 + ': ' + data.data[key2]
                    if (o == Object.keys(data.data).length - 1) {
                        string = string + '}'
                    } else {
                        string = string + ', '
                    }
                    o++
                }
            } else {
                string = string + key1 + ': ' + data[key1]
            }
            if (key1 != "callsign" && i != Object.keys(data).length - 1) {
                string = string + ', '
            }
            i++
        }

        var span = document.createElement('span')
        span.innerHTML = string
        div.appendChild(span)

        document.getElementById('notifications').appendChild(div)
        document.getElementById('notifications').scrollTop= document.getElementById('notifications').scrollHeight
    }

    toggleVisibility() {
        var isVisible = (document.getElementById('notifications').style.display === 'block');
        document.getElementById('notifications').style.display = isVisible ? "none" : "block"
        document.getElementById('hide-notifications').innerHTML = isVisible ? "show console" : "hide console"
    }

}
;/** The wifi plugin provides details on the available Wifi Adapters, scans for networks and allows the user to join networks through the UI
 */

/** The bluetooth plugin provides details on the available bluetooth devices, scans for new devices and allows the user to connect the device through UI
 */
class Bluetooth extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.discoveredDevices = [];
        this.pairedDevices = [];
        this.scanning = false;
        this.connected = undefined;
        this.displayName = 'Bluetooth';
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Status
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Connected to
        </div>
        <div id="BT_Connected" class="text grid__col grid__col--6-of-8"></div>

        <div class="label grid__col grid__col--2-of-8">
            Scanning
        </div>
        <div id="BT_Scanning" class="text grid__col grid__col--6-of-8">
            OFF
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Connected devices
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_Devices"></select>
        </div>

        <div class="label grid__col grid__col--2-of-8"></div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_Connect">Connect</button>
            <button type="button" id="BT_Disconnect">Disconnect</button>
        </div>

        <div class="title grid__col grid__col--8-of-8">
            Discovery
        </div>


        <div class="label grid__col grid__col--2-of-8">
            Discovered Devices
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_DiscoveredDevices"></select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_ScanForDevices">Scan</button>
            <button type="button" id="BT_Pair">Pair</button>
        </div>

        <br>

        <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>
        `;

        // bind elements

        // ---- button ----
        this.scanButton                 = document.getElementById('BT_ScanForDevices');
        this.pairButton                 = document.getElementById('BT_Pair');
        this.connectButton              = document.getElementById('BT_Connect');
        this.disconnectButton           = document.getElementById('BT_Disconnect');

        //bind buttons
        this.scanButton.onclick         = this.scanForDevices.bind(this);
        this.pairButton.onclick         = this.pairDevice.bind(this);
        this.disconnectButton.onclick   = this.disconnect.bind(this);
        this.connectButton.onclick      = this.connect.bind(this);

        // ---- Status -----
        this.connectedStatus            = document.getElementById('BT_Connected');
        this.scanningStatus             = document.getElementById('BT_Scanning');
        this.statusMessages             = document.getElementById('statusMessages');

        // ---- Devices -----
        this.devicesListEl              = document.getElementById('BT_Devices');

        // ---- Discovered Devices ----
        this.discoveredDevicesEl        = document.getElementById('BT_DiscoveredDevices');

        this.checkDeviceScanning();
        this.getPairedDevices();
        setTimeout(this.update.bind(this), 2000);
    }

    /* ----------------------------- DATA ------------------------------*/

    update() {
        api.getPluginData(this.callsign, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined)
                return;

            this.connected = resp.connected;

            if (typeof resp.scanning === 'boolean')
                this.scanning = resp.scanning;

            this.renderStatus();
        });
    }

    getPairedDevices() {
        api.getPluginData(this.callsign + '/PairedDevices', (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined || resp.DeviceList.length < 0)
                return;

            this.pairedDevices = resp.DeviceList;

            this.renderPairedDevices();
        });
    }

    getDiscoveredDevices() {
        if (this.scanning === true) {
            api.getPluginData(this.callsign + '/DiscoveredDevices', (err, resp) => {
                    if (err !== null) {
                    console.error(err);
                    return;
                }

                // bail out if the plugin returns nothing
                if (resp === undefined || resp.DeviceList.length < 0)
                    return;

                this.discoveredDevices = resp.DeviceList;
                this.renderDiscoveredDevices();
            });
        }
    }

    checkDeviceScanning() {
        api.getPluginData(this.callsign, (err, resp) => {
            if (resp.scanning) {
                this.stopScan();
            }
        });
    }

    /* ----------------------------- RENDERING ------------------------------*/

    renderStatus () {
        if (this.connected !== '') {
            var deviceInfo = this.pairedDevices.find(deviceInfo=>deviceInfo.Address==this.connected);
            this.connectedStatus.innerHTML = deviceInfo.Name;
        } else
            this.connectedStatus.innerHTML = 'Not Connected';

        this.scanningStatus.innerHTML = this.scanning === true ? 'ON' : 'OFF';
    }

    renderPairedDevices () {
        this.devicesListEl.innerHTML = '';
        for (var i=0; i<this.pairedDevices.length; i++) {
            var newChild = this.devicesListEl.appendChild(document.createElement("option"));
            if (this.pairedDevices[i].Name === "")
                newChild.innerHTML = `${this.pairedDevices[i].Address}`;
            else
                newChild.innerHTML = `${this.pairedDevices[i].Name}`;
        }
    }

    renderDiscoveredDevices () {
        this.discoveredDevicesEl.innerHTML = '';
        for (var i=0; i<this.discoveredDevices.length; i++) {
            var newChild = this.discoveredDevicesEl.appendChild(document.createElement("option"));
            if (this.discoveredDevices[i].Name === "")
                newChild.innerHTML = `${this.discoveredDevices[i].Address}`;
            else
                newChild.innerHTML = `${this.discoveredDevices[i].Name}`;

            newChild.value = JSON.stringify(this.discoveredDevices[i]);
        }
    }

    status(message) {
        window.clearTimeout(this.statusMessageTimer);
        this.statusMessages.innerHTML = message;

        // clear after 5s
        this.statusMessageTimer = setTimeout(this.status, 5000, '');
    }

    /* ----------------------------- BUTTONS ------------------------------*/

    scanForDevices() {
        this.status(`Start scanning`);
        api.putPlugin(this.callsign, 'Scan', null, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // update after 2s
            setTimeout(this.update.bind(this), 2000);

            // update discovered device list in every 4s
            this.Timer = setInterval(this.getDiscoveredDevices.bind(this), 4000);

            this.status(`Scanning...`);
            // stop scan after 1 min
            setTimeout(this.stopScan.bind(this), 60000);

        });
    }

    stopScan() {
        this.status(`Stopping Scan`);
        api.putPlugin(this.callsign, 'StopScan', null, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            clearInterval(this.Timer);
            setTimeout(this.update.bind(this), 2000);
            this.status(`Scan stopped`);
        });
    }

    pairDevice() {
        var val = JSON.parse(document.getElementById('BT_DiscoveredDevices').value);
        if (val.Name === "")
            this.status(`Pairing with ${val.Address}`);
        else
            this.status(`Pairing with ${val.Name}`);

        api.putPlugin(this.callsign, 'Pair', '{"Address" : "' + val.Address + '"}', (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // update Paired device list after 2s
            setTimeout(this.getPairedDevices.bind(this), 2000);
            setTimeout(this.renderPairedDevices.bind(this), 3000);
        });
    }

    connect() {
        var idx = this.devicesListEl.selectedIndex;

        this.status(`Connecting to ${this.pairedDevices[idx].Name}`);
        api.putPlugin(this.callsign, 'Connect', '{"Address" : "' + this.pairedDevices[idx].Address + '"}', (err,resp) =>{
            if (err !== null) {
                console.error(err);
                return;
            }

            // update after 2s
            setTimeout(this.update.bind(this), 2000);
        });
    }

    disconnect() {
        this.status(`Disconnecting to ${this.connected}`);
        api.deletePlugin(this.callsign, 'Connect', null, (err,resp) =>{
            if (err !== null) {
                console.error(err);
                return;
            }

            // update after 2s
            setTimeout(this.update.bind(this), 2000);
        });
    }

}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Bluetooth = Bluetooth;
;

/** The compositor plugin manages the Westeros compositor and its cliens through the webui
 */
class Compositor extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.resolutions = ['720p', '720p50Hz', '1080p24Hz', '1080i50Hz', '1080p50Hz', '1080p60Hz'];
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Compositor
        </div>
        <div class="label grid__col grid__col--2-of-8">
            <label for="compositorResolutions">Resolution</label>
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="compositorResolutions"></select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
            <label for="compositorClients">Clients</label>
        </div>
        <div class="text grid__col grid__col--6-of-8" id="compositorClientsDiv">
            <select id="compositorClients"></select>
        </div>
        <div class="text grid__col grid__col--8-of-8"></div>

        <div id="controls"></div>`;


        // bind buttons & sliders
        document.getElementById('compositorResolutions').onclick     = this.setResolution.bind(this);

        // bind fields
        this.resolutionsList    = document.getElementById('compositorResolutions');
        this.menu               = document.getElementById('compositorClients');
        this.controlDiv         = document.getElementById('controls');
        this.compositorClientsDiv = document.getElementById('compositorClientsDiv');

        // update resolutions field
        this.resolutionsList.innerHTML = '';

        for (var i = 0; i < this.resolutions.length; i++) {
            var _item = document.createElement('option');
            _item.value = this.resolutions[i];
            _item.innerHTML = this.resolutions[i];
            this.resolutionsList.appendChild(_item);
        }

        // get clients
        api.getPluginData(this.callsign, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // compositor is not returning anything, guess we're in client mode and not managing nxserver
            if (resp === undefined || resp === null || resp.clients === undefined) {
                this.compositorClientsDiv.innerHTML = 'No clients found.';
                return;
            }

            if (resp.clients.length > 0) {
                this.renderControls(resp.clients);
            }
        });
    }

    renderControls(clients) {
        this.controlDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Controls
        </div>        
        <div class="text grid__col grid__col--2-of-8">
            Focus
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="compositorSetTop">Set Top</button>
            <button type="button" id="compositorSetInput">Set Input</button>
        </div>
        <div class="text grid__col grid__col--8-of-8"></div>
        <div class="text grid__col grid__col--2-of-8">
            Opacity
        </div>
        <div class="text grid__col grid__col--3-of-8">
            <div width=100px>
                <input id="sliderOpacity" type="range" min="0" max="256" step="1" value="256"/>
            </div>
        </div>
        <div class="text grid__col grid__col--2-of-8">
            <input type="number" min="0" max="256" id="numOpacity" size="5" value="256"/>
        </div>
        <div class="text grid__col grid__col--1-of-8">
            <button type="button" id="compositorSetOpacity">Set</button>
        </div>
        <div class="text grid__col grid__col--8-of-8"></div>
        <div class="text grid__col grid__col--2-of-8">
            Visibility
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="webkit_hide">Hide</button>
            <button type="button" id="webkit_show">Show</button>
        </div>
        <div class="text grid__col grid__col--8-of-8"></div>
        <div class="text grid__col grid__col--2-of-8">
            Geometry
        </div>
        <div class="text grid__col grid__col--1-of-8">
            <input id="compositorXGeometry" type="number" value="0"/>
        </div>
        <div class="text grid__col grid__col--1-of-8">
            <input id="compositorYGeometry" type="number" value="0"/>
        </div>
        <div class="text grid__col grid__col--1-of-8">
            <input id="compositorWidthGeometry" type="number" value="1280" min="0"/>
        </div>
        <div class="text grid__col grid__col--1-of-8">
            <input id="compositorHeightGeometry" type="number" value="720" min="0"/>
        </div>
        <div class="text grid__col grid__col--1-of-8">
            <button type="button" id="compositorGeometry">Set</button>
        </div>`;

        document.getElementById('compositorSetTop').onclick         = this.compositorAction.bind(this, 'Top');
        document.getElementById('compositorSetInput').onclick       = this.compositorAction.bind(this, 'Input');
        document.getElementById('sliderOpacity').onchange           = this.updateValue.bind(this, 'sliderOpacity', 'numOpacity');
        document.getElementById('numOpacity').onchange              = this.updateValue.bind(this, 'numOpacity', 'sliderOpacity');
        document.getElementById('numOpacity').onkeyup               = this.updateValue.bind(this, 'numOpacity', 'sliderOpacity');
        document.getElementById('numOpacity').onpaste               = this.updateValue.bind(this, 'numOpacity', 'sliderOpacity');
        document.getElementById('numOpacity').oninput               = this.updateValue.bind(this, 'numOpacity', 'sliderOpacity');
        document.getElementById('compositorSetOpacity').onclick     = this.compositorSetOpacity.bind(this);
        document.getElementById('webkit_hide').onclick              = this.compositorVisible.bind(this, 'Hide');
        document.getElementById('webkit_show').onclick              = this.compositorVisible.bind(this, 'Show');
        document.getElementById('compositorGeometry').onclick       = this.compositorSetGeometry.bind(this);

        var menu = document.getElementById('compositorClients');
        menu.innerHTML = '';
        var item = document.createElement('option');

        item.value = '';
        item.setAttributeNode(document.createAttribute('disabled'));
        item.setAttributeNode(document.createAttribute('selected'));
        item.innerHTML = 'Select a client';
        menu.appendChild(item);

        for (var i = 0; i < clients.length; i++) {
            var _item = document.createElement('option');
            _item.value = clients[i];
            _item.innerHTML = clients[i];
            menu.appendChild(_item);
        }
    }

    compositorAction(action) {
        var client = this.menu.options[this.menu.selectedIndex].value;
        api.postPlugin(this.callsign, client + '/' + action, null, (err, resp) => {
            if (err)
                console.error(err);
        });
    }

    compositorSetOpacity() {
        var client = this.menu.options[this.menu.selectedIndex].value;
        var opacity = document.getElementById('sliderOpacity').value;
        api.postPlugin(this.callsign, client + '/Opacity/' + opacity, null, (err, resp) => {
            if (err)
                console.error(err);
        });
    }

    updateValue(element, toUpdateElement) {
        document.getElementById(toUpdateElement).value = document.getElementById(element).value;
    }

    compositorVisible(state) {
        var client = this.menu.options[this.menu.selectedIndex].value;
        api.postPlugin(this.callsign, client + '/Visible/' + state, null, (err, resp) => {
            if (err)
                console.error(err);
        });
    }

    compositorSetGeometry() {
        var client = this.menu.options[this.menu.selectedIndex].value;
        var x = document.getElementById('compositorXGeometry').value;
        var y = document.getElementById('compositorYGeometry').value;
        var w = document.getElementById('compositorWidthGeometry').value;
        var h = document.getElementById('compositorHeightGeometry').value;

        api.postPlugin(this.callsign, client + '/Geometry/' + x + '/' + y + '/' + w + '/' + h, null, (err, resp) => {
            if (err)
                console.error(err);
        });
    }

    setResolution() {
        var _res = this.resolutionsList.options[this.resolutionsList.selectedIndex].value;

        api.postPlugin(this.callsign, 'Resolution/' + _res, null, (err, resp) => {
            if (err)
                console.error(err);
        });
    }

}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Compositor = Compositor;
;/**
 * Main controller plugin, renders a list of active plugins and the ability to interact with the plugins (deactivate/active/suspend/resume)
 */

class Controller extends Plugin {

    constructor(pluginData) {
        super(pluginData);
        this.plugins = undefined;
        this.mainDiv = undefined;
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
                this.reloadMenu();
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
                this.reloadMenu();
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
    }

    updateSuspendLabel(callsign, nextState) {
        var suspendLabel = document.getElementById(callsign + 'suspendlabel');
        suspendLabel.innerHTML = nextState;
    }

    reloadMenu() {
        if (plugins.menu !== undefined)
            plugins.menu.render();
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Controller = Controller;

;/** Device info plugin provides device specific information, such as cpu usage and serial numbers */

class DeviceInfo extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.renderInMenu = true;
        this.displayName = 'Device Info';
        this.deviceInfoDiv = undefined;
        this.mainDiv = document.getElementById('main');
        this.selectedNetworkInterface = 0;

        this.deviceNameEl       = undefined;
        this.serialNumberEl     = undefined;
        this.deviceIdEl         = undefined;
        this.versionEl          = undefined;
        this.uptimeEl           = undefined;
        this.totalRamEl         = undefined;
        this.usedRamEl          = undefined;
        this.freeRamEl          = undefined;
        this.usedGpuRamEl       = undefined;
        this.freeGpuRamEl       = undefined;
        this.totalGpuRamEl      = undefined;
        this.cpuLoadEl          = undefined;

        this.interfacesOptsEl   = undefined;
        this.macIdEl            = undefined;
        this.ipAddressEl        = undefined;

        this.template = `<div class="title grid__col grid__col--8-of-8">
            Device
          </div>

          <div class="label grid__col grid__col--2-of-8">
            Name
          </div>
          <div id="DeviceName" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            S/N
          </div>
          <div id="SerialNumber" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Identifier
          </div>
          <div id="DeviceId" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Version
          </div>
          <div id="Version" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Network Interface
          </div>
          <div class="text grid__col grid__col--6-of-8">
            <select id="NetworkInterface">
            </select>
          </div>
          <div class="label grid__col grid__col--2-of-8">
            MAC
          </div>
          <div id="MAC_ID" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            IP
          </div>
          <div id="IpAddress" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Uptime
          </div>
          <div id="Uptime" class="text grid__col grid__col--6-of-8">
            -
          </div>

          <div class="title grid__col grid__col--8-of-8">
            RAM
          </div>

          <div class="label grid__col grid__col--2-of-8">
          Total RAM
          </div>
          <div id="TotalRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Used RAM
          </div>
          <div id="UsedRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Free RAM
          </div>
          <div id="FreeRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Total GPU RAM
          </div>
          <div id="TotalGpuRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Used GPU RAM
          </div>
          <div id="UsedGpuRam" class="text grid__col grid__col--6-of-8">
            -
          </div>
          <div class="label grid__col grid__col--2-of-8">
            Free GPU RAM
          </div>
          <div id="FreeGpuRam" class="text grid__col grid__col--6-of-8">
            -
          </div>

          <div class="title grid__col grid__col--8-of-8">
            CPU
          </div>

          <div class="label grid__col grid__col--2-of-8">
            CPU Load
          </div>
          <div id="CpuLoad" class="text grid__col grid__col--6-of-8">
            -
          </div>`;
    }

    update() {
        var _updateCb = function(error, deviceInfo) {
            if (error !== null) {
                console.error(error);
                return;
            }

            this.deviceNameEl.innerHTML         = deviceInfo.systeminfo.devicename;
            this.deviceIdEl.innerHTML           = deviceInfo.systeminfo.deviceid;
            this.serialNumberEl.innerHTML       = deviceInfo.systeminfo.serialnumber;
            this.versionEl.innerHTML            = deviceInfo.systeminfo.version;
            this.uptimeEl.innerHTML             = deviceInfo.systeminfo.uptime;
            this.totalRamEl.innerHTML           = this.bytesToMbString(deviceInfo.systeminfo.totalram);
            this.usedRamEl.innerHTML            = this.bytesToMbString(deviceInfo.systeminfo.totalram - deviceInfo.systeminfo.freeram);
            this.freeRamEl.innerHTML            = this.bytesToMbString(deviceInfo.systeminfo.freeram);
            this.totalGpuRamEl.innerHTML        = this.bytesToMbString(deviceInfo.systeminfo.totalgpuram);
            this.freeGpuRamEl.innerHTML         = this.bytesToMbString(deviceInfo.systeminfo.freegpuram);
            this.usedGpuRamEl.innerHTML         = this.bytesToMbString(deviceInfo.systeminfo.totalgpuram - deviceInfo.systeminfo.freegpuram);
            this.cpuLoadEl.innerHTML            = parseFloat(deviceInfo.systeminfo.cpuload).toFixed(1) + " %";

            this.interfacesOptsEl.innerHTML = '';
            for (var i=0; i<deviceInfo.addresses.length; i++) {
                var newChild = this.interfacesOptsEl.appendChild(document.createElement("option"));
                newChild.innerHTML = deviceInfo.addresses[i].name;
            }

            this.interfacesOptsEl.selectedIndex = this.selectedNetworkInterface;

            this.macIdEl.innerHTML = deviceInfo.addresses[this.selectedNetworkInterface].mac;

            if (deviceInfo.addresses[this.selectedNetworkInterface].ip !== undefined)
                this.ipAddressEl.innerHTML = deviceInfo.addresses[this.selectedNetworkInterface].ip;
            else
                this.ipAddressEl.innerHTML = '-';

        };

        api.getPluginData('DeviceInfo', _updateCb.bind(this));
    }

    render() {
        this.mainDiv.innerHTML = this.template;

        this.deviceNameEl       = document.getElementById("DeviceName");
        this.deviceIdEl         = document.getElementById("DeviceId");
        this.serialNumberEl     = document.getElementById("SerialNumber");
        this.versionEl          = document.getElementById("Version");
        this.uptimeEl           = document.getElementById("Uptime");
        this.totalRamEl         = document.getElementById("TotalRam");
        this.usedRamEl          = document.getElementById("UsedRam");
        this.freeRamEl          = document.getElementById("FreeRam");
        this.totalGpuRamEl      = document.getElementById("TotalGpuRam");
        this.freeGpuRamEl       = document.getElementById("FreeGpuRam");
        this.usedGpuRamEl       = document.getElementById("UsedGpuRam");
        this.cpuLoadEl          = document.getElementById("CpuLoad");

        this.interfacesOptsEl   = document.getElementById("NetworkInterface");
        this.interfacesOptsEl.onchange = this.updateNetworkInterface.bind(this);
        this.macIdEl            = document.getElementById("MAC_ID");
        this.ipAddressEl        = document.getElementById("IpAddress");

        this.update();
    }

    updateNetworkInterface(deviceInfo) {
        this.selectedNetworkInterface = this.interfacesOptsEl.selectedIndex;
        this.update();
    }

    bytesToMbString(bytes) {
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.DeviceInfo = DeviceInfo;
;/**  Monitor plugin
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
;/** The Netflix plugin provides details on the netflix instance
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
;/** The ocdm plugin manages different OpenCDM DRM modules
 */

class OCDM extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.ocdmTemplate = `<div class="label grid__col grid__col--2-of-8">
            {{Name}}
        </div>
        <div class="text grid__col grid__col--6-of-8">
            {{Designators}}
        </div>`;
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            OpenCDM Systems
        </div>
        <div id="systemDiv"></div>`;

        this.systemDiv = document.getElementById('systemDiv');
        this.update();
    }

    update() {
        api.getPluginData(this.callsign, (err, resp) => {
            if (err) {
                console.error(err);
                return;
            }

            if (resp === undefined || resp === null || resp.systems === undefined)
                return;


            for (var i=0; i<resp.systems.length; i++) {
                var system = resp.systems[i];

                var systemElement = this.ocdmTemplate.replace('{{Name}}', system.name);
                systemElement = systemElement.replace('{{Designators}}', system.designators.toString());
                this.systemDiv.innerHTML += systemElement;
            }
        });
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.OCDM = OCDM;
;/** The provision plugin checks the device identifier and is able to initiate a provisioning request if not provisioned
 */

class Provisioning extends Plugin {

    constructor(pluginData) {
        super(pluginData);
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

        api.triggerProvisioning( (error, response) => {
            document.getElementById('provisionButton').style.display = 'none';
            document.getElementById('provisionLabel').style.display = 'none';

            setTimeout(self.update(), 3000);
        });
    }
 }

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Provisioning = Provisioning;
;/** Keyboard provides an onscreen keyboard for touch based devices
 * This file is instantiated by menu.js
 */

class RemoteControl extends Plugin {

    constructor(pluginData) {
        super(pluginData);
        this.displayName = 'Remote Control';
        this.onScreenKeyBoardIsRendered     = false;
        this.doNotHandleKeys                = false;
        this.devicesThatSupportPairing      = ['GreenPeakRF4CE'];

        /**
         * Human to WPE key codes.
         * Note! This Array is drawn as the on screen keyboard in ASC order.
         *       Changing the order or adding stuff will add it to the render loop  for the keyboard
         */
        this.keyMapping = {
            '1'     : { code : '0x0021', color: undefined, string: '1' },
            '2'     : { code : '0x0022', color: undefined, string: '2' },
            '3'     : { code : '0x0023', color: undefined, string: '3' },
            '4'     : { code : '0x0024', color: undefined, string: '4' },
            '5'     : { code : '0x0025', color: undefined, string: '5' },
            '6'     : { code : '0x0026', color: undefined, string: '6' },
            '7'     : { code : '0x0027', color: undefined, string: '7' },
            '8'     : { code : '0x0028', color: undefined, string: '8' },
            '9'     : { code : '0x0029', color: undefined, string: '9' },
            '0'     : { code : '0x0020', color: undefined, string: '0' },
            'exit'  : { code : '0x0009', color: 'blue',    string: 'exit' },
            'a'     : { code : '0x8004', color: undefined, string: 'a' },
            'b'     : { code : '0x8005', color: undefined, string: 'b' },
            'c'     : { code : '0x8006', color: undefined, string: 'c' },
            'd'     : { code : '0x8007', color: undefined, string: 'd' },
            'e'     : { code : '0x8008', color: undefined, string: 'e' },
            'f'     : { code : '0x8009', color: undefined, string: 'f' },
            'g'     : { code : '0x800A', color: undefined, string: 'g' },
            'h'     : { code : '0x800B', color: undefined, string: 'h' },
            'i'     : { code : '0x800C', color: undefined, string: 'i' },
            'back'  : { code : '0x0032', color: 'blue double', string: 'back' },
            'j'     : { code : '0x800D', color: undefined, string: 'j' },
            'k'     : { code : '0x800E', color: undefined, string: 'k' },
            'l'     : { code : '0x800F', color: undefined, string: 'l' },
            'm'     : { code : '0x8010', color: undefined, string: 'm' },
            'n'     : { code : '0x8011', color: undefined, string: 'n' },
            'o'     : { code : '0x8012', color: undefined, string: 'o' },
            'p'     : { code : '0x8013', color: undefined, string: 'p' },
            'q'     : { code : '0x8014', color: undefined, string: 'q' },
            'r'     : { code : '0x8015', color: undefined, string: 'r' },
            'up'    : { code : '0x0001', color: 'blue',    string: 'up',    div : '<div class="fa fa-caret-up"></div>', },
            'ok'    : { code : '0x002B', color: 'blue',    string: 'ok' },
            's'     : { code : '0x8016', color: undefined, string: 's' },
            't'     : { code : '0x8017', color: undefined, string: 't' },
            'u'     : { code : '0x8018', color: undefined, string: 'u' },
            'v'     : { code : '0x8019', color: undefined, string: 'v' },
            'w'     : { code : '0x801A', color: undefined, string: 'w' },
            'x'     : { code : '0x801B', color: undefined, string: 'x' },
            'y'     : { code : '0x801C', color: undefined, string: 'y' },
            'z'     : { code : '0x801D', color: undefined, string: 'z' },
            'left'  : { code : '0x0003', color: 'blue',    string: 'left',  div : '<div class="fa fa-caret-left"></div>'  },
            'down'  : { code : '0x0002', color: 'blue',    string: 'down',  div : '<div class="fa fa-caret-down"></div>' },
            'right' : { code : '0x0004', color: 'blue',    string: 'right', div : '<div class="fa fa-caret-right"></div>' }
        };

        /** JS to WPE Keymap for the onkey bindings */
        this.jsToWpeKeyMap = {
            13: { code: '0x002B', string: 'enter' },
            37: { code: '0x0003', string: 'left' },
            38: { code: '0x0001', string: 'up' },
            39: { code: '0x0004', string: 'right' },
            40: { code :'0x0002', string: 'down' },
            27: { code :'0x0009', string: 'esc' },
             8: { code :'0x0032', string: 'backspace' },
            48: { code :'0x0020', string: '0' },
            49: { code :'0x0021', string: '1' },
            50: { code :'0x0022', string: '2' },
            51: { code :'0x0023', string: '3' },
            52: { code :'0x0024', string: '4' },
            53: { code :'0x0025', string: '5' },
            54: { code :'0x0026', string: '6' },
            55: { code :'0x0027', string: '7' },
            56: { code :'0x0028', string: '8' },
            57: { code :'0x0029', string: '9' },
            33: { code :'0x0030', string: 'page up' },
            34: { code :'0x0031', string: 'page down' },
            65: { code :'0x8004', string: 'a' },
            66: { code :'0x8005', string: 'b' },
            67: { code :'0x8006', string: 'c' },
            68: { code :'0x8007', string: 'd' },
            69: { code :'0x8008', string: 'e' },
            70: { code :'0x8009', string: 'f' },
            71: { code :'0x800A', string: 'g' },
            72: { code :'0x800B', string: 'h' },
            73: { code :'0x800C', string: 'i' },
            74: { code :'0x800D', string: 'j' },
            75: { code :'0x800E', string: 'k' },
            76: { code :'0x800F', string: 'l' },
            77: { code :'0x8010', string: 'm' },
            78: { code :'0x8011', string: 'n' },
            79: { code :'0x8012', string: 'o' },
            80: { code :'0x8013', string: 'p' },
            81: { code :'0x8014', string: 'q' },
            82: { code :'0x8015', string: 'r' },
            83: { code :'0x8016', string: 's' },
            84: { code :'0x8017', string: 't' },
            85: { code :'0x8018', string: 'u' },
            86: { code :'0x8019', string: 'v' },
            87: { code :'0x801A', string: 'w' },
            88: { code :'0x801B', string: 'x' },
            89: { code :'0x801C', string: 'y' },
            90: { code :'0x801D', string: 'z' },
            46: { code :'0x802A', string: 'delete' },
            32: { code :'0x802C', string: 'space' },
            189: { code :'0x802D', string: '-' },
            187: { code :'0x802E', string: '=' },
            220: { code :'0x8031', string: '\\' },
            186: { code :'0x8033', string: ';' },
            222: { code :'0x8034', string: '`' },
            188: { code :'0x8036', string: ',' },
            190: { code :'0x8037', string: '.' },
            191: { code :'0x8038',  string: '/' }
        };

        // add the keyboard button to the menu
        this.addKeyboardButton();

        this.keyboardDiv = document.getElementById('keyboard');
        this.keyBoardInnerDiv = document.createElement('div');
        this.keyBoardInnerDiv.id = 'keyboard-inner';

        // add the keys to the div
        var keyList = Object.keys(this.keyMapping);
        for (var i=0; i<keyList.length; i++) {
            var key = this.keyMapping[ keyList[i] ];
            var keyName = keyList[i];

            var keyEl = document.createElement('div');
            keyEl.className = 'button ' + (key.color || '');

            if (key.div !== undefined)
                keyEl.innerHTML = key.div;
            else
                keyEl.innerHTML = keyName;


            keyEl.onclick = this.handleKey.bind(this, keyName);
            this.keyBoardInnerDiv.appendChild(keyEl);
        }

        // bind lister for keyboard input directly from the user
        window.addEventListener('keyup', this.handleKeyFromJs.bind(this, false));
        window.addEventListener('keydown', this.handleKeyFromJs.bind(this, true));
    }

    renderKey(keyString) {
        var statusBarEl = document.getElementById('keyPressed');
        if (statusBarEl !== null)
            statusBarEl.innerHTML = keyString;


        var remoteControlEl = document.getElementById('remoteControlKeyPressed');
        if (remoteControlEl !== null)
            remoteControlEl.innerHTML = keyString;
    }

    handleKeyFromJs(keyDown, e) {
        if (this.doNotHandleKeys === true || e.repeat) return;

        var mappedKey = this.jsToWpeKeyMap[ e.which ];
        if (mappedKey === undefined)
            return;


        this.renderKey(mappedKey.string);
        var apiCall = keyDown ? api.sendKeyPress.bind(api, mappedKey.code) : api.sendKeyRelease.bind(api, mappedKey.code);
        apiCall.call();
    }

    handleKey(key) {
        var mappedKey = this.keyMapping[ key ];
        if (mappedKey === undefined)
            return;

        this.renderKey(mappedKey.string);
        api.sendKey(mappedKey.code);
    }

    addKeyboardButton() {
        // add button to top menu
        var headerDiv = document.getElementById('header');

        // header seems to not be rendered yet, try again in a bit (this happens if the top menu didnt initialize yet)
        if (headerDiv === null) {
            setTimeout(this.addKeyboardButton.bind(this), 500);
            return;
        }

        var keyboardButtonDiv = document.createElement('div');
        keyboardButtonDiv.id = 'button-right';
        keyboardButtonDiv.className = 'fa fa-keyboard-o right';
        keyboardButtonDiv.onclick = this.showKeyboard.bind(this);
        headerDiv.appendChild(keyboardButtonDiv);
    }

    showKeyboard() {
        if (this.onScreenKeyBoardIsRendered === true) {
            this.closeKeyboard();
        } else {
            this.renderKeyboard();
        }
    }

    closeKeyboard() {
        this.keyboardDiv.innerHTML = '';
        this.onScreenKeyBoardIsRendered = false;
    }

    renderKeyboard() {
        this.keyboardDiv.appendChild(this.keyBoardInnerDiv);
        this.keyboardDiv.style.bottom = '0px';
        this.onScreenKeyBoardIsRendered = true;
    }

    close() {
        document.getElementById('main').innerHTML = '';
    }

    activatePairing(deviceName) {
        api.putPlugin(this.callsign + '/' + deviceName, 'PairingMode', null, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }
        });
    }

    render() {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Device
          </div>

          <div class="label grid__col grid__col--2-of-8">
            Key
          </div>
          <div id="remoteControlKeyPressed" class="text grid__col grid__col--6-of-8">
            -
          </div>

          <div class="label grid__col grid__col--2-of-8">
            Remotes
          </div>
          <div id="remotesList" class="text grid__col grid__col--6-of-8"></div>

          <div id="pairingDiv"></div>
          `;

        var self = this;
        api.getPluginData('RemoteControl', function (error, remotes) {
            if (remotes === undefined || remotes.devices === undefined)
                return;

            // if there is only 1 keymap device, and its useless bail out
            if (remotes.devices.length === 1 && remotes.devices[0] === 'keymap')
                return;

            var devices = remotes.devices;
            var remotesDiv = document.getElementById('remotesList');
            var pairingDiv = document.getElementById('pairingDiv');

            for (var i = 0; i < devices.length; i++) {
                var device = devices[i];

                // for some reason WPE Framework returns a keymap device? Silly embedded developers.
                if (device === 'keymap')
                    continue;

                remotesDiv.innerHTML += '' + device;

                if (i < devices.length-1)
                    remotesDiv.innerHTML += ', ';

                if (self.devicesThatSupportPairing.indexOf(device) != -1) {

                    if (pairingDiv.innerHTML === '') {
                        // add the title
                        pairingDiv.innerHTML += `<div class="title grid__col grid__col--8-of-8">
                          Pairing
                        </div>`;
                    }

                    pairingDiv.innerHTML += `<div class="label grid__col grid__col--2-of-8">${device}</div>
                        <div class="text grid__col grid__col--6-of-8">
                            <button type="button" id="${device}-PairingMode">Enable Pairing</button>
                        </div>`;

                    var pairingButton = document.getElementById(device + '-PairingMode');
                    pairingButton.onclick = self.activatePairing.bind(self, device);
                }
            }
        });
    }

}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.RemoteControl = RemoteControl;
;/** The snapshot plugin captures snapshots from the device
 */

class Snapshot extends Plugin {

    constructor(pluginData) {
        super(pluginData);
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Create
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Snapshot
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button id="snapshotButton" type="button">CREATE</button>
        </div>

        <div id="myOutput">
            <img id="snapshotOutput" />
        </div>`;

      var snapshotButton = document.getElementById('snapshotButton');
      snapshotButton.onclick = this.createSnapshot.bind(this);
    }

    createSnapshot() {
        var snapshotImage = document.getElementById('snapshotOutput');
        snapshotImage.src = '';
        snapshotImage.src = api.getSnapshotLocator();
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Snapshot = Snapshot;
;/** The switchboard plugin allows the device to switch between different processes from the Framework
 */

class SwitchBoard extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        //this.renderInMenu = false;
        this.defaultPlugin = undefined;
        this.switchablePlugins = [];

        // get switchboard configuration
        api.getPluginData(this.callsign + '/Switch', (error, resp) => {
            if (error !== null)
                return;

            this.defaultPlugin = resp.default;
            this.switchablePlugins = resp.callsigns;
        });
    }

    getDefaultSwitchBoardPlugin () {
        return this.defaultPlugin;
    }

    getSwitchablePlugins() {
        return this.switchBoardPlugins;
    }

    render() {
        this.mainDiv = document.getElementById('main');
        this.mainDiv.innerHTML = `
        <div class="title grid__col grid__col--8-of-8">
            Plugins
        </div>
        <div id="switchBoardPlugins"></div>`;

        var switchBoardPluginDiv = document.getElementById('switchBoardPlugins');

       api.getControllerPlugins( (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            var plugins = data.plugins;
            var switchIdx = 0;

            for (var i=0; i < plugins.length; i++) {
                var plugin = plugins[i];
                var callsign = plugin.callsign;

                if (this.switchablePlugins.indexOf(callsign) === -1)
                    continue;

                var labelDiv = document.createElement("div");
                labelDiv.className = "label grid__col grid__col--2-of-8";
                switchBoardPluginDiv.appendChild(labelDiv);

                var label = document.createElement("label");
                label.innerHTML = callsign;

                if (callsign === this.defaultPlugin)
                    label.innerHTML += ' (default)';

                label.setAttribute("for", callsign);
                labelDiv.appendChild(label);

                var div = document.createElement("div");
                div.className = "grid__col grid__col--6-of-8 ";
                div.id =  callsign + "MainDiv";
                switchBoardPluginDiv.appendChild(div);

                var checkboxDiv = document.createElement("div");
                checkboxDiv.className = "checkbox";
                div.appendChild(checkboxDiv);

                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = callsign;

                checkbox.setAttribute("disabled", "true");
                checkboxDiv.appendChild(checkbox);

                var checkboxLabel = document.createElement("label");
                checkboxLabel.setAttribute("for", callsign);
                checkboxDiv.appendChild(checkboxLabel);

                if (plugin.state == "activated" || plugin.state == "resumed" || plugin.state == "suspended") {
                    checkbox.checked = true;
                }

                // add switch button
                if (plugin.state !== 'resumed') {
                    var switchDiv = document.createElement('div');
                    switchDiv.id = callsign + 'switchdiv';
                    switchDiv.className = 'suspend'; // reusing suspend look & feel
                    var switchCheckBox = document.createElement("input");
                    switchCheckBox.type = "checkbox";
                    switchCheckBox.id = callsign + 'switch';

                    if (plugin.state == "activated" || plugin.state == "resumed") {
                        switchCheckBox.checked = true;
                    }

                    switchCheckBox.onclick = this.switchPlugin.bind(this, callsign);
                    switchDiv.appendChild(switchCheckBox);

                    var switchLabel = document.createElement("label");
                    switchLabel.setAttribute("for", callsign + "switch");
                    switchLabel.id = callsign + "switchlabel";
                    switchLabel.innerHTML = "switch";

                    switchDiv.appendChild(switchLabel);
                    div.appendChild(switchDiv);
                }
            }
        });
    }

    switchPlugin(plugin) {
        api.putPlugin(this.callsign + '/Switch', plugin, null, (error, response) => {
            this.render();
        });
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.SwitchBoard = SwitchBoard;
;/** The tracing plugin controls the trace values for debugging output on the stdout
 */

class TraceControl extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.selectedTraceModule    = undefined;
        this.traceModules           = undefined;
        this.uniqueTraceModules     = undefined;
    }

    render()        {
        var self = this;
        var mainDiv = document.getElementById('main');


        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Modules
        </div>

        <div class="label grid__col grid__col--2-of-8">
            <label for="modules">Modules</label>
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="tracingModules"></select>
        </div>

        <div id="tracing_div"></div>`;

        document.getElementById('tracingModules').onchange = this.getSelectedModuleAndShowCategories.bind(this);

        api.getPluginData('Tracing', function(error, response) {
            self.traceModules = response.settings ? response.settings : [];
            self.uniqueTraceModules = [];
            var traceModulesSelectElement = document.getElementById('tracingModules');
            var traceOptions = traceModulesSelectElement.getElementsByTagName('options');

            // clear out the select element
            traceModulesSelectElement.options.length = 0;

            if (self.traceModules !== undefined) {
                for (var i=0; i<self.traceModules.length; i++) {
                    // check if tracemodule is in mapping object, if not add it
                    if (self.uniqueTraceModules.indexOf(self.traceModules[i].module) === -1) {
                        self.uniqueTraceModules.push(self.traceModules[i].module);
                        var newOptionElement = document.createElement("option");
                        newOptionElement.innerHTML = self.traceModules[i].module;

                        if (self.traceModules[i].module === self.selectedTraceModule)
                            newOptionElement.selected = true;

                        traceModulesSelectElement.appendChild(newOptionElement);
                    }
                }

                if (self.selectedTraceModule === undefined)
                    self.selectedTraceModule = self.traceModules[0].module;
                self.showTraceCategories(self.selectedTraceModule);
            }
        });
    }

    getSelectedModuleAndShowCategories() {
        var selector = document.getElementById('tracingModules');
        var selectedModule = this.uniqueTraceModules[ selector.selectedIndex ];
        this.showTraceCategories(selectedModule);
    }

    showTraceCategories(module) {
        var tracingDiv = document.getElementById("tracing_div");
        tracingDiv.innerHTML = '';

        if (this.traceModules.length === 0)
            return;

        // update the state of the module we selected for the tracing menu redraw
        this.selectedTraceModule = module;

        for (var i=0; i<this.traceModules.length; i++) {
            var m = this.traceModules[i];
            if (m.module !== module)
                continue;

            var labelDiv = document.createElement("div");
            labelDiv.className = "label grid__col grid__col--2-of-8";
            tracingDiv.appendChild(labelDiv);

            var label =  document.createElement("label");
            label.innerHTML = m.category;
            label.setAttribute("for", m.category);
            labelDiv.appendChild(label);

            var div = document.createElement("div");
            div.className = "grid__col grid__col--6-of-8";
            tracingDiv.appendChild(div);

            var checkboxDiv = document.createElement("div");
            checkboxDiv.className = "checkbox";
            div.appendChild(checkboxDiv);

            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = m.category;
            checkbox.checked = (m.state !== undefined) && (m.state === "enabled");
            checkbox.onclick = this.toggleTrace.bind(this, m);
            checkboxDiv.appendChild(checkbox);

            var checkboxLabel = document.createElement("label");
            checkboxLabel.setAttribute("for", m.category);
            checkboxDiv.appendChild(checkboxLabel);
        }
    }

    toggleTrace(m) {
        api.toggleTracing(m.module, m.category, (m.state === 'enabled' ? 'off' : 'on'));
        m.state = (m.state === 'enabled' ? 'disabled' : 'enabled');
    }

}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.TraceControl = TraceControl;
;/** The WebKitBrowser plugin renders webkit information and provides control to the WPE WebKit browser
 */

class WebKitBrowser extends Plugin {

    constructor(pluginData) {
        super(pluginData);
        this.socketListenerId = api.addWebSocketListener(this.handleNotification.bind(this), this.callsign);
        this.url = '';
        this.fps = 0;
        this.isHidden = false;
        this.isSuspended = false;
        this.lastSetUrlKey = 'lastSetUrl';
        this.lastSetUrl = window.localStorage.getItem(this.lastSetUrlKey) || '';
        this.inspectorPort = '9998';

        this.template = `<div id="content_{{callsign}}" class="grid">

            <div class="title grid__col grid__col--8-of-8">Presets / URL</div>

            <div class="label grid__col grid__col--2-of-8">URL</div>
            <div id="{{callsign}}_current_url" class="text grid__col grid__col--6-of-8">-</div>

            <div class="label grid__col grid__col--2-of-8">
                <label for="{{callsign}}_url">Custom URL</label>
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="text" id="{{callsign}}_url" size="20"/>
                <button id="{{callsign}}_button" type="button">SET</button>
                <button id="{{callsign}}_reloadbutton" type="button">RELOAD</button>
            </div>

            <div class="label grid__col grid__col--2-of-8">URL presets</div>
            <div class="text grid__col grid__col--6-of-8">
                <select id="{{callsign}}_linkPresets"></select>
            </div>

            <div class="title grid__col grid__col--8-of-8">Performance</div>
            <div class="label grid__col grid__col--2-of-8">FPS</div>
            <div id="{{callsign}}_fps" class="text grid__col grid__col--6-of-8">-</div>
            <div id="{{callsign}}Memory" class="memoryInfo"></div>

            <div class="title grid__col grid__col--8-of-8">Tools</div>

            <div class="label grid__col grid__col--2-of-8">Current State</div>
                <div id="{{callsign}}StateInfo" class="text grid__col grid__col--6-of-8"></div>
                <div class="label grid__col grid__col--2-of-8"></div>
                <div class="label grid__col grid__col--6-of-8">
                    <button id="{{callsign}}SuspendButton" type="button"></button>
            </div>

            <div class="label grid__col grid__col--2-of-8">Visibility</div>
            <div id="{{callsign}}VisibilityStateInfo" class="text grid__col grid__col--6-of-8"></div>
            <div class="label grid__col grid__col--2-of-8"></div>
            <div class="text grid__col grid__col--6-of-8">
                <button type="button" id="{{callsign}}VisibilityButton">HIDE</button>
            </div>

            <div class="label grid__col grid__col--2-of-8">Web Inspector</div>
            <div class="text grid__col grid__col--6-of-8">
                <button type="button" id="{{callsign}}Inspector">INSPECT</button>
            </div>

        </div>`;

        this.presets = [
            { Name:"Select a preset",   URL:""},
            { Name:"about:blank",       URL:"about:blank"},
            { Name:"Smashcat",          URL:"http://www.smashcat.org/av/canvas_test/" },
            { Name:"HTML5",             URL:"http://beta.html5test.com/" },
            { Name:"PeaceKeeper",       URL:"http://peacekeeper.futuremark.com/run.action" },
            { Name:"ChipTune",          URL:"http://www.chiptune.com/kaleidoscope/" },
            { Name:"Poster Circle",     URL:"http://www.webkit.org/blog-files/3d-transforms/poster-circle.html" },
            { Name:"Aquarium",          URL:"http://webglsamples.org/aquarium/aquarium.html" },
            { Name:"Particles",         URL:"http://oos.moxiecode.com/js_webgl/particles_morph/" },
            { Name:"MSE 2018 (no vp9)",          URL:"http://yt-dash-mse-test.commondatastorage.googleapis.com/unit-tests/2018.html?novp9=true" },
            { Name:"EME 2018",          URL:"http://yt-dash-mse-test.commondatastorage.googleapis.com/unit-tests/2018.html?test_type=encryptedmedia-test" },
            { Name:"Progressive",       URL:"http://yt-dash-mse-test.commondatastorage.googleapis.com/unit-tests/2018.html?test_type=progressive-test" },
            { Name:"YouTube",           URL:"http://youtube.com/tv" },
            { Name:"HelloRacer",        URL:"http://helloracer.com/webgl" },
            { Name:"Leaves",            URL:"http://www.webkit.org/blog-files/leaves" },
            { Name:"Canvas Dots",       URL:"http://themaninblue.com/experiment/AnimationBenchmark/canvas/" },
            { Name:"Anisotropic",       URL:"http://whiteflashwhitehit.com/content/2011/02/anisotropic_webgl.html" },
            { Name:"Pasta",             URL:"http://alteredqualia.com/three/examples/webgl_pasta.html" },
            { Name:"CSS3",              URL:"http://css3test.com" },
            { Name:"Kraken",            URL:"http://krakenbenchmark.mozilla.org/kraken-1.1/driver.html" },
            { Name:"KeyPress Test",     URL:"http://www.asquare.net/javascript/tests/KeyCode.html" }
        ];

        // get inspector link
        if (this.configuration !== undefined && this.configuration.inspector !== undefined) {
            this.inspectorPort = this.configuration.inspector.split(':')[1];
        }
    }

    handleNotification(json) {

        //this only receives webkit events;
        var data = json.data || {};
        if (typeof data.suspended === 'boolean')
            this.isSuspended = data.suspended;

        if (typeof data.hidden === 'boolean')
            this.isHidden = data.hidden;

        if (data.url && data.loaded)
            this.url = data.url;

        //@TODO, this does not exists? Maybe exporse over socket?
        if (data.fps)
            this.fps = data.fps;

        this.update();
    }

    render()        {
        var mainDiv = document.getElementById('main');
        var webKitHtmlString = this.template.replace(/{{callsign}}/g, this.callsign);
        mainDiv.innerHTML = webKitHtmlString;

        //updateUrl
        document.getElementById(this.callsign + '_url').value = this.lastSetUrl;

        // bind the button
        var urlButton = document.getElementById(this.callsign + '_button');
        urlButton.onclick = this.getAndSetUrl.bind(this);

        var reloadbutton = document.getElementById(this.callsign + '_reloadbutton');
        reloadbutton.onclick = this.reloadUrl.bind(this);

        // bind dropdown
        var linkPresets = document.getElementById(this.callsign + '_linkPresets');
        linkPresets.onchange = this.getAndSetUrlFromPresets.bind(this);

        // add presets
        var presetsElement = document.getElementById(this.callsign + '_linkPresets');
        if (presetsElement.children.length === 0) {
            for (var j=0; j<this.presets.length; j++) {
                var option = document.createElement('option');
                option.text = this.presets[j].Name;
                option.value = this.presets[j].URL;

                presetsElement.appendChild(option);
            }
        }

        // bind webinspector
        var inspectorButton = document.getElementById(this.callsign + 'Inspector');
        inspectorButton.onclick = this.launchWebinspector.bind(this);

        window.addEventListener('keydown', this.handleKey.bind(this));

        var urlInputEl = document.getElementById(this.callsign + '_url');
        urlInputEl.onblur = function() {
            if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = false;
        };

        urlInputEl.onfocus = function() {
            if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = true;
        };

        var self = this;
        api.getPluginData(this.callsign, (err, resp) => {
            if (err) {
                console.error(err);
                return;
            }
            self.url = resp.url;
            self.fps = resp.fps;
            self.isHidden = resp.hidden;
            self.isSuspended = resp.suspended;
            self.update();
        });
    }

    close() {
        window.removeEventListener('keydown', this.handleKey.bind(this), false);
        api.removeWebSocketListener(this.socketListenerId);
        delete this.socketListenerId;
        delete this.url;
        delete this.fps;
        delete this.isHidden;
        delete this.isSuspended;
    }

    update() {
        document.getElementById(this.callsign + '_current_url').innerHTML = this.url;
        document.getElementById(this.callsign + '_fps').innerHTML = this.fps;

        var state = this.isSuspended ? 'Suspended' : 'Resumed';
        var nextState = this.isSuspended ? 'Resume' : 'Suspend';

        var stateEl = document.getElementById(this.callsign + 'StateInfo');
        stateEl.innerHTML = state;

        var suspendButton = document.getElementById(this.callsign + 'SuspendButton');
        suspendButton.innerHTML = nextState.toUpperCase();
        suspendButton.onclick = this.toggleSuspend.bind(this, nextState);

        var visibilityState = this.isHidden ? 'Hidden' : 'Visible';
        var nextVisibilityState = this.isHidden ? 'Show' : 'Hide';

        var visbilityStateEl = document.getElementById(this.callsign + 'VisibilityStateInfo');
        visbilityStateEl.innerHTML = visibilityState.toUpperCase();

        var visibilityButton = document.getElementById(this.callsign + 'VisibilityButton');
        visibilityButton.innerHTML = nextVisibilityState.toUpperCase();
        visibilityButton.onclick = this.toggleVisibility.bind(this, nextVisibilityState);

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
    }

    setUrl(url) {
        if (url !== '') {
            console.log('Setting url ' + url + ' for ' + this.callsign);
            api.setUrl(this.callsign, url);
        }


        document.getElementById(this.callsign + '_linkPresets').selectedIndex = 0;
    }

    getAndSetUrl() {
        this.lastSetUrl = document.getElementById(this.callsign + '_url').value;

        this.setUrl(this.lastSetUrl);
        window.localStorage.setItem(this.lastSetUrlKey, this.lastSetUrl);
    }

    reloadUrl() {
        api.setUrl(this.callsign, document.getElementById(this.callsign + '_current_url').innerHTML);
    }

    getAndSetUrlFromPresets() {
        var idx = document.getElementById(this.callsign + '_linkPresets').selectedIndex;
        if (idx > 0) {
            this.setUrl(this.presets[idx].URL);
        }
    }

    handleKey(e) {
        var input = document.getElementById('WebKitBrowser_url');

        if (e.which === 13 && input && input === document.activeElement) {
            this.getAndSetUrl();
        }
    }

    toggleSuspend(nextState) {
        var self = this;

        if (nextState === 'Resume') {
            api.resumePlugin(self.callsign);
        } else {
            api.suspendPlugin(self.callsign);
        }
    }

    toggleVisibility(nextState) {
        var self = this;

        if (nextState === 'Show') {
            api.showPlugin(self.callsign);
        } else {
            api.hidePlugin(self.callsign);
        }
    }

    launchWebinspector() {
        var url = "http://" + api.host + ':' + this.inspectorPort;
        var win = window.open(url, '_blank');
        win.focus();
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.WebKitBrowser = WebKitBrowser;
;/** The webshell plugin provides a shell that can be managed through the webui
 */

class WebShell extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.webShellSocket = undefined;
    }

    render()        {
        var self = this;
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div id="shellHeader">WebShell</div>
        <div id="shell">
            <pre id="webShellData" class="text"></pre>
        </div>
        <div id="hashtag">#</div><input type="text" id="webShellInput" autofocus />`;

        // start the webshell
        api.startWebShell(function (error, ws) {
            self.webShellSocket = ws;
            self.webShellSocket.onmessage = function(e){
                var fileReader = new FileReader();
                fileReader.onload = function() {
                    document.getElementById('webShellData').innerHTML = String.fromCharCode.apply(null, new Uint8Array(fileReader.result));
                };
                fileReader.readAsArrayBuffer(e.data);
            };
            self.webShellSocket.onclose = function(){
                self.webShellSocket = null;
                self.render();
            };
        });

        // disable remote key listener (if active)
        if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = true;

        // bind key listener
        window.addEventListener('keydown', this.handleKey.bind(this));
    }

    close() { 
        if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = false;        
        window.removeEventListener('keydown', this.handleKey.bind(this), false);
    }

    handleKey(e) {
        if (this.webShellSocket && e.which === 13) {
            var str = document.getElementById('webShellInput').value + ' \n';
            var buf = new ArrayBuffer(str.length*2);
            var bufView = new Uint8Array(buf);
            for (var i=0, strLen=str.length; i<strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }

            document.getElementById('webShellInput').value = '';
            this.webShellSocket.send(buf);
        }

        setTimeout(function() {
            var shell = document.getElementById("shell");
            var webShellData = document.getElementById("webShellData");

            shell.scrollTop = webShellData.scrollHeight;
        }, 50);        
    }

}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.WebShell = WebShell;
;/** The wifi plugin provides details on the available Wifi Adapters, scans for networks and allows the user to join networks through the UI
 */

class WifiControl extends Plugin {

    constructor(pluginData) {
        super(pluginData);
        this.displayName = 'WiFi';

        this.configs = [];
        this.networks = [];
        this.connecting = false;
        this.connected = undefined;
        this.scanning = false;
        this.statusMessageTimer = null;
        this.rendered = false;
        this.wlanInterface = 'wlan0'; //FIXME, this can be anything really...
        this.socketListenerId = api.addWebSocketListener(this.handleNotification.bind(this), this.callsign);
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Status
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Connected to
        </div>
        <div id="Wifi_Connected" class="text grid__col grid__col--6-of-8"></div>

        <div class="label grid__col grid__col--2-of-8">
            Scanning
        </div>
        <div id="Wifi_Scanning" class="text grid__col grid__col--6-of-8">
            False
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Wireless networks
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="Wifi_WirelessNetwork"></select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="Wifi_scanForNetworksButton">Scan for networks</button>
        </div>

        <div class="title grid__col grid__col--8-of-8">
            Configs
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Configs
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="Wifi_Configs"></select>
        </div>

        <div id="Wifi_SSID_Label" class="label grid__col grid__col--2-of-8">
            SSID
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="Wifi_SSID" type="text" name="SSID"/>
        </div>
        <div class="label grid__col grid__col--2-of-8">
            Mode
        </div>
        <div id="Wifi_Mode" class="text grid__col grid__col--6-of-8">
        </div>
        <!-- disable for now
        <div class="label grid__col grid__col--2-of-8"></div>
        <div class="label grid__col grid__col--6-of-8">
            <button id="Wifi_ToggleModeButton" type="button">Toggle</button>
        </div>
        -->
        <div class="label grid__col grid__col--2-of-8">
            Hidden
        </div>
        <div id="Wifi_Hidden" class="text grid__col grid__col--6-of-8"></div>
        <div id="Wifi_Method_Label" class="label grid__col grid__col--2-of-8">
            Method
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="Wifi_Method" type="text" name="method"/>
        </div>
        <div id="Wifi_Password_Label" class="label grid__col grid__col--2-of-8">
            Password
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <input id="Wifi_Password" type="text" name="password"/>
        </div>
        <div class="label grid__col grid__col--2-of-8 toggleButtonLabel"></div>
        <div class="text grid__col grid__col--4-of-8">
            <button type="button" id="Wifi_saveButton">Save Config</button>
            <button type="button" id="Wifi_connectButton">Connect</button>
            <button type="button" id="Wifi_disconnectButton">Disconnect</button>
        </div>

        <br>
        <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>
        `;

        // bind elements

        // ---- button ----
        this.scanButton                 = document.getElementById('Wifi_scanForNetworksButton');
        this.saveButton                 = document.getElementById('Wifi_saveButton');
        this.connectButton              = document.getElementById('Wifi_connectButton');
        this.disconnectButton           = document.getElementById('Wifi_disconnectButton');
        //this.modeButton                 = document.getElementById('Wifi_ToggleModeButton');

        //bind buttons
        this.scanButton.onclick         = this.scanForNetworks.bind(this);
        this.saveButton.onclick         = this.saveConfig.bind(this);
        this.disconnectButton.onclick   = this.disconnect.bind(this);
        this.connectButton.onclick      = this.connect.bind(this);
        //this.modeButton.onclick         = this.toggleMode.bind(this);

        // ---- Status -----
        this.connectedStatus            = document.getElementById('Wifi_Connected');
        this.scanningStatus             = document.getElementById('Wifi_Scanning');
        this.statusMessages             = document.getElementById('statusMessages');

        // ---- Networks -----
        this.networkListEl              = document.getElementById('Wifi_WirelessNetwork');
        this.networkListEl.onchange     = this.renderNetworkDetails.bind(this);

        // ---- Configs ----
        this.configListEl               = document.getElementById('Wifi_Configs');
        this.configListEl.onchange      = this.renderConfigDetails.bind(this);

        // ---- Network info ----
        this.ssidEl                     = document.getElementById('Wifi_SSID');
        this.methodEl                   = document.getElementById('Wifi_Method');
        this.passwordEl                 = document.getElementById('Wifi_Password');
        this.accesspointEl              = document.getElementById('Wifi_Mode');
        this.hiddenEl                   = document.getElementById('Wifi_Hidden');


        //make sure we do not send keys to the remote when typing
        this.passwordEl.onblur = function() {
            if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = false;
        };

        this.passwordEl.onfocus = function() {
            if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = true;
        };

        this.update();
        setTimeout(this.getNetworks.bind(this), 200);
        setTimeout(this.getConfigs.bind(this), 400);

        this.rendered = true;
    }

    /* ----------------------------- DATA ------------------------------*/
    update() {
        api.getPluginData(this.callsign, (err, resp) => {
            if (err !== null) {
                console.error(err);
                this.status(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined)
                return;

            this.connected = resp.connected;

            if (typeof resp.scanning === 'boolean')
                this.scanning = resp.scanning;

            this.renderStatus();
        });
    }

    scanForNetworks() {
        var self = this;
        api.putPlugin(this.callsign, 'Scan', null, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // get the results
            setTimeout(this.getNetworks.bind(this), 5000);
        });
    }

    getConfigs() {
        api.getPluginData(this.callsign + '/Configs', (err, resp) => {
            if (err !== null) {
                console.error(err);
                this.status(err);
                return;
            }

            if (resp === undefined || resp.configs.length === 0)
                return;


            this.configs = resp.configs;
            this.configListEl.innerHTML = '';
            for (var i=0; i<resp.configs.length; i++) {
                var newChild = this.configListEl.appendChild(document.createElement("option"));
                newChild.innerHTML = `${resp.configs[i].ssid}`;
            }

            this.renderConfigDetails();
        });
    }

    getNetworks() {
        api.getPluginData(this.callsign + '/Networks', (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined)
                return;

            this.networks = [];

            if (this.rendered === false)
                return;

            this.networkListEl.innerHTML = '';
            for (var i=0; i<resp.networks.length; i++) {
                // some networks return /x00/x00/x00/x00 and we're filtering out that at the json parse in core/wpe.js, so lets skip it
                if (resp.networks[i].ssid === '')
                    continue;

                // store the same list in this.networks
                this.networks.push(resp.networks[i]);

                var newChild = this.networkListEl.appendChild(document.createElement("option"));
                newChild.innerHTML = `${resp.networks[i].ssid} (${resp.networks[i].signal})`;
            }
        });
    }

    handleNotification(json) {
        var data = json.data || {};

        // the event connected just provides an async boolean, rerender the network status
        if (data.event && data.event === 'Connected') {
            this.status('WLAN connection established');
            this.update();
        }


        // check if we've joined succesfull, else retry DHCP request
        if (data.callsign === 'NetworkControl' && data.data && data.data.interface) {
            if (data.data.ip) {
                if (data.data.interface === wlan) {
                    this.status('Connection succesfull.');
                    this.joining = false;
                    this.update();
                }
            } else if (data.data.status === 11) {
                // Ignore wlan DHCP failure when not in joining progress
                if (data.data.interface === this.wlanInterface && this.joining === false) return;

                this.status('DHCP request failure. Retrying...');
                this.requestDHCP();
            }
        }

        if (typeof data.scanning === 'boolean') {
            this.scanning = data.scanning;
            this.renderStatus();
        }

        if (data.event === 'NetworkUpdate') {
            this.getNetworks();
        }

    }

    /* ----------------------------- RENDERING ------------------------------*/

    status(message) {
        window.clearTimeout(this.statusMessageTimer);
        this.statusMessages.innerHTML = message;

        // clear after 5s
        this.statusMessageTimer = setTimeout(this.status, 5000, '');
    }

    renderStatus () {
        if (this.rendered === false)
            return;

        this.connectedStatus.innerHTML = this.connected !== '' ? this.connected : 'Not Connected';
        this.scanningStatus.innerHTML = this.scanning === true ? 'True' : 'False';
    }

    renderNetworkDetails() {
        var idx = this.networkListEl.selectedIndex;

        if (idx < 0 || this.networks.length <= 0)
            return;

        this.ssidEl.value = this.networks[idx].ssid;
        this.methodEl.value = this.networks[idx].pairs[0].method;
    }

    renderConfigDetails() {
        var idx = this.configListEl.selectedIndex;

        if (idx < 0 || this.configs <= 0)
            return;

        this.ssidEl.value = this.configs[idx].ssid;
        this.accesspointEl.innerHTML = this.configs[idx].accesspoint === true ? 'Access Point' : 'Client';
        this.hiddenEl.innerHTML = this.configs[idx].hidden === true ? 'True' : 'False';
        this.methodEl.value = this.configs[idx].type;
        this.passwordEl.value = this.configs[idx].psk;

    }


    /* ----------------------------- BUTTONS ------------------------------*/
    toggleConnectDisconnect() {
        if (this.connected !== '')
            this.disconnect();
        else
            this.connect();
    }

    saveConfig() {
        var self = this;
        var idx = this.configListEl.selectedIndex;

        var config = {
            ssid : this.ssidEl.value,
            psk : this.passwordEl.value,
            //hidden : this.hiddenEl.value,
            //accesspoint : this.accesspointEl.value,
            type : this.methodEl.value,
        };

        api.putPlugin(this.callsign, 'Config', JSON.stringify(config), (err, resp) => {
            if (err) {
                console.error(err);
                return;
            }

            this.status(`Saved config for ${this.ssidEl.value}`);
            self.getConfigs();
        });

    }

    requestDHCP() {
        this.status('Requesting DHCP for wlan0');
        api.putPlugin('NetworkControl', `${this.wlanInterface}/Request`, null);
    }

    connect() {
        var idx = this.configListEl.selectedIndex;

        this.status(`Connecting to ${this.configs[idx].ssid}`);

        api.putPlugin(this.callsign, `Connect/${this.configs[idx].ssid}`, null, () =>{
            this.connecting = true;
            setTimeout(this.requestDHCP.bind(this), 5000);
        });
    }

    disconnect() {
        // if we're not connected ignore.
        if (this.connected === '')
            return;

        this.status(`Disconnecting from ${this.connected}`);
        api.deletePlugin(this.callsign, 'Connect/' + this.connected, null);
    }

    close() {
        this.rendered = false;
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.WifiControl = WifiControl;
