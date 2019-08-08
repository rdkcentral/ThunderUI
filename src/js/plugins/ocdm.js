/** The ocdm plugin manages different OpenCDM DRM modules
 */

import Plugin from '../core/Plugin.js';

class OCDM extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);

        this.ocdmTemplate = `<div class="label grid__col grid__col--2-of-8">
            {{Name}}
        </div>
        <div class="text grid__col grid__col--6-of-8">
            {{Designators}}
        </div>`;
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            OpenCDM Systems
        </div>
        <div id="systemDiv"></div>`;

        this.systemDiv = document.getElementById('systemDiv');
        this.update();
    }

    update() {
        this.status().then( resp => {
            if (resp === undefined || resp === null || resp.systems === undefined)
                return;


            for (var i=0; i<resp.systems.length; i++) {
                var system = resp.systems[i];

                var systemElement = this.ocdmTemplate.replace('{{Name}}', system.name);
                systemElement = systemElement.replace('{{Designators}}', system.designators.toString());
                this.systemDiv.innerHTML += systemElement;
            }
        });
    }
}

function name() {
    return  'OCDM';
}

export { name };
export default OCDM;
