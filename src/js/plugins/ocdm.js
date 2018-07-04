/** The ocdm plugin manages different OpenCDM DRM modules
 */

class OCDM extends Plugin {

    constructor(pluginData) {
        super(pluginData);

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
        api.getPluginData(this.callsign, (err, resp) => {
            if (err) {
                console.error(err);
                return;
            }

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

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.OCDM = OCDM;
