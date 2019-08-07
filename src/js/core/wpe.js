/*
 * Thunder UI API layer
 */

class WpeApi {
    constructor(host) {
        this.host = host;
        this.prefixForService = 'Service';
        this.mainDiv = document.getElementById('main');

        this.socket = null;
        this.t = ThunderJS({ 'host' : host });

        this.requestBlacklist = [];
    };

    handleRequest(method, URL, body, callback) {
        var self = this;

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

    // Compatibility method to deal with transitioning APIs and older version of WPEFramework
    // note: This assumes the WebSocket to jsonrpc will fail.
    req(rest, jsonrpc) {
        return new Promise( (resolve, reject) => {
            if (jsonrpc) {
                this.t.call(jsonrpc.plugin, jsonrpc.method, jsonrpc.params)
                .then( result => {
                    resolve(result);
                }).catch( error => {
                    console.error('JSONRPC Error: ', error)

                    if (rest) {
                        console.log('Trying RESTfull path')
                        this.handleRequest(this.getURLStart('http') + rest.method, rest.path, rest.body, (err, resp) => {
                            if (err)
                                reject(err);
                            else
                                resolve(resp);
                        });
                    } else {
                        reject(error)
                    }
                })
            } else {
                if (rest === undefined)
                   return reject('No rest or jsonrpc options provided, bailing out');

                this.handleRequest(this.getURLStart('http') + rest.method, rest.path, rest.body, (err, resp) => {
                    if (err)
                        reject(err);
                    else
                        resolve(resp);
                });
            }
        })
    }

    getControllerPlugins() {
        const _rest = {
            method  : 'GET',
            path    : 'Controller/Plugins'
        };

        const _rpc = {
            plugin : 'Controller',
            method : 'status'
        };

        return this.req(_rest, _rpc);
    }

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
