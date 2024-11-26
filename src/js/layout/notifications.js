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
/** The footer bar provides stats on the current device */

class Notifications {
    constructor(api)
    {
        this.renderInMenu = false;
        this.api = api;
        this.api.t.on('Controller', 'all', this.handleNotification);

        document.getElementById('hide-notifications').onclick = this.toggleVisibility.bind(this);
    }

    handleNotification(data)
    {
        document.getElementById('notifications-block').style.display = "block";

        var div = document.createElement('div');
        var string = '';

        for (var key1 in data) {
            if (data[key1] === 'Monitor') {
                div.className = 'red';
            }

            if (key1 === "callsign") {
                var label = document.createElement('label');
                label.innerHTML = data[key1];
                div.appendChild(label);
            }
            else if (key1 === "event") {
                string += key1 + ': "' + data[key1] + `"`;
            }
            else if (key1 === "params") {
                if (typeof data[key1] === 'string') {
                    string += ', ' + key1 + ': "' + data[key1] + `"`;
                }
                else if (typeof data[key1] === 'boolean') {
                    string += ', ' + key1 + ': "' + data[key1].toString() + '"';
                }
                else {
                    string += ', ' + key1 + ': {';
                    var i = 0;
                    var paramsLength = Object.keys(data[key1]).length;

                    for (var key2 in data[key1]) {
                        var value = data[key1][key2];

                        string += key2 + ': ';

                        if (typeof value === 'object') {
                            value = JSON.stringify(value);
                            string += `"` + value + `"`;
                        }
                        else if (typeof value === 'boolean') {
                            value = value.toString();
                            string += value;
                        }
                        else if (typeof value === 'number') {
                            string += value;
                        }
                        else {
                            string += `"` + value + `"`;
                        }

                        if (i == paramsLength - 1) {
                            string = string + '}';
                        }
                        else {
                            string = string + ', ';
                        }
                        i++;
                    }
                }
            }
        }

        var span = document.createElement('span');
        span.innerHTML = string;
        div.appendChild(span);

        document.getElementById('notifications').appendChild(div);
        document.getElementById('notifications').scrollTop= document.getElementById('notifications').scrollHeight;
    }

    toggleVisibility()
    {
        var isVisible = (document.getElementById('notifications').style.display === 'block');
        document.getElementById('notifications').style.display = isVisible ? "none" : "block";
        document.getElementById('hide-notifications').innerHTML = isVisible ? "show console" : "hide console";
    }

}

export default Notifications;
