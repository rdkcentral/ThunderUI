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
/** The network plugin provides network related details.*/

import Plugin from '../core/plugin.js';

class Network extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'Network';
    this.value = '';
    this.namedPing = false;
    this.namedTrace = false;
  }

  render() {
    var mainDiv = document.getElementById('main');
    mainDiv.innerHTML = `
        <div class="text grid__col grid__col--2-of-8">
        Interfaces and status
        </div>
        <div id='tableLarge' class="title grid__col grid__col--8-of-8">
        <table class="text grid__col grid__col--8-of-8" id="get_interfaces"></table>
        </div>
        <div class="text grid__col grid__col--2-of-8">
        IP address
        </div>
        <div id="stb_ip" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="text grid__col grid__col--2-of-8">
        Default Interface
        </div>
        <div class="text grid__col grid__col--7-of-12">
        <select id="change_default_interface">
        </select>
        <button id="set_default_interface" type="button">Set</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Ping an endpoint
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Type
        </div>
        <div class="label grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="type_ping">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Endpoint
        </div>
        <div id='select_input' class="label grid__col grid__col--6-of-8">
        <input id="input_endpoint_ping" type="string"  placeholder="192.168.43.248">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Packets
        </div>
        <div class="label grid__col grid__col--6-of-8">
        <input type="string" id="packets_ping" placeholder="10">
        </div>
        <div class="label grid__col grid__col--8-of-8">
        <button id="set_ping_endpoint" type="button">Ping</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
            <table id="ping"></table>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Trace an endpoint
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Type
        </div>
        <div class="label grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="type_trace">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Endpoint
        </div>
        <div id='select_input_trace' class="label grid__col grid__col--6-of-8">
        <input id="input_endpoint_trace" type="string"  placeholder="192.168.43.248">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Packets
        </div>
        <div class="label grid__col grid__col--6-of-8">
        <input type="string" id="trace_packets" placeholder="10">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        <button id="set_trace_endpoint" type="button">Trace</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
            <table id="trace"></table>
        </div>
        `;

    this.current_api_version = document.getElementById('current_api_version');
    this.stb_ip = document.getElementById('stb_ip');
    this.set_api = document.getElementById('set_api');
    this.get_interfaces = document.getElementById('get_interfaces');
    this.change_default_interface = document.getElementById('change_default_interface');
    this.set_default_interface = document.getElementById('set_default_interface');
    this.set_default_interface.onclick = this.setNewDefaultInterface.bind(this);
    this.input_endpoint_ping = document.getElementById('input_endpoint_ping');
    this.input_endpoint_trace = document.getElementById('input_endpoint_trace');
    this.select_input = document.getElementById('select_input ');
    this.packets_ping = document.getElementById('packets_ping');
    this.type_ping = document.getElementById('type_ping');
    this.type_ping.onchange = this.changePingInput.bind(this);
    this.type_trace = document.getElementById('type_trace');
    this.type_trace.onchange = this.changeTraceInput.bind(this);
    this.set_ping_endpoint = document.getElementById('set_ping_endpoint');
    this.set_ping_endpoint.onclick = this.doPing.bind(this);
    this.ping_response = document.getElementById('ping');
    this.trace_endpoint = document.getElementById('trace_endpoint');
    this.trace_packets = document.getElementById('trace_packets');
    this.set_trace_endpoint = document.getElementById('set_trace_endpoint');
    this.set_trace_endpoint.onclick = this.doTrace.bind(this);
    this.trace_response = document.getElementById('trace');
    this.onConnectionStatusChanged = this.api.t.on(
      this.callsign,
      'onConnectionStatusChanged',
      this.connectionChange.bind(this)
    );
    this.onIPAddressStatusChanged = this.api.t.on(this.callsign, 'onIPAddressStatusChanged', this.ipChange.bind(this));
    this.onDefaultInterfaceChanged = this.api.t.on(
      this.callsign,
      'onDefaultInterfaceChanged',
      this.defaultInterfaceChange.bind(this)
    );
    this.onInterfaceStatusChanged = this.api.t.on(
      this.callsign,
      'onInterfaceStatusChanged',
      this.interfaceStatusChange.bind(this)
    );
    this.update();
  }

  changePingInput() {
    this.input_endpoint_ping.remove();
    if (this.type_ping.value == 'Named') {
      this.input_endpoint_ping = document.createElement('select');
      this.input_endpoint_ping.className = 'grid__col--5-of-8';
      document.getElementById('select_input').appendChild(this.input_endpoint_ping);
      this.getNamedEndpoints().then(response => {
        for (var i = 0; i < response.endpoints.length; i++) {
          var option1 = document.createElement('option');
          option1.text = response.endpoints[i].endpoint;
          option1.value = response.endpoints[i].endpoint;
          this.input_endpoint_ping.appendChild(option1);
        }
      });
      this.namedPing = true;
    } else {
      this.input_endpoint_ping = document.createElement('input');
      this.input_endpoint_ping.class = 'grid__col grid__col--5-of-8';
      this.input_endpoint_ping.placeholder = '192.168.43.248';
      document.getElementById('select_input').appendChild(this.input_endpoint_ping);
      this.namedPing = false;
    }
  }

  changeTraceInput() {
    this.input_endpoint_trace.remove();
    if (this.type_trace.value == 'Named') {
      this.input_endpoint_trace = document.createElement('select');
      this.input_endpoint_trace.className = 'grid__col--5-of-8';
      document.getElementById('select_input_trace').appendChild(this.input_endpoint_trace);
      this.getNamedEndpoints().then(response => {
        for (var i = 0; i < response.endpoints.length; i++) {
          var option1 = document.createElement('option');
          option1.text = response.endpoints[i].endpoint;
          option1.value = response.endpoints[i].endpoint;
          this.input_endpoint_trace.appendChild(option1);
        }
      });
      this.namedTrace = true;
    } else {
      this.input_endpoint_trace = document.createElement('input');
      this.input_endpoint_trace.class = 'grid__col grid__col--5-of-8';
      this.input_endpoint_trace.placeholder = '192.168.43.248';
      document.getElementById('select_input_trace').appendChild(this.input_endpoint_trace);
      this.namedTrace = false;
    }
  }

  connectionChange(event) {
    if (event.interface == 'WIFI') {
      if (event.status == 'DISCONNECTED') {
        document.getElementById('connected_WIFI').innerHTML = 'false';
      } else {
        document.getElementById('connected_WIFI').innerHTML = 'true';
      }
    } else {
      if (event.status == 'DISCONNECTED') {
        document.getElementById('connected_ETHERNET').innerHTML = 'false';
      } else {
        document.getElementById('connected_ETHERNET').innerHTML = 'true';
      }
    }
  }

  ipChange() {
    this.getStbIp().then(response => {
      this.stb_ip.innerHTML = response.ip;
    });
  }

  interfaceChange(event) {
    this.change_default_interface.innerHTML = '';
    this.defaultInterface.remove();
    this.updateDefaultInterface();
  }

  interfaceStatusChange(event) {
    document.getElementById('enable_addr' + event.interface).checked = event.enabled;
  }

  defaultInterfaceChange() {
    this.change_default_interface.innerHTML = '';
    this.defaultInterface.remove();
    this.updateDefaultInterface();
  }

  updateDefaultInterface() {
    this.getDefaultInterface().then(response => {
      this.defaultInterface = document.createElement('option');
      this.defaultInterface.text = response.interface;
      this.defaultInterface.value = response.interface;
      this.change_default_interface.appendChild(this.defaultInterface);
      this.interfacesList = this.interfaces.filter(x => response.interface.indexOf(x) === -1);
      for (var i = 0; i < this.interfacesList.length; i++) {
        var option = document.createElement('option');
        option.text = this.interfacesList[i];
        option.value = this.interfacesList[i];
        this.change_default_interface.appendChild(option);
      }
    });
  }

  setNewDefaultInterface() {
    this.selectedIndex = this.change_default_interface.selectedIndex;
    this.setDefaultInterface(this.change_default_interface[this.selectedIndex].value).then(response => {
      if (!response.success) {
        alert('Failed to set ' + this.change_default_interface[this.selectedIndex].value + ' as default interface');
      }
      this.change_default_interface.innerHTML = '';
      this.updateDefaultInterface();
    });
  }

  createPingResponse(response, responseElem) {
    this.target = document.createElement('tr');
    this.target_key = document.createElement('td');
    this.target_key.className = 'label grid__col grid__col--4-of-8';
    this.target_key.innerHTML = 'Target';
    this.target_addr = document.createElement('td');
    this.target_addr.className = 'label grid__col grid__col--4-of-8';
    this.target_addr.innerHTML = response.target;
    this.target.appendChild(this.target_key);
    this.target.appendChild(this.target_addr);
    this.packets_trans = document.createElement('tr');
    this.packets_trans_key = document.createElement('td');
    this.packets_trans_key.className = 'label grid__col grid__col--4-of-8';
    this.packets_trans_key.innerHTML = 'Packets transmitted';
    this.packets_trans_result = document.createElement('td');
    this.packets_trans_result.className = 'label grid__col grid__col--4-of-8';
    this.packets_trans_result.innerHTML = response.packetsTransmitted;
    this.packets_trans.appendChild(this.packets_trans_key);
    this.packets_trans.appendChild(this.packets_trans_result);
    this.packets_receive = document.createElement('tr');
    this.packets_receive_key = document.createElement('td');
    this.packets_receive_key.className = 'label grid__col grid__col--4-of-8';
    this.packets_receive_key.innerHTML = 'Packets Received';
    this.packets_receive_result = document.createElement('td');
    this.packets_receive_result.className = 'label grid__col grid__col--4-of-8';
    this.packets_receive_result.innerHTML = response.packetsReceived;
    this.packets_receive.appendChild(this.packets_receive_key);
    this.packets_receive.appendChild(this.packets_receive_result);
    this.packets_loss = document.createElement('tr');
    this.packets_loss_key = document.createElement('td');
    this.packets_loss_key.className = 'label grid__col grid__col--4-of-8';
    this.packets_loss_key.innerHTML = 'Packets Loss';
    this.packets_loss_result = document.createElement('td');
    this.packets_loss_result.className = 'label grid__col grid__col--4-of-8';
    this.packets_loss_result.innerHTML = response.packetLoss;
    this.packets_loss.appendChild(this.packets_loss_key);
    this.packets_loss.appendChild(this.packets_loss_result);
    this.tripMin = document.createElement('tr');
    this.tripMin_key = document.createElement('td');
    this.tripMin_key.className = 'label grid__col grid__col--4-of-8';
    this.tripMin_key.innerHTML = 'Trip Min';
    this.tripMin_result = document.createElement('td');
    this.tripMin_result.className = 'label grid__col grid__col--4-of-8';
    this.tripMin_result.innerHTML = response.tripMin;
    this.tripMin.appendChild(this.tripMin_key);
    this.tripMin.appendChild(this.tripMin_result);
    this.tripAvg = document.createElement('tr');
    this.tripAvg_key = document.createElement('td');
    this.tripAvg_key.className = 'label grid__col grid__col--4-of-8';
    this.tripAvg_key.innerHTML = 'Trip Avg';
    this.tripAvg_result = document.createElement('td');
    this.tripAvg_result.className = 'label grid__col grid__col--4-of-8';
    this.tripAvg_result.innerHTML = response.tripAvg;
    this.tripAvg.appendChild(this.tripAvg_key);
    this.tripAvg.appendChild(this.tripAvg_result);
    this.tripMax = document.createElement('tr');
    this.tripMax_key = document.createElement('td');
    this.tripMax_key.className = 'label grid__col grid__col--4-of-8';
    this.tripMax_key.innerHTML = 'Trip Max';
    this.tripMax_result = document.createElement('td');
    this.tripMax_result.className = 'label grid__col grid__col--4-of-8';
    this.tripMax_result.innerHTML = response.tripMax;
    this.tripAvg.appendChild(this.tripMax_key);
    this.tripAvg.appendChild(this.tripMax_result);
    this.tripStdDev = document.createElement('tr');
    this.tripStdDev_key = document.createElement('td');
    this.tripStdDev_key.className = 'label grid__col grid__col--4-of-8';
    this.tripStdDev_key.innerHTML = 'Trip Std Dev';
    this.tripStdDev_result = document.createElement('td');
    this.tripStdDev_result.className = 'label grid__col grid__col--4-of-8';
    this.tripStdDev_result.innerHTML = response.tripStdDev;
    this.tripStdDev.appendChild(this.tripStdDev_key);
    this.tripStdDev.appendChild(this.tripStdDev_result);
    responseElem.appendChild(this.target);
    responseElem.appendChild(this.packets_trans);
    responseElem.appendChild(this.packets_receive);
    responseElem.appendChild(this.packets_loss);
    responseElem.appendChild(this.tripMin);
    responseElem.appendChild(this.tripAvg);
    responseElem.appendChild(this.tripMax);
    responseElem.appendChild(this.tripStdDev);
  }

  createPingErrMsg(response) {
    alert(response.error);
  }

  createTraceResponse(response, responseElem) {
    for (var i = 0; i < response.results.length; i++) {
      this.traceroute = document.createElement('tr');
      this.traceroute.id = 'traceroute_' + i;
      this.traceroute.className = 'label grid__col grid__col--8-of-8';
      this.traceroute.innerHTML = response.results[i];
      responseElem.appendChild(this.traceroute);
    }
    this.traceResponse = true;
    this.traceLength = response.results.length;
  }
  createTraceErrMsg(response) {
    alert(response.error);
  }

  enableInterface(interfaceVal) {
    if (document.getElementById('enable_addr' + interfaceVal).checked) {
      this.enableVal = true;
    } else {
      this.enableVal = false;
    }
    this.setInterfaceEnabled(interfaceVal, this.enableVal).then(response => {
      this.isInterfaceEnabled(interfaceVal).then(response => {
        document.getElementById('enable_addr' + interfaceVal).checked = response.enabled;
      });
      if (!response.success) {
        if (this.enableVal) {
          this.alertMsg = 'enable';
        } else {
          this.alertMsg = 'disable';
        }
        alert('Failed to ' + this.alertMsg + ' ' + interfaceVal);
      }
    });
  }

  startLoading() {
    this.loadingEl = document.getElementById('disconnected');
    var loadingHtml = `<div id="disconnectedBlock">
                        <div class="loading">Waiting for response</div>
                        </div>`;
    this.loadingEl.style.display = 'block';
    this.loadingEl.innerHTML = loadingHtml;
  }

  stopLoading() {
    this.loadingEl.innerHTML = '';
    this.loadingEl.style.display = 'none';
  }

  doPing() {
    if (this.ping_response) {
      this.ping_response.innerHTML = '';
      this.ping_response.id = '';
    }
    if (this.namedPing) {
      this.value = this.input_endpoint_ping[this.input_endpoint_ping.selectedIndex].value;
    } else {
      this.value = this.input_endpoint_ping.value;
    }
    if (this.value == '' && this.packets_ping.value == '') {
      alert('Please provide endpoint and packet values to ping');
    } else if (this.value == '') {
      alert('Please provide endpoint value to ping');
    } else if (this.packets_ping.value == '') {
      alert('Please provide packet value to ping');
    } else {
      this.startLoading();
      if (!this.namedPing) {
        this.value = this.input_endpoint_ping.value;
        this.ping(this.value, this.packets_ping.value).then(response => {
          this.stopLoading();
          if (response.success) {
            this.ping_response.id = 'tableMedium';
            this.createPingResponse(response, this.ping_response, 'notNamed');
          } else {
            this.createPingErrMsg(response, 'notNamed');
          }
        });
      } else {
        this.pingNamedEndpoint(this.value, this.packets_ping.value).then(response => {
          this.stopLoading();
          if (response.success) {
            this.ping_response.id = 'tableMedium';
            this.createPingResponse(response, this.ping_response, 'notNamed');
          } else {
            this.createPingErrMsg(response, 'notNamed');
          }
        });
      }
    }
  }

  doTrace() {
    if (this.trace_response) {
      this.trace_response.innerHTML = '';
      this.trace_response.id = '';
    }
    if (this.namedTrace) {
      this.traceValue = this.input_endpoint_trace[this.input_endpoint_trace.selectedIndex].value;
    } else {
      this.traceValue = this.input_endpoint_trace.value;
    }
    if (this.traceValue == '' && this.trace_packets.value == '') {
      alert('Please provide endpoint and packet values to trace');
    } else if (this.traceValue == '') {
      alert('Please provide endpoint value to trace');
    } else if (this.trace_packets.value == '') {
      alert('Please provide packet value to trace endpoint');
    } else {
      this.startLoading();
      if (!this.namedTrace) {
        this.trace(this.traceValue, this.trace_packets.value).then(response => {
          this.stopLoading();
          if (response.success) {
            this.trace_response.innerHTML = '';
            this.trace_response.id = 'tableMedium';
            this.createTraceResponse(response, this.trace_response, 'notNamed');
          } else {
            this.createTraceErrMsg(response, 'notNamed');
          }
        });
      } else {
        this.traceNamedEndpoint(this.traceValue, this.trace_packets.value).then(response => {
          this.stopLoading();
          if (response.success) {
            this.trace_response.innerHTML = '';
            this.trace_response.id = 'tableMedium';
            this.createTraceResponse(response, this.trace_response, 'notNamed');
          } else {
            this.createTraceErrMsg(response, 'notNamed');
          }
        });
      }
    }
  }

  setTypes() {
    var option1 = document.createElement('option');
    option1.text = 'NotNamed';
    option1.value = 'NotNamed';
    this.type_ping.appendChild(option1);
    var option2 = document.createElement('option');
    option2.text = 'Named';
    option2.value = 'Named';
    this.type_ping.appendChild(option2);
    var option3 = document.createElement('option');
    option3.text = 'NotNamed';
    option3.value = 'NotNamed';
    this.type_trace.appendChild(option3);
    var option4 = document.createElement('option');
    option4.text = 'Named';
    option4.value = 'Named';
    this.type_trace.appendChild(option4);
  }

  setInterfaces(response) {
    this.interfaces = [];
    this.tr1 = document.createElement('tr');
    this.tr1.className = 'text grid__col grid__col--8-of-8';
    this.td1 = document.createElement('td');
    this.td1.className = 'text grid__col grid__col--2-of-8';
    this.td1div = document.createElement('div');
    this.td1div.innerHTML = 'Interface';
    this.td2 = document.createElement('td');
    this.td2div = document.createElement('div');
    this.td2.className = 'text grid__col grid__col--2-of-8';
    this.td2div.innerHTML = 'MAC Address';
    this.td3 = document.createElement('td');
    this.td3div = document.createElement('div');
    this.td3.className = 'text grid__col grid__col--2-of-8';
    this.td3div.innerHTML = 'Connection Status';
    this.td4 = document.createElement('td');
    this.td4div = document.createElement('div');
    this.td4.className = 'text grid__col grid__col--2-of-8';
    this.td4div.innerHTML = 'Enabled status';
    this.td1.appendChild(this.td1div);
    this.td2.appendChild(this.td2div);
    this.td3.appendChild(this.td3div);
    this.td4.appendChild(this.td4div);
    this.tr1.appendChild(this.td1);
    this.tr1.appendChild(this.td2);
    this.tr1.appendChild(this.td3);
    this.tr1.appendChild(this.td4);
    this.get_interfaces.appendChild(this.tr1);
    for (var i = 0; i < response.interfaces.length; i++) {
      this.interfaces.push(response.interfaces[i].interface);
      this.interface = document.createElement('tr');
      this.interface.className = 'label grid__col grid__col--8-of-8';
      this.interface_name = document.createElement('td');
      this.interface_name.className = 'label grid__col grid__col--2-of-8';
      this.interface_div = document.createElement('div');
      this.interface_div.innerHTML = response.interfaces[i].interface;
      this.mac = document.createElement('td');
      this.mac_div = document.createElement('div');
      this.mac.className = 'label grid__col grid__col--2-of-8';
      this.mac_div.innerHTML = response.interfaces[i].macAddress;
      this.connected = document.createElement('td');
      this.connected_div = document.createElement('div');
      this.connected.className = 'label grid__col grid__col--2-of-8';
      this.connected_div.id = 'connected_' + response.interfaces[i].interface;
      this.connected_div.innerHTML = response.interfaces[i].connected;
      this.enabled = document.createElement('td');
      this.enabled_div = document.createElement('div');
      this.enabled.className = 'label grid__col grid__col--2-of-8';
      this.checkboxDiv = document.createElement('div');
      this.checkboxDiv.className = 'checkbox';
      this.enabled_div.appendChild(this.checkboxDiv);
      this.checkbox = document.createElement('input');
      this.checkbox.type = 'checkbox';
      this.checkbox.id = 'enable_addr' + response.interfaces[i].interface;
      this.checkbox.checked = response.interfaces[i].enabled;
      this.checkbox.onclick = this.enableInterface.bind(this, response.interfaces[i].interface);
      this.checkboxDiv.appendChild(this.checkbox);
      this.checkboxLabel = document.createElement('label');
      this.checkboxLabel.setAttribute('for', 'enable_addr' + response.interfaces[i].interface);
      this.checkboxDiv.appendChild(this.checkboxLabel);
      this.interface_name.appendChild(this.interface_div);
      this.mac.appendChild(this.mac_div);
      this.connected.appendChild(this.connected_div);
      this.enabled.appendChild(this.enabled_div);
      this.interface.appendChild(this.interface_name);
      this.interface.appendChild(this.mac);
      this.interface.appendChild(this.connected);
      this.interface.appendChild(this.enabled);
      this.get_interfaces.appendChild(this.interface);
    }
    this.updateDefaultInterface();
  }

  getStbIp() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getStbIp',
    };

    return this.api.req(null, _rpc);
  }

  getInterfaces() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getInterfaces',
    };

    return this.api.req(null, _rpc);
  }

  getDefaultInterface() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getDefaultInterface',
    };

    return this.api.req(null, _rpc);
  }

  setDefaultInterface(interfaceVal) {
    const _rpc = {
      plugin: this.callsign,
      method: 'setDefaultInterface',
      params: { interface: interfaceVal, persist: true },
    };

    return this.api.req(null, _rpc);
  }

  isInterfaceEnabled(interfaceVal) {
    const _rpc = {
      plugin: this.callsign,
      method: 'isInterfaceEnabled',
      params: { interface: interfaceVal },
    };

    return this.api.req(null, _rpc);
  }

  setInterfaceEnabled(interfaceVal, enableVal) {
    const _rpc = {
      plugin: this.callsign,
      method: 'setInterfaceEnabled',
      params: { interface: interfaceVal, enabled: enableVal, persist: true },
    };

    return this.api.req(null, _rpc);
  }

  ping(endpoint, packets) {
    const _rpc = {
      plugin: this.callsign,
      method: 'ping',
      params: {
        endpoint: endpoint,
        packets: packets,
      },
    };

    return this.api.req(null, _rpc);
  }

  trace(endpoint, packets) {
    const _rpc = {
      plugin: this.callsign,
      method: 'trace',
      params: {
        endpoint: endpoint,
        packets: packets,
      },
    };

    return this.api.req(null, _rpc);
  }

  traceNamedEndpoint(endpoint, packets) {
    const _rpc = {
      plugin: this.callsign,
      method: 'traceNamedEndpoint',
      params: {
        endpointName: endpoint,
        packets: packets,
      },
    };

    return this.api.req(null, _rpc);
  }

  getNamedEndpoints() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getNamedEndpoints',
    };

    return this.api.req(null, _rpc);
  }

  pingNamedEndpoint(endpoint, packets) {
    const _rpc = {
      plugin: this.callsign,
      method: 'pingNamedEndpoint',
      params: { endpointName: endpoint, packets: packets },
    };

    return this.api.req(null, _rpc);
  }

  update() {
    this.getStbIp().then(response => {
      this.stb_ip.innerHTML = response.ip;
    });
    this.setTypes();
    this.getInterfaces().then(response => {
      this.setInterfaces(response);
    });
  }

  close() {
    if (this.onConnectionStatusChanged && typeof this.onConnectionStatusChanged.dispose === 'function') {
      this.onConnectionStatusChanged.dispose();
      this.onConnectionStatusChanged = null;
    }
    if (this.onIPAddressStatusChanged && typeof this.onIPAddressStatusChanged.dispose === 'function') {
      this.onIPAddressStatusChanged.dispose();
      this.onIPAddressStatusChanged = null;
    }
    if (this.onDefaultInterfaceChanged && typeof this.onDefaultInterfaceChanged.dispose === 'function') {
      this.onDefaultInterfaceChanged.dispose();
      this.onDefaultInterfaceChanged = null;
    }
    if (this.onInterfaceStatusChanged && typeof this.onInterfaceStatusChanged.dispose === 'function') {
      this.onInterfaceStatusChanged.dispose();
      this.onInterfaceStatusChanged = null;
    }
  }
}

export default Network;
