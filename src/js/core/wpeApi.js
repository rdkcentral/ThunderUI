/*
 * Thunder UI API layer
 */

import ThunderJS from 'ThunderJS'

export default class WpeApi {
    constructor(host) {
        this.prefixForService = 'Service';
        this.mainDiv = document.getElementById('main');

        this.socket = null;

        this.host = host.split(':')
        this.t = ThunderJS({ 'host' : this.host[0], 'port': this.host[1] });

        this.socketListeners = {};

        // might use this later if the requests are getting to slow with the jsonrpc -> rest fallback.
        this.servicesAvailableInJsonRPC = [
            'DeviceInfo',
            'DHCPServer',
            'DIALServer',
            'LocationSync',
            'Messenger',
            'Monitor',
            'NetworkControl',
            'OCDM',
            'RemoteControl',
            'Spark',
            'Streamer',
            'SystemCommands',
            'TestController',
            'TestUtility',
            'TimeSync',
            'TraceControl',
            'WebKitBrowser',
            'WifiControl'
        ];
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
        var url = protocol + "://" + this.host[0] + ':' + this.host[1] + '/' + this.prefixForService + '/';
        return url;
    };

    // Compatibility method to deal with transitioning APIs and older version of WPEFramework
    // note: This assumes the WebSocket to jsonrpc will fail.
    req(rest, jsonrpc) {
        return new Promise( (resolve, reject) => {
            if (jsonrpc) {
                console.debug(`<JSON> ${jsonrpc.plugin }.1.${jsonrpc.method}`, jsonrpc.params ? jsonrpc.params : '');
                this.t.call(jsonrpc.plugin, jsonrpc.method, jsonrpc.params)
                .then( result => {
                    resolve(result);
                }).catch( error => {
                    if (rest) {
                        console.debug(`<JSON> ${jsonrpc.plugin }.1.${jsonrpc.method} failed, trying <REST> ${rest.method} ${rest.path}`);
                        console.debug('<JSON> Error: ', error);
                        this.handleRequest(rest.method, this.getURLStart('http') + rest.path, rest.body, (err, resp) => {
                            if (err)
                                reject(err);
                            else
                                resolve(resp);
                        });
                    } else {
                        console.error('JSONRPC Error, with no fallback: ', error);
                        reject(error)
                    }
                })
            } else {
                if (rest === undefined)
                   return reject('No rest or jsonrpc options provided, bailing out');

                this.handleRequest(rest.method, this.getURLStart('http') + rest.path, rest.body, (err, resp) => {
                    if (err)
                        reject(err);
                    else
                        resolve(resp);
                });
            }
        })
    }

    // The only call we do directly, others are through the individual plugins
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
}
