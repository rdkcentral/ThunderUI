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
/**Continue Watching Service will provide a method for applications on the STB to store a token for retrieval by XRE.*/

import Plugin from '../core/plugin.js';

class ContinueWatching extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'Continue Watching';
  }

  render() {
    var mainDiv = document.getElementById('main');
    mainDiv.innerHTML = `
        <div class="text grid__col grid__col--8-of-8">
        Set Application token
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Application name
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="app_name" type="string">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Token key
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="this.token_key0" type="string">
        </div>
        <div id="key_value_inputs">
        <div class="label grid__col grid__col--2-of-8">
        Token value
        </div>
        <div class="label grid__col grid__col--6-of-8">
        <input id="this.token_value0" type="string">
        </div>
        </div>
        <div id='buttons' class="label text grid__col grid__col--8-of-8">
        <button id="add_key_value" type="button">Add more Key-Value</button>
        <button id="set_token" type="button">Set Token</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Get Application token
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Application name
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="app_name_token" type="string">
        <button id="get_token" type="button">Get Token</button>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Token
        </div>
        <div id='token' class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Delete Application token
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Application name
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="app_name_delete" type="string">
        <button id="delete_token" type="button">Delete Token</button>
        </div>
        `;

    this.app_name = document.getElementById('app_name');
    this.key_value_inputs = document.getElementById('key_value_inputs');
    this.set_token = document.getElementById('set_token');
    this.set_token.onclick = this.doSetToken.bind(this);
    this.add_key_value = document.getElementById('add_key_value');
    this.add_key_value.onclick = this.addKeyValue.bind(this);
    this.buttons = document.getElementById('buttons');
    this.app_name_token = document.getElementById('app_name_token');
    this.get_token = document.getElementById('get_token');
    this.get_token.onclick = this.doGetToken.bind(this);
    this.token = document.getElementById('token');
    this.app_name_delete = document.getElementById('app_name_delete');
    this.delete_token = document.getElementById('delete_token');
    this.delete_token.onclick = this.doDeleteToken.bind(this);
    this.i = 0;
  }

  doSetToken() {
    var obj = {};
    for (var j = 0; j <= this.i; j++) {
      var value = document.getElementById('this.token_value' + j).value.trim();
      var key = document.getElementById('this.token_key' + j).value.trim();
      if (value != '' && key != '') {
        obj[document.getElementById('this.token_key' + j).value] = document.getElementById(
          'this.token_value' + j
        ).value;
      }
    }
    if (this.app_name.value && this.app_name.value.trim().length != 0 && JSON.stringify(obj) != '{}') {
      try {
        this.setApplicationToken(this.app_name.value, obj).then(response => {
          if (response && response.success) {
            alert('Successfully set token');
          } else {
            alert('Failed to set token');
          }
        });
      } catch (err) {
        alert('Error in getting response');
      }
    } else if (this.app_name.value == '' || this.app_name.value.trim().length == 0) {
      alert('Please provide app name');
    } else if (JSON.stringify(obj) == '{}') {
      alert('Please provide token key value pairs');
    } else {
      alert('Please provide application name and token key value pairs');
    }
  }

  doGetToken() {
    if (this.app_name_token.value && this.app_name_token.value.trim().length != 0) {
      try {
        this.getApplicationToken(this.app_name_token.value).then(response => {
          if (response && response.success) {
            this.token.innerHTML = response.application_token;
          } else {
            this.token.innerHTML = '-';
            alert('Failed to get token');
          }
        });
      } catch (err) {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide app name');
    }
  }

  doDeleteToken() {
    if (this.app_name_delete.value && this.app_name_delete.value.trim().length != 0) {
      try {
        this.deleteApplicationToken(this.app_name_delete.value).then(response => {
          if (response && response.success) {
            alert('Successfully deleted token');
          } else {
            alert('Failed to delete token');
          }
        });
      } catch (err) {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide app name');
    }
  }

  addKeyValue() {
    this.i = this.i + 1;
    if (this.i == 1) {
      this.refresh = document.createElement('button');
      this.refresh.innerHTML = 'Refresh';
      this.refresh.id = 'refresh_button';
      this.refresh.onclick = this.refreshApp.bind(this);
      this.buttons.appendChild(this.refresh);
    }
    var div_key_name = document.createElement('div_key_name');
    div_key_name.className = 'label grid__col grid__col--2-of-8';
    div_key_name.innerHTML = 'Token key';
    div_key_name.id = 'this.div_key_name' + this.i;
    this.key_value_inputs.appendChild(div_key_name);
    var div_key = document.createElement('div_key');
    div_key.className = 'label grid__col grid__col--6-of-8';
    div_key.id = 'this.div_key' + this.i;
    var token_key = document.createElement('input');
    token_key.id = 'this.token_key' + this.i;
    div_key.appendChild(token_key);
    this.key_value_inputs.appendChild(div_key);
    var div_value_name = document.createElement('div_value_name');
    div_value_name.className = 'label grid__col grid__col--2-of-8';
    div_value_name.innerHTML = 'Token value';
    div_value_name.id = 'this.div_value_name' + this.i;
    this.key_value_inputs.appendChild(div_value_name);
    var div_value = document.createElement('div_value');
    div_value.className = 'label grid__col grid__col--6-of-8';
    div_value.id = 'this.div_value' + this.i;
    var token_value = document.createElement('input');
    token_value.id = 'this.token_value' + this.i;
    div_value.appendChild(token_value);
    this.key_value_inputs.appendChild(div_value);
  }

  refreshApp() {
    this.app_name.value = '';
    document.getElementById('this.token_value0').value = '';
    document.getElementById('this.token_key0').value = '';
    document.getElementById('refresh_button').remove();
    for (var j = 1; j <= this.i; j++) {
      document.getElementById('this.token_value' + j).remove();
      document.getElementById('this.token_key' + j).remove();
      document.getElementById('this.div_value_name' + j).remove();
      document.getElementById('this.div_key_name' + j).remove();
      document.getElementById('this.div_value' + j).remove();
      document.getElementById('this.div_key' + j).remove();
    }
    this.i = 0;
  }

  setApplicationToken(applicationName, token) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setApplicationToken',
      params: { applicationName: applicationName, application_token: token },
    };

    return this.api.req(_rest, _rpc);
  }

  deleteApplicationToken() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'deleteApplicationToken',
    };

    return this.api.req(_rest, _rpc);
  }

  getApplicationToken(applicationName) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getApplicationToken',
      params: { applicationName: applicationName },
    };

    return this.api.req(_rest, _rpc);
  }
}

export default ContinueWatching;
