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
/** The persistent store plugins allows to store key value pairs by namespace. */

import Plugin from '../core/plugin.js';

class PersistentStore extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.renderInMenu = true;
    this.displayName = 'Persistent Store';
  }

  render() {
    var mainDiv = document.getElementById('main');
    mainDiv.innerHTML = `
      <div>
        <div class="title grid__col grid__col--8-of-8">Persistent Store</div>
        <div class="text grid__col grid__col--8-of-8">Set Value</div>
        <div class="label grid__col grid__col--2-of-8">Name space</div>
        <div class="text grid__col grid__col--6-of-8">
          <input type="string" id="namespace" title="Name space should only contain letters,numbers,underscore and hyphen" />
        </div>
        <div class="label grid__col grid__col--2-of-8">Key</div>
        <div class="text grid__col grid__col--6-of-8">
          <input type="string" id="set_key" title="Key should only contain letters,numbers,underscore and hyphen"/>
        </div>
        <div class="label grid__col grid__col--2-of-8">Value</div>
        <div class="text grid__col grid__col--6-of-8">
          <input type="string" id="value" title="Value should only contain letters,numbers,underscore and hyphen"/>
        </div>
        <div class="text grid__col grid__col--6-of-8">
          <button id="set_value" type="button">SET</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">Namespaces</div>
        <div class="label grid__col grid__col--2-of-8">Available namespaces</div>
        <div class="grid__col grid__col--6-of-8" >
        <select id="avail_namespaces" class="grid__col grid__col--5-of-8"></select>
        </div>
        <div class="text grid__col grid__col--2-of-8" >
        <button id="get_details" type="button">GET Details</button>
        <button id="del_namespace" type="button">Delete</button>
        </div>
        <div class="grid__col grid__col--2-of-8">
        </div>
        </div>
        <div  id ="details">
        </div>
        <div>
        <table id="status_application">
        </table>
      <div>
      `;

    this.namespace = document.getElementById('namespace');
    this.del_button = document.getElementById('del_namespace');
    this.detail_button = document.getElementById('get_details');
    this.key = document.getElementById('set_key');
    this.value = document.getElementById('value');
    this.set_value = document.getElementById('set_value');
    this.details = document.getElementById('details');
    this.avail_namespaces = document.getElementById('avail_namespaces');
    this.set_value.onclick = this.setValue.bind(this);
    this.status_application = document.getElementById('status_application');
    this.del_button.onclick = this.delete.bind(this);
    this.detail_button.onclick = this.getDetails.bind(this);
    this.update();
  }

  update() {
    this.getNameSpaces().then(response => {
      this.avail_namespaces.innerHTML = '';
      if (response) {
        response.namespaces.map(name => {
          let option = document.createElement('option');
          option.text = name;
          option.value = name;
          this.avail_namespaces.appendChild(option);
        });
      }
    });
  }

  setPersistValue(namespace, key, value) {
    const _rpc = {
      plugin: this.callsign,
      method: 'setValue',
      params: { namespace: namespace, key: key, value: value },
    };

    return this.api.req(null, _rpc);
  }

  getNameSpaces() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getNamespaces',
    };

    return this.api.req(null, _rpc);
  }

  getStorageSize() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getStorageSize',
    };

    return this.api.req(null, _rpc);
  }

  getKeys(namespace) {
    const _rpc = {
      plugin: this.callsign,
      method: 'getKeys',
      params: { namespace: namespace },
    };

    return this.api.req(null, _rpc);
  }

  deleteNameSpaces(namespace) {
    const _rpc = {
      plugin: this.callsign,
      method: 'deleteNamespace',
      params: { namespace: namespace },
    };

    return this.api.req(null, _rpc);
  }

  getKeyValue(namespace, key) {
    const _rpc = {
      plugin: this.callsign,
      method: 'getValue',
      params: { namespace: namespace, key: key },
    };

    return this.api.req(null, _rpc);
  }

  delete() {
    this.deleteNameSpaces(this.avail_namespaces.value).then(response => {
      if (response.success) {
        this.update();
        this.getDetails();
        alert('Namespace deleted successfully');
      } else {
        alert('Delete failed');
      }
    });
  }

  deleteKey(namespace) {
    const _rpc = {
      plugin: this.callsign,
      method: 'deleteKey',
      params: { namespace: namespace, key: this.availKeys.value },
    };

    return this.api.req(null, _rpc).then(result => {
      if (result.success) {
        this.getDetails();
      } else {
        alert('Delete failed:' + result.error);
      }
    });
  }

  setValue() {
    this.setPersistValue(this.namespace.value, this.key.value, this.value.value).then(response => {
      if (response.success) {
        this.update();
        this.getDetails();
        alert('Key/Value pair stored successfullty stored in the store');
      } else {
        alert('Failed to store the key/value pair');
      }
    });
  }

  getDetails() {
    let selected_namespace = this.avail_namespaces.value;
    this.details.innerHTML = '';
    this.getKeys(selected_namespace).then(response => {
      if (response.success) {
        let keyValuePair = {};
        if (response.keys.length > 0) {
          this.details.innerHTML = `
          <div class="label grid__col grid__col--2-of-8">Storage Size</div>
          <div class="text grid__col grid__col--6-of-8" id ="name_size"></div>
          <div class="label grid__col grid__col--2-of-8">
          Delete Key
          </div>
          <div class="grid__col grid__col--6-of-8" >
          <select id="avail_keys" class="grid__col grid__col--5-of-8"></select>
          </div>
          <div class="text grid__col grid__col--2-of-8" >
          <button id="del_key" type="button">Delete Key</button>
          </div>`;
          let nameSize = document.getElementById('name_size');
          this.status_application.innerHTML = '';
          let tr1 = document.createElement('tr');
          tr1.id = 'trLarge';
          tr1.className = 'text grid__col grid__col--8-of-8';
          let td1 = document.createElement('th');
          td1.id = 'td';
          td1.className = 'text grid__col grid__col--2-of-8';
          let td1div = document.createElement('div');
          td1div.innerHTML = 'Key';
          let td2 = document.createElement('th');
          td2.id = 'td';
          let td2div = document.createElement('div');
          td2.className = 'text grid__col grid__col--2-of-8';
          td2div.innerHTML = 'Value';
          td1.appendChild(td1div);
          td2.appendChild(td2div);
          tr1.appendChild(td1);
          tr1.appendChild(td2);
          this.status_application.appendChild(tr1);
          this.availKeys = document.getElementById('avail_keys');
          this.deleteKeyButton = document.getElementById('del_key');
          this.deleteKeyButton.onclick = this.deleteKey.bind(this, selected_namespace);

          this.getStorageSize().then(result => {
            if (result.success) {
              nameSize.innerHTML = result.namespaceSizes[selected_namespace];
            }
          });

          response.keys.map(key => {
            this.getKeyValue(selected_namespace, key).then(result => {
              keyValuePair[key] = result.value;
              let status = document.createElement('tr');
              status.id = 'trLarge';
              status.className = 'label grid__col grid__col--8-of-8';
              let key_name = document.createElement('td');
              key_name.id = 'td';
              key_name.className = 'label grid__col grid__col--2-of-8';
              let key_div = document.createElement('div');
              key_div.innerHTML = key;
              let key_value = document.createElement('td');
              key_value.id = 'td';
              key_value.className = 'label grid__col grid__col--2-of-8';
              let value_div = document.createElement('div');
              value_div.innerHTML = result.value;
              key_name.appendChild(key_div);
              key_value.appendChild(value_div);
              status.appendChild(key_name);
              status.appendChild(key_value);
              this.status_application.appendChild(status);
              this.keyName = document.createElement('option');
              this.keyName.text = key;
              this.keyName.value = key;
              this.availKeys.appendChild(this.keyName);
            });
          });
        } else {
          this.status_application.className = 'grid__col grid__col--8-of-8';
          this.status_application.innerHTML = `
          <tr id='tr' >
          <th id='td' class = 'label'>Key</th>
          <th id='td' class = 'label'>Value</th>
          </tr>
          <tr >
          <td id='td' colspan ="2" class='text'>No data available</td>
          <td></td>
          </tr>
          `;
        }
      }
    });
  }
}

export default PersistentStore;
