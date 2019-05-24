/*
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
            this.jsonRpcSocket = null;
            this.socketListeners = [];
            this.jsonRpcCallbackQueue = {};
            this.jsonRpcId = 1;
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

        getJSONRPCUrl() {
            return `http://${this.host}/jsonrpc`;
        }

        jsonRPCRequest(method, params, cb){
            var body = {
                "jsonrpc": "2.0",
                "id": this.jsonRpcId,
                "method": method,
                "params": params
            };

            if (this.jsonRpcSocket) {
                if (this.jsonRpcSocket.readyState === 0) {
                    console.log('retry json rpc message')
                    return setTimeout(this.jsonRPCRequest.bind(this,method,params,cb), 50);
                }
                this.jsonRpcCallbackQueue[this.jsonRpcId] = cb;
                this.jsonRpcSocket.send(JSON.stringify(body));
            }
            this.jsonRpcId++;
        }

        activatePlugin(plugin, callback) {
            this.jsonRPCRequest('Controller.1.activate', {callsign: plugin}, callback);
        };

        deactivatePlugin(plugin, callback) {
            this.jsonRPCRequest('Controller.1.deactivate', {callsign: plugin}, callback);
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
            this.jsonRPCRequest('Controller.1.status', {}, (err,res)=>{
                //reformat the data to be aligned with depracated REST call
                callback(err, {plugins: res});
            });
        };

        getMemoryInfo(plugin, callback) {
            this.jsonRPCRequest('Monitor.1.status', {callsign: plugin}, callback);
        };

        initiateDiscovery(callback) {
            this.jsonRPCRequest('Controller.1.startdiscovery', {ttl: 1}, callback);
        };

        getDiscovery(callback) {
            this.jsonRPCRequest('Controller.1.discover', {ttl: 1}, callback);
        };

        persist(callback) {
            this.jsonRPCRequest('Controller.1.storeconfig', {}, callback);
        };

        reboot(callback) {
            this.jsonRPCRequest('Controller.1.harakiri', {}, callback);
        };

        sendKey(key, callback) {
            var body = {
                "device": "Web",
                "code": key,
            };
            this.jsonRPCRequest('RemoteControl.1.send', body, callback);
        };

        sendKeyPress(key, callback) {
            var body = {
                "device": "Web",
                "code": key,
            };
            this.jsonRPCRequest('RemoteControl.1.press', body, callback);
        };

        sendKeyRelease(key, callback) {
            var body = {
                "device": "Web",
                "code": key,
            };
            this.jsonRPCRequest('RemoteControl.1.release', body, callback);
        };

        toggleTracing(module, id, state, callback) {
            var body = {
                "module": module,
                "category": id,
                "state": state === 'on' ? 'enabled' : 'disabled'
            };
            this.jsonRPCRequest('TraceControl.1.set', body, callback);
        };

        setUrl(plugin, url, callback) {
            var body = {"url":  url };
            this.jsonRPCRequest(plugin + '.1.seturl', body, callback);
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

                    if (data.callsign === undefined)
                        return

                    for (var i=0; i<self.socketListeners.length; i++)
                        if (data.callsign === self.socketListeners[i].callsign || self.socketListeners[i].callsign === 'all')
                            self.socketListeners[i].fn(data);

                } catch (e) {
                    return console.error('SocketNotificationError', e);
                }
            };

            this.socket.onclose = function(e) {
                setTimeout(self.startWebSocket.bind(self), conf.refresh_interval);
            };

            this.socket.onerror = function(err) {
                this.socket.close();
            };
        };

        startJSONRPCSocket() {
            if (this.jsonRpcSocket) this.jsonRpcSocket.close();
            this.jsonRpcSocket = new WebSocket( `ws://${this.host}/jsonrpc`, 'notification');
            var self = this;
            this.jsonRpcSocket.onmessage = function(e){
                var data = {};
                try {
                    data = JSON.parse(e.data);

                    var id = data && data.id || null;
                    if (self.jsonRpcCallbackQueue[id]){
                        self.jsonRpcCallbackQueue[data.id](null, data.result);
                        delete self.jsonRpcCallbackQueue[data.id];
                    }

                } catch (e) {
                    return console.error('jsonRpcSocket socket error', e);
                }
            };

            this.jsonRpcSocket.onclose = function(e) {
                setTimeout(self.startJSONRPCSocket.bind(self), conf.refresh_interval);
            };

            this.jsonRpcSocket.onerror = function(err) {
                this.socket.close();
            };
        }

        addWebSocketListener(callsign, callback) {
            var obj = {
                fn: callback,
                callsign: callsign
            };
            if (typeof callback === 'function' && this.socketListeners.indexOf(obj) === -1)
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
