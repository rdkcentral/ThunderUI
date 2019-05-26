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
                if (typeof body === 'string' || body instanceof String)
                    xmlHttp.send(body);
                else
                    xmlHttp.send(JSON.stringify(body))
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
                    return callback('JSON RPC Socket is not connected', null)
                }
                this.jsonRpcCallbackQueue[this.jsonRpcId] = cb;
                this.jsonRpcSocket.send(JSON.stringify(body));
            }
            this.jsonRpcId++;
        }

        // Compatibility method to deal with transitioning APIs and older version of WPEFramework
        // note: This assumes the WebSocket to jsonrpc will fail.
        req(restfullMethod, restfullPath, restfullBody, jsonMethod, jsonParams, cb) {
            if (this.jsonRpcSocket.readyState === 1 && jsonMethod !== undefined)
                this.jsonRPCRequest(jsonMethod, jsonParams, (err, resp) => {
                    // if jsonrpc returns an error, lets try restfull
                    // it might be the JSONRPC socket connected but this particular API hasnt transitioned yet
                    if (err !== undefined)
                        this.handleRequest(restfullMethod, restfullPath, restfullBody, cb)
                    else
                        cb(err, resp)
                })
            else if (this.jsonRpcSocket.readyState !== 1 && restfullPath !== undefined)
                this.handleRequest(restfullMethod, restfullPath, restfullBody, cb)
            else
                cb('No path available to make request', null)
        }

        activatePlugin(plugin, callback) {
            this.req('PUT', this.getURLStart('http') + 'Controller/Activate/' + plugin, null,
                'Controller.1.activate', {callsign: plugin},
                callback)
        };

        deactivatePlugin(plugin, callback) {
            this.req('PUT', this.getURLStart('http') + 'Controller/Deactivate/' + plugin, null,
                'Controller.1.deactivate', {callsign: plugin},
                callback);
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
            this.req('GET', this.getURLStart('http') + 'Controller/Plugins', null,
                'Controller.1.status', {}, (err ,res) => {
                    if (!res.plugins)
                        //reformat the data to be aligned with deprecated REST call
                        callback(err, {plugins: res});
                    else
                        callback(err, res);
            });
        };

        getDeviceInfo(callback) {
            this.req('GET', this.getURLStart('http') + 'DeviceInfo/', null,
                'DeviceInfo.1.system', {}, (err, res) => {
                    // compatibility checkx
                    if (res.deviceInfo !== undefined)
                        callback(err, res.deviceInfo)
                    else
                        callback(err, res)
                })
        }

        getMemoryInfo(plugin, callback) {
            this.req('GET', this.getURLStart('http') + 'Monitor/' + plugin, null,
                'Monitor.1.status', {callsign: plugin}, callback);
        };

        initiateDiscovery(callback) {
            this.req('PUT', this.getURLStart('http') + 'Controller/Discovery', null,
                'Controller.1.startdiscovery', {ttl: 1}, callback);
        };

        getDiscovery(callback) {
            this.req('GET', this.getURLStart('http') + 'Controller/Discovery', null,
                'Controller.1.discover', {ttl: 1}, callback);
        };

        persist(callback) {
            this.req('PUT', this.getURLStart('http') + "Controller/Persist", null,
                'Controller.1.storeconfig', {}, callback);
        };

        reboot(callback) {
            this.req('PUT', this.getURLStart('http') + "Controller/Harakiri", null,
                'Controller.1.harakiri', {}, callback);
        };

        sendKey(key, callback) {
            var body = {
                "device": "Web",
                "code": key,
            };
            this.req('PUT', this.getURLStart('http') + 'RemoteControl/Web/Send', body,
                'RemoteControl.1.send', body, callback);
        };

        sendKeyPress(key, callback) {
            var body = {
                "device": "Web",
                "code": key,
            };
            this.req('PUT', this.getURLStart('http') + 'RemoteControl/Web/Press', body,
                'RemoteControl.1.press', body, callback);
        };

        sendKeyRelease(key, callback) {
            var body = {
                "device": "Web",
                "code": key,
            };
            this.req('PUT', this.getURLStart('http') + 'RemoteControl/Web/Release', body,
                'RemoteControl.1.release', body, callback);
        };

        toggleTracing(module, id, state, callback) {
            var body = {
                "module": module,
                "category": id,
                "state": state === 'on' ? 'enabled' : 'disabled'
            };
            this.req('PUT', this.getURLStart('http') + 'TraceControl' +  '/' + module + '/' + id + '/' + state, null,
                'TraceControl.1.set', body, callback);
        };

        setUrl(plugin, url, callback) {
            var body = {"url":  url };
            this.req('POST', this.getURLStart('http') + plugin + '/URL', body,
                plugin + '.1.seturl', body, callback);
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
                        self.jsonRpcCallbackQueue[data.id](data.error, data.result);
                        delete self.jsonRpcCallbackQueue[data.id];
                    }

                } catch (e) {
                    return console.error('jsonRpcSocket socket error', e);
                }
            };

            this.jsonRpcSocket.onconnect = function(e) {
                this.jsonRpcConnected = true;
            };

            this.jsonRpcSocket.onclose = function(e) {
                this.jsonRpcConnected = false;
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
