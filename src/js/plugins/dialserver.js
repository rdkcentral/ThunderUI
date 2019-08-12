/** The DIAL Server receives dial requests from the Thunder DIAL Server
 */

import Plugin from '../core/Plugin.js';

class DIALServer extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.api.t.on('DIALServer', 'start', (message) => {
            this.dialMessage('start', message);
        });

        this.api.t.on('DIALServer', 'stop', (message) => {
            this.dialMessage('stop', message);
        });
    }

    render()        {
        let mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Received DIAL requests:
        </div>

        <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>`;


        this.statusMessagesEl = document.getElementById('statusMessages');
    }

    dialMessage(action, m) {
        let div = document.createElement('div');
        if (action === 'stop')
            div.className = 'red';

        let span = document.createElement('span');
        span.innerHTML = `${action} :: ${m.application} - ${m.parameters}`;
        div.appendChild(span);

        this.statusMessagesEl.appendChild(div);
    }
}

function name() {
    return  'DIALServer';
}

export { name };
export default DIALServer;
