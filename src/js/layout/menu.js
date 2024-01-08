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
/** The side navigation menu provides navigation across the different plugins */
import { showPlugin } from '../core/application.js';

class Menu {
    constructor(plugins, api) {
        this.api            = api;
        this.plugins        = plugins;
        this.top            = document.getElementById('top');
        this.renderInMenu   = false;

        var bodyEl = document.getElementsByTagName('body')[0];

        try {
            document.createEvent('TouchEvent');
            this.nav.style.left = '-600px';
            bodyEl.classList.remove('desktop');
            bodyEl.className = 'touch';
            this.isTouchDevice = true;
        } catch(e) {}

        // add the top header + logo + keyboard hooks
        this.top.innerHTML = `<div id="header" class="header">
          <div id="button-left" class="fa fa-bars left"></div>
        </div>

        <!--navigation-->
        <div id="menu" class="navigation"></div>
        `;

        this.header = document.getElementById('header');
        this.nav = document.getElementById('menu');

        // for some reason WPE Framework stores everything under /UI/ and relative paths dont work :( so heres a workaround
        var logoLoadError = false;
        var logo = new Image();
        logo.alt = 'Metrological';
        logo.onload = () => {
            this.header.appendChild(logo);
        };

        logo.onerror= () => {
            if (logoLoadError === true)
                return;

            logo.src='UI/img/ml.svg';
            logoLoadError = true;
        };

        logo.src='img/ml.svg';

        // hooks
        document.getElementById('button-left').onclick = this.showMenu.bind(this);

        window.onresize = function () {
            if (this.isTouchDevice === true)
                return;

            var menu = document.getElementById('menu');
            if (window.innerWidth > 960) {
                menu.style.left = '0px';
            } else {
                menu.style.left = '-600px';
            }
        };

        this.api.t.on('Controller', 'all', _notification => {
            if (_notification.data && _notification.data.state)
                this.render();
        });
    }

    clear() {
        this.nav.innerHTML = '';
    }

    render(activePlugin) {
        this.api.getControllerPlugins().then( _plugins => {
            this.clear();
            const enabledPlugins = Object.keys(this.plugins);
            let ul = document.createElement('ul');

            for (let i = 0; i<_plugins.length; i++) {
                const plugin = _plugins[i];

                // check if plugin is available in our loaded plugins
                if (enabledPlugins.indexOf(plugin.callsign) === -1)
                    continue;

                const loadedPlugin = this.plugins[ plugin.callsign ];
                if (plugin.state !== 'Deactivated' && loadedPlugin.renderInMenu === true) {
                    console.debug('Menu :: rendering ' + plugin.callsign);
                    var li = document.createElement('li');
                    li.id = "item_" + plugin.callsign;

                    if (activePlugin === undefined && i === 0) {
                        li.className = 'menu-item active';
                    } else if (activePlugin === plugin.callsign) {
                        li.className = 'menu-item active';
                    } else {
                        li.className = 'menu-item';
                    }

                    li.appendChild(document.createTextNode(loadedPlugin.displayName !== undefined ? loadedPlugin.displayName : plugin.callsign));
                    li.onclick = this.toggleMenuItem.bind(null, plugin.callsign);
                    ul.appendChild(li);
                    this.nav.appendChild(ul);
                }
            }
        });
    }

    update() {
        // just re-render for now
        this.render();
    }

    toggleMenuItem(callsign) {
        var items = document.getElementsByClassName('menu-item');
        for (var i = 0; i < items.length; i++) {
            if ('item_' + callsign === items[i].id) {
                items[i].className = 'menu-item active';
            } else {
                items[i].className = 'menu-item';
            }

        }

        showPlugin(callsign);
    }

    showMenu() {
        var menu = document.getElementById('menu');

        if (menu.style.left === '0px') {
            menu.style.left = '-600px';
        } else {
            menu.style.left = '0px';
        }
    }
}

export default Menu;
