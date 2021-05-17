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
/** Screen capture plugin takes screenshot and uploads it to the specified url */

import Plugin from '../core/plugin.js';

class ScreenCapture extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);

    this.renderInMenu = true;
    this.displayName = 'ScreenCapture';
    this.mainDiv = document.getElementById('main');

    this.template = `
    <div class="title grid__col grid__col--8-of-8">Screen Capture</div>
    <div class="text grid__col grid__col--8-of-8">Take screenshot and upload</div>
    <div class="label grid__col grid__col--2-of-8">Upload URL</div>
    <div class="text grid__col grid__col--6-of-8">
      <input id="url" required />
    </div>
    <div class="label grid__col grid__col--2-of-8">Screenshot Identifier(optional)</div>
    <div class="text grid__col grid__col--6-of-8">
      <input id="callGUID" required />
    </div>
    <div class="text grid__col grid__col--8-of-8">
      <button type="button" id="upload">Upload</button>
    </div>
    `;
  }

  uploadScreenshot(url, callGUID) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'uploadScreenCapture',
      params: { url: url, callGUID: callGUID },
    };

    return this.api.req(_rest, _rpc);
  }

  render() {
    this.mainDiv.innerHTML = this.template;
    this.url = document.getElementById('url');
    this.callGUID = document.getElementById('callGUID');
    this.uploadButton = document.getElementById('upload');
    this.uploadButton.onclick = this.upload.bind(this);
    this.onUploadComplete = this.api.t.on(this.callsign, 'uploadComplete', notification => {
      if (!notification.status) {
        alert('Upload failed!\n' + notification.message + '\nScreenshot identifier:' + notification.call_guid);
      } else {
        alert('Upload completed');
      }
    });
  }

  upload() {
    console.log('uploading');
    var uploadUrl = this.url.value;
    var callGUID = this.callGUID.value;
    console.log(uploadUrl);
    console.log(callGUID);
    this.uploadScreenshot(uploadUrl, callGUID).then(result => {
      if (!result) {
        alert("Screen caputer not successful");
      } else if (!result.success) {
        alert(result.message);
      }
    });
  }

  close() {
    this.rendered = false;
    if (this.onUploadComplete && typeof this.onUploadComplete.dispose === 'function') {
      this.onUploadComplete.dispose();
      this.onUploadComplete = null;
    }
  }
}

export default ScreenCapture;
