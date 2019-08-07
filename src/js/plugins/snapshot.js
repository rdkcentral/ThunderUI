/** The snapshot plugin captures snapshots from the device
 */

import Plugin from '../core/Plugin.js'

class Snapshot extends Plugin {

    constructor(pluginData) {
        super(pluginData);
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

    createSnapshot() {
        var snapshotImage = document.getElementById('snapshotOutput');
        snapshotImage.src = '';
        snapshotImage.src = api.getSnapshotLocator();
    }
}

function name() {
    return  'Snapshot';
}

export { name }
export default Snapshot;
