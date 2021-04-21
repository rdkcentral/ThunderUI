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
/** The snapshot plugin captures snapshots from the device
 */

import Plugin from '../core/plugin.js';

class Snapshot extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
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

    getSnapshotLocator() {
        return this.api.getURLStart('http') + 'Snapshot/Capture?' + new Date().getTime();
    }

    createSnapshot() {
        var snapshotImage = document.getElementById('snapshotOutput');
        snapshotImage.src = '';
        snapshotImage.src = this.getSnapshotLocator();
    }
}

export default Snapshot;
