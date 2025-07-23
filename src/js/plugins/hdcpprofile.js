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
/** HDCP profile plugin provides interface for HDCP related data and events */

import Plugin from '../core/plugin.js';

class HdcpProfile extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);

    this.renderInMenu = true;
    this.displayName = 'HDCP Profile';
    this.mainDiv = document.getElementById('main');

    this.template = `
		<div class="title grid__col grid__col--8-of-8">
			HDCP Status
		</div>
		<div class="label grid__col grid__col--2-of-8">
			HDCP Supported
		</div>
		<div id="hdcp_support" class="text grid__col grid__col--6-of-8">
			-
		</div>
		<div class="label grid__col grid__col--2-of-8">
			Display connected
		</div>
		<div id="hdcp_connect" class="text grid__col grid__col--6-of-8">
			-
		</div>
		<div class="label grid__col grid__col--2-of-8">
			HDCP Compliant display
		</div>
		<div id="hdcp_compliant" class="text grid__col grid__col--6-of-8">
			-
		</div>
		<div class="label grid__col grid__col--2-of-8">
			HDCP Enabled content
		</div>
		<div id="hdcp_enabled" class="text grid__col grid__col--6-of-8">
			-
		</div>
		<div class="label grid__col grid__col--2-of-8">
			Supported HDCP Version
		</div>
		<div id="hdcp_version" class="text grid__col grid__col--6-of-8">
			-
		</div>
		<div class="label grid__col grid__col--2-of-8">
			Receiver HDCP Version
		</div>
		<div id="receiver_version" class="text grid__col grid__col--6-of-8">
			-
		</div>
		<div class="label grid__col grid__col--2-of-8">
			Current HDCP Version
		</div>
		<div id="current_version" class="text grid__col grid__col--6-of-8">
			-
		</div>
     	`;
  }

  render() {
    this.mainDiv.innerHTML = this.template;
    this.hdcpSupport = document.getElementById('hdcp_support');
    this.hdcpConnect = document.getElementById('hdcp_connect');
    this.hdcpCompliant = document.getElementById('hdcp_compliant');
    this.hdcpEnabled = document.getElementById('hdcp_enabled');
    this.hdcpVersion = document.getElementById('hdcp_version');
    this.receiverVersion = document.getElementById('receiver_version');
    this.currentVersion = document.getElementById('current_version');
    this.getStbSupport().then(res => {
      this.hdcpSupport.innerHTML = res.isHDCPSupported;
    });
    this.update();
    this.onDisplayChange = this.api.t.on(this.callsign, 'onDisplayConnectionChanged', notification => {
      this.updateData(notification.HDCPStatus);
    });
  }

  update() {
    this.getHdcpStatus().then(result => {
      this.updateData(result.HDCPStatus);
    });
  }

  updateData(status) {
    this.hdcpConnect.innerHTML = status.isConnected;
    this.hdcpCompliant.innerHTML = status.isHDCPCompliant;
    this.hdcpEnabled.innerHTML = status.isHDCPEnabled;
    this.hdcpVersion.innerHTML = status.supportedHDCPVersion;
    this.receiverVersion.innerHTML = status.receiverHDCPVersion;
    this.currentVersion.innerHTML = status.currentHDCPVersion;
  }

  getStbSupport() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getSettopHDCPSupport',
    };

    return this.api.req(null, _rpc);
  }

  getHdcpStatus() {
    const _rpc = {
      plugin: this.callsign,
      method: 'getHDCPStatus',
    };

    return this.api.req(null, _rpc);
  }
}

export default HdcpProfile;
