/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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
/**RDKShell controls the management of composition, layout, Z order, and key handling.*/

import Plugin from '../core/plugin.js';

class RDKShell extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'RDK Shell';
    this.length = 0;
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `
        <div class="title grid__col grid__col--8-of-8">
        RDK Shell
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Client App Details
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Update App Details
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <button id="update_app" type="button">Update</button>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client Apps
        </div>
        <div id="client_apps" class="text grid__col grid__col--6-of-8">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client Apps in Z order
        </div>
        <div id="client_apps_zorder" class="text grid__col grid__col--6-of-8">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Available Types
        </div>
        <div id="available_types" class="text grid__col grid__col--6-of-8">
        </div>
        <div class="label grid__col grid__col--8-of-8">
        Status of application types
        </div>
        <div class="label grid__col grid__col--8-of-8">
        <table class="text grid__col grid__col--8-of-8" id="status_application">
        </table>
        </div>
        <div class="label grid__col grid__col--8-of-8">
        System Resource Info
        </div>
        <div class="label grid__col grid__col--8-of-8">
        <table class="text grid__col grid__col--8-of-8" id="system_resource"></table>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Move To Front / Back
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="client_moveFrontBack">
        </select>
        </div>
        <div class="text grid__col grid__col--2-of-8">
        <button id="set_moveToFront" type="button">Move Front</button>
        <button id="set_moveToBack" type="button">Move Back</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Move Behind
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="client_moveBehind">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Target
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="target_moveBehind">
        </select>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button id="set_moveBehind" type="button">Move Behind</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Manage Client apps
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="client_manage">
        </select>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button id="set_focus" type="button">Focus</button>
        <button id="set_suspend" type="button">Suspend</button>
        <button id="set_destroy" type="button">Destroy</button>
        <button id="set_kill" type="button">Kill</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Visibility
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="client_set_visible">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Visibility
        </div>
        <div class="grid__col grid__col--6-of-8">
        <div class="checkbox">
        <input type="checkbox" id="set_visible" checked></input>
        <label for="set_visible"></label>
        </div>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Opacity
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="client_set_opacity">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Opacity
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="value_opacity" type="number">
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button id="set_opacity" type="button">Set</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Scale
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="set_client_scale">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        sx
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input class="grid__col--5-of-8" id="set_sx_scale" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        sy
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input class="grid__col--5-of-8" id="set_sy_scale" type="number">
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button id="set_scale" type="button">Set</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Bounds
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client
        </div>
        <div class="label grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="set_client_bounds">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        x
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input class="grid__col--5-of-8" id="set_x_bounds" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        y
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input class="grid__col--5-of-8" id="set_y_bounds" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        w
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input class="grid__col--5-of-8" id="set_w_bounds" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        h
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input class="grid__col--5-of-8" id="set_h_bounds" type="number">
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button id="set_bounds" type="button">Set</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Animation
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Client
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="client_animation" type="string">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        x
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="x_animation" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        y
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="y_animation" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        w
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="w_animation" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        h
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="h_animation" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        alpha
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="alpha_animation" type="number" placeholder='Value between 0 and 100'>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        sx
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="sx_animation" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        sy
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="sy_animation" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        duration
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="duration_animation" type="number">
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button id="set_animation" type="button">Animate</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Launch
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Callsign
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="callsign_launch" type="string">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        type
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="type_launch" type="string">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        x
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="x_launch" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        y
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="y_launch" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        w
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="w_launch" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        h
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="h_launch" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        version
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="version_launch" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        uri
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="uri_launch" type="string">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        behind
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="behind_launch" type="string">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        configuration
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="configuration_launch" type="string">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        display name
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="displayName_launch" type="string">
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button id="set_launch" type="button">Launch</button>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Screen Resolution
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Width
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="width" type="number">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Height
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="height" type="number">
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button id="set_resolution" type="button">Set</button>
        </div>
        `;
    this.update_app = document.getElementById('update_app');
    this.update_app.onclick = this.update.bind(this);
    this.client_apps = document.getElementById('client_apps');
    this.client_apps_zorder = document.getElementById('client_apps_zorder');
    this.available_types = document.getElementById('available_types');
    this.status_application = document.getElementById('status_application');
    this.system_resource = document.getElementById('system_resource');
    this.client_moveFrontBack = document.getElementById('client_moveFrontBack');
    this.set_moveToFront = document.getElementById('set_moveToFront');
    this.set_moveToFront.onclick = this.doMoveToFront.bind(this);
    this.set_moveToBack = document.getElementById('set_moveToBack');
    this.set_moveToBack.onclick = this.doMoveToBack.bind(this);
    this.client_moveBehind = document.getElementById('client_moveBehind');
    this.client_moveBehind.onclick = this.doUpdateTarget.bind(this);
    this.target_moveBehind = document.getElementById('target_moveBehind');
    this.set_moveBehind = document.getElementById('set_moveBehind');
    this.set_moveBehind.onclick = this.doMoveBehind.bind(this);
    this.client_manage = document.getElementById('client_manage');
    this.set_focus = document.getElementById('set_focus');
    this.set_focus.onclick = this.doSetFocus.bind(this);
    this.set_suspend = document.getElementById('set_suspend');
    this.set_suspend.onclick = this.doSetSuspend.bind(this);
    this.set_destroy = document.getElementById('set_destroy');
    this.set_destroy.onclick = this.doSetDestroy.bind(this);
    this.set_kill = document.getElementById('set_kill');
    this.set_kill.onclick = this.doKill.bind(this);
    this.width_resolution = document.getElementById('width_resolution');
    this.height_resolution = document.getElementById('height_resolution');
    this.width = document.getElementById('width');
    this.height = document.getElementById('height');
    this.set_resolution = document.getElementById('set_resolution');
    this.set_resolution.onclick = this.doScreenResolution.bind(this);
    this.client_visible = document.getElementById('client_visible');
    this.show_visibility = document.getElementById('show_visibility');
    this.visible = document.getElementById('visible');
    this.client_set_visible = document.getElementById('client_set_visible');
    this.set_visible = document.getElementById('set_visible');
    this.set_visible.onclick = this.doSetVisibility.bind(this);
    this.client_opacity = document.getElementById('client_opacity');
    this.show_opacity = document.getElementById('show_opacity');
    this.opacity = document.getElementById('opacity');
    this.client_set_opacity = document.getElementById('client_set_opacity');
    this.value_opacity = document.getElementById('value_opacity');
    this.set_opacity = document.getElementById('set_opacity');
    this.set_opacity.onclick = this.doSetOpacity.bind(this);
    this.client_bounds = document.getElementById('client_bounds');
    this.show_bounds = document.getElementById('show_bounds');
    this.x_bounds = document.getElementById('x_bounds');
    this.y_bounds = document.getElementById('y_bounds');
    this.w_bounds = document.getElementById('w_bounds');
    this.h_bounds = document.getElementById('h_bounds');
    this.set_client_bounds = document.getElementById('set_client_bounds');
    this.set_x_bounds = document.getElementById('set_x_bounds');
    this.set_y_bounds = document.getElementById('set_y_bounds');
    this.set_w_bounds = document.getElementById('set_w_bounds');
    this.set_h_bounds = document.getElementById('set_h_bounds');
    this.set_bounds = document.getElementById('set_bounds');
    this.set_bounds.onclick = this.doSetBounds.bind(this);
    this.client_scale = document.getElementById('client_scale');
    this.show_scale = document.getElementById('show_scale');
    this.sx_scale = document.getElementById('sx_scale');
    this.sy_scale = document.getElementById('sy_scale');
    this.set_client_scale = document.getElementById('set_client_scale');
    this.set_sx_scale = document.getElementById('set_sx_scale');
    this.set_sy_scale = document.getElementById('set_sy_scale');
    this.set_scale = document.getElementById('set_scale');
    this.set_scale.onclick = this.doSetScale.bind(this);
    this.client_animation = document.getElementById('client_animation');
    this.x_animation = document.getElementById('x_animation');
    this.y_animation = document.getElementById('y_animation');
    this.w_animation = document.getElementById('w_animation');
    this.h_animation = document.getElementById('h_animation');
    this.sx_animation = document.getElementById('sx_animation');
    this.sy_animation = document.getElementById('sy_animation');
    this.alpha_animation = document.getElementById('alpha_animation');
    this.duration_animation = document.getElementById('duration_animation');
    this.set_animation = document.getElementById('set_animation');
    this.set_animation.onclick = this.doAnimate.bind(this);
    this.callsign_launch = document.getElementById('callsign_launch');
    this.type_launch = document.getElementById('type_launch');
    this.x_launch = document.getElementById('x_launch');
    this.y_launch = document.getElementById('y_launch');
    this.w_launch = document.getElementById('w_launch');
    this.h_launch = document.getElementById('h_launch');
    this.version_launch = document.getElementById('version_launch');
    this.uri_launch = document.getElementById('uri_launch');
    this.behind_launch = document.getElementById('behind_launch');
    this.configuration_launch = document.getElementById('configuration_launch');
    this.displayName_launch = document.getElementById('displayName_launch');
    this.set_launch = document.getElementById('set_launch');
    this.set_launch.onclick = this.doLaunch.bind(this);
    this.update();
  }

  doMoveToFront() {
    if (this.client_moveFrontBack.value) {
      try {
        this.moveToFront(this.client_moveFrontBack.value).then(response => {
          if (response && response.success) {
            this.update();
          } else {
            alert('Failed to move ' + this.client_moveFrontBack.value);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide client app name');
    }
  }

  doMoveToBack() {
    if (this.client_moveFrontBack.value) {
      try {
        this.moveToBack(this.client_moveFrontBack.value).then(response => {
          if (response && response.success) {
            this.update();
          } else {
            alert('Failed to move ' + this.client_moveFrontBack.value);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide client app name');
    }
  }

  doMoveBehind() {
    if (this.client_moveBehind.value) {
      if (this.client_moveBehind.value && this.target_moveBehind.value) {
        try {
          this.moveBehind(this.client_moveBehind.value, this.target_moveBehind.value).then(response => {
            if (response && response.success) {
              this.update();
              this.doUpdateTarget();
            } else {
              alert('Failed to move ' + this.client_moveBehind.value);
            }
          });
        } catch {
          alert('Error in getting response');
        }
      } else if (this.client_moveBehind.value == '' && this.target_moveBehind.value == '') {
        alert('Please provide client and target app name');
      } else if (this.client_moveBehind.value == '') {
        alert('Please provide client app name');
      } else if (this.target_moveBehind.value == '') {
        alert('Please provide target app name');
      }
    }
  }

  doSetFocus() {
    if (this.client_manage.value) {
      try {
        this.setFocus(this.client_manage.value).then(response => {
          if (response == null || !response.success) {
            alert('Failed to set focus to ' + this.client_manage.value);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide client app name');
    }
  }

  doSetSuspend() {
    if (this.client_manage.value) {
      try {
        this.suspend(this.client_manage.value).then(response => {
          if (response && response.success) {
            this.update();
          } else {
            alert('Failed to suspend ' + this.client_manage.value);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide client app name');
    }
  }

  doSetDestroy() {
    if (this.client_manage.value) {
      try {
        this.destroy(this.client_manage.value).then(response => {
          if (response && response.success) {
            this.update();
          } else {
            alert('Failed to destroy ' + this.client_manage.value);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide client app name');
    }
  }

  doKill() {
    if (this.client_manage.value) {
      try {
        this.kill(this.client_manage.value).then(response => {
          if (response && response.success) {
            this.update();
          } else {
            alert('Failed to kill ' + this.client_manage.value);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide client app name');
    }
  }

  doScreenResolution() {
    if (this.width.value && this.height.value) {
      try {
        this.setScreenResolution(parseInt(this.width.value), parseInt(this.height.value)).then(response => {
          if (response && response.success) {
            this.getScreenResolution().then(response => {
              this.width.value = response.w;
              this.height.value = response.h;
            });
          } else {
            alert('Failed to set resolution');
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else if (this.width.value == '' && this.height.value == '') {
      alert('Please provide width and height');
    } else if (this.width.value == '') {
      alert('Please provide width');
    } else if (this.height.value == '') {
      alert('Please provide height');
    }
  }

  doGetVisibility() {
    if (this.client_set_visible.value) {
      try {
        this.getVisibility(this.client_set_visible.value).then(response => {
          if (response && response.success) {
            this.set_visible.checked = response.visible;
          }
        });
      } catch {
        alert('Error in getting response for visibility');
      }
    } else {
      alert('Please provide client name');
    }
  }

  doSetVisibility() {
    if (this.client_set_visible.value) {
      if (this.set_visible.checked) {
        this.client_visibility = true;
      } else {
        this.client_visibility = false;
      }
      try {
        this.setVisibility(this.client_set_visible.value, this.client_visibility).then(response => {
          if (response && response.success) {
            if (this.client_set_visible.value) {
              this.getVisibility(this.client_set_visible.value).then(response => {
                if (response && response.success) {
                  this.set_visible.checked = response.visible;
                }
              });
            }
          } else {
            alert('Failed to set visibility to ' + this.client_set_visible.value);
            if (this.set_visible.checked) {
              this.set_visible.checked = false;
            } else {
              this.set_visible.checked = true;
            }
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else if (this.client_set_visible.value == '') {
      if (this.set_visible.checked) {
        this.set_visible.checked = false;
      } else {
        this.set_visible.checked = true;
      }
      alert('Please provide client name');
    }
  }

  doGetOpacity() {
    if (this.client_set_opacity.value) {
      try {
        this.getOpacity(this.client_set_opacity.value).then(response => {
          if (response && response.success) {
            this.value_opacity.value = response.opacity;
          } else {
            alert(response.message);
            this.value_opacity.value = '';
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide client name');
    }
  }

  doSetOpacity() {
    if (this.client_set_opacity.value && this.value_opacity.value) {
      try {
        this.setOpacity(this.client_set_opacity.value, parseInt(this.value_opacity.value)).then(response => {
          if (response && response.success) {
            if (this.client_set_opacity.value) {
              this.getOpacity(this.client_set_opacity.value).then(response => {
                if (response && response.success) {
                  this.value_opacity.value = response.opacity;
                }
              });
            }
          } else {
            alert('Failed to set opacity to ' + this.client_set_opacity.value);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else if (this.client_set_opacity.value == '' && this.value_opacity.value == '') {
      alert('Please provide client name and opacity value');
    } else if (this.client_set_opacity.value == '') {
      alert('Please provide client name');
    } else if (this.value_opacity.value == '') {
      alert('Please provide opacity value');
    }
  }

  doGetBounds() {
    if (this.set_client_bounds.value) {
      try {
        this.getBounds(this.set_client_bounds.value).then(response => {
          if (response && response.success) {
            this.set_x_bounds.value = response.bounds.x;
            this.set_y_bounds.value = response.bounds.y;
            this.set_w_bounds.value = response.bounds.w;
            this.set_h_bounds.value = response.bounds.h;
          } else {
            this.set_x_bounds.value = '-';
            this.set_y_bounds.value = '-';
            this.set_w_bounds.value = '-';
            this.set_h_bounds.value = '-';
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide client name');
    }
  }

  doSetBounds() {
    if (
      this.set_client_bounds.value &&
      this.set_x_bounds.value &&
      this.set_y_bounds.value &&
      this.set_w_bounds.value &&
      this.set_h_bounds.value
    ) {
      try {
        this.setBounds(
          this.set_client_bounds.value,
          parseInt(this.set_x_bounds.value),
          parseInt(this.set_y_bounds.value),
          parseInt(this.set_w_bounds.value),
          parseInt(this.set_h_bounds.value)
        ).then(response => {
          if (response == null || !response.success) {
            alert('Failed to set bounds to ' + this.set_client_bounds.value);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide all the parameters to set bounds');
    }
  }

  doGetScale() {
    if (this.set_client_scale.value) {
      try {
        this.getScale(this.set_client_scale.value).then(response => {
          if (response && response.success) {
            this.set_sx_scale.value = response.sx;
            this.set_sy_scale.value = response.sy;
          } else {
            this.set_sx_scale.value = '-';
            this.set_sy_scale.value = '-';
            alert(response.message);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide client name');
    }
  }

  doSetScale() {
    if (this.set_client_scale.value && this.set_sx_scale.value && this.set_sy_scale.value) {
      try {
        this.setScale(this.set_client_scale.value, this.set_sx_scale.value, this.set_sy_scale.value).then(response => {
          if (this.set_client_scale.value) {
            this.getScale(this.set_client_scale.value).then(response => {
              if (response && response.success) {
              }
            });
          }
          if (response == null || !response.success) {
            alert('Failed to scale client app' + this.set_client_scale.value);
          }
        });
      } catch {
        alert('Error');
      }
    } else {
      alert('Please provide all the parameters to scale');
    }
  }

  doAnimate() {
    var detailsArray = {
      client: this.client_animation.value,
      x: parseInt(this.x_animation.value),
      y: parseInt(this.y_animation.value),
      w: parseInt(this.w_animation.value),
      h: parseInt(this.h_animation.value),
      sx: parseInt(this.sx_animation.value),
      sy: parseInt(this.sy_animation.value),
      a: parseInt(this.alpha_animation.value),
      duration: this.duration_animation.value,
    };
    var keyAnimation = ['client', 'x', 'y', 'w', 'h', 'sx', 'sy', 'a', 'duration'];
    var valueAnimation = [
      this.client_animation.value,
      this.x_animation.value,
      this.y_animation.value,
      this.w_animation.value,
      this.h_animation.value,
      this.sx_animation.value,
      this.sy_animation.value,
      this.alpha_animation.value,
      this.duration_animation.value,
    ];
    for (var i = 0; i < keyAnimation.length; i++) {
      if (valueAnimation[i] == '') {
        delete detailsArray[keyAnimation[i]];
      }
    }
    if (JSON.stringify(detailsArray) != '{}' && this.duration_animation.value) {
      try {
        this.addAnimation(detailsArray).then(response => {
          if (response && response.success) {
            this.startLoading();
            setTimeout(this.stopLoading, this.duration_animation.value * 1000);
          } else {
            alert('Failed to animate ' + this.client_animation.value);
          }
        });
      } catch {
        alert('Error in animating ' + this.client_animation.value);
      }
    } else if (this.duration_animation.value === '') {
      alert('Please provide duration of animation');
    } else {
      alert('No client is available for animating');
    }
  }

  startLoading() {
    this.loadingEl = document.getElementById('disconnected');
    var loadingHtml = `<div id="disconnectedBlock">
                        <div class="loading">Animation InProgress</div>
                        </div>`;
    this.loadingEl.style.display = 'block';
    this.loadingEl.innerHTML = loadingHtml;
  }

  stopLoading() {
    document.getElementById('disconnected').innerHTML = '';
    document.getElementById('disconnected').style.display = 'none';
    alert('Completed Animation');
  }

  doLaunch() {
    var launchDetailsArray = {
      callsign: this.callsign_launch.value,
      type: this.type_launch.value,
      x: parseInt(this.x_launch.value),
      y: parseInt(this.y_launch.value),
      w: parseInt(this.w_launch.value),
      h: parseInt(this.h_launch.value),
      version: parseInt(this.version_launch.value),
      uri: this.uri_launch.value,
      behind: this.behind_launch.value,
      configuration: this.configuration_launch.value,
      displayName: this.displayName_launch.value,
    };
    var keyLaunch = [
      'callsign',
      'type',
      'x',
      'y',
      'w',
      'h',
      'version',
      'uri',
      'behind',
      'configuration',
      'displayName',
    ];
    var valueLaunch = [
      this.callsign_launch.value,
      this.type_launch.value,
      this.x_launch.value,
      this.y_launch.value,
      this.w_launch.value,
      this.h_launch.value,
      this.version_launch.value,
      this.uri_launch.value,
      this.behind_launch.value,
      this.configuration_launch.value,
      this.displayName_launch.value,
    ];
    for (var i = 0; i < keyLaunch.length; i++) {
      if (valueLaunch[i] == '') {
        delete launchDetailsArray[keyLaunch[i]];
      }
    }
    if (
      JSON.stringify(launchDetailsArray) != '{}' &&
      launchDetailsArray.uri &&
      launchDetailsArray.type &&
      launchDetailsArray.callsign
    ) {
      try {
        this.launch(launchDetailsArray).then(response => {
          if (response == null || !response.success) {
            alert('Failed to launch ' + this.callsign_launch.value);
          }
        });
      } catch {
        alert('Error in getting response');
      }
    } else {
      alert('Please provide parameters for launching app');
    }
  }

  doUpdateTarget() {
    for (var i = this.length - 1; i >= 0; i--) {
      this.target_moveBehind.options[i] = null;
    }
    try {
      this.getClients().then(response => {
        this.length = response.clients.length;
        for (var i = 0; i < response.clients.length; i++) {
          if (response.clients[i] != this.client_moveBehind.value) {
            this.target_list_movebehind = document.createElement('option');
            this.target_list_movebehind.text = response.clients[i];
            this.target_list_movebehind.value = response.clients[i];
            this.target_moveBehind.appendChild(this.target_list_movebehind);
          }
        }
      });
    } catch {
      alert('Error');
    }
  }

  moveToFront(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'moveToFront',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  moveToBack(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'moveToBack',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  moveBehind(client, target) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'moveBehind',
      params: { client: client, target: target },
    };

    return this.api.req(_rest, _rpc);
  }

  setFocus(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setFocus',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  suspend(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'suspend',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  destroy(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'destroy',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  kill(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'kill',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  getScreenResolution() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getScreenResolution',
    };

    return this.api.req(_rest, _rpc);
  }

  setScreenResolution(width, height) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setScreenResolution',
      params: { w: width, h: height },
    };

    return this.api.req(_rest, _rpc);
  }

  getVisibility(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getVisibility',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  setVisibility(client, visibility) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setVisibility',
      params: { client: client, visible: visibility },
    };

    return this.api.req(_rest, _rpc);
  }

  getOpacity(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getOpacity',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  setOpacity(client, opacity) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setOpacity',
      params: { client: client, opacity: opacity },
    };

    return this.api.req(_rest, _rpc);
  }

  getBounds(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getBounds',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  setBounds(client, x, y, w, h) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setBounds',
      params: { client: client, x: x, y: y, w: w, h: h },
    };

    return this.api.req(_rest, _rpc);
  }

  getScale(client) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getScale',
      params: { client: client },
    };

    return this.api.req(_rest, _rpc);
  }

  setScale(client, sx, sy) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setScale',
      params: { client: client, sx: sx, sy: sy },
    };

    return this.api.req(_rest, _rpc);
  }

  getClients() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getClients',
    };

    return this.api.req(_rest, _rpc);
  }

  getZOrder() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getZOrder',
    };

    return this.api.req(_rest, _rpc);
  }

  addAnimation(detailsArray) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };
    const _rpc = {
      plugin: this.callsign,
      method: 'addAnimation',
      params: {
        animations: [detailsArray],
      },
    };
    return this.api.req(_rest, _rpc);
  }

  launch(launchDetailsArray) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'launch',
      params: launchDetailsArray,
    };

    return this.api.req(_rest, _rpc);
  }

  getAvailableTypes() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getAvailableTypes',
    };

    return this.api.req(_rest, _rpc);
  }

  getState() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getState',
    };

    return this.api.req(_rest, _rpc);
  }

  getSystemResourceInfo() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSystemResourceInfo',
    };

    return this.api.req(_rest, _rpc);
  }

  update() {
    for (var i = this.length - 1; i >= 0; i--) {
      this.client_moveFrontBack.options[i] = null;
      this.client_moveBehind.options[i] = null;
      this.target_moveBehind.options[i] = null;
      this.client_set_visible.options[i] = null;
      this.client_set_opacity.options[i] = null;
      this.set_client_bounds.options[i] = null;
      this.set_client_scale.options[i] = null;
      this.client_animation.options[i] = null;
      this.client_manage.options[i] = null;
    }
    try {
      this.getClients().then(response => {
        if (response.clients) {
          this.client_apps.innerHTML = response.clients;
          this.length = response.clients.length;
          this.clientArray = response;
          for (var i = 0; i < this.length; i++) {
            this.client_list_move = document.createElement('option');
            this.client_list_move.text = response.clients[i];
            this.client_list_move.value = response.clients[i];
            this.client_moveFrontBack.appendChild(this.client_list_move);
            this.client_list_movebehind = document.createElement('option');
            this.client_list_movebehind.text = response.clients[i];
            this.client_list_movebehind.value = response.clients[i];
            this.client_moveBehind.appendChild(this.client_list_movebehind);
            if (i > 0) {
              this.target_list_movebehind = document.createElement('option');
              this.target_list_movebehind.text = response.clients[i];
              this.target_list_movebehind.value = response.clients[i];
              this.target_moveBehind.appendChild(this.target_list_movebehind);
            }
            this.client_list_visible = document.createElement('option');
            this.client_list_visible.text = response.clients[i];
            this.client_list_visible.value = response.clients[i];
            this.client_set_visible.appendChild(this.client_list_visible);
            this.client_list_opacity = document.createElement('option');
            this.client_list_opacity.text = response.clients[i];
            this.client_list_opacity.value = response.clients[i];
            this.client_set_opacity.appendChild(this.client_list_opacity);
            this.client_list_bounds = document.createElement('option');
            this.client_list_bounds.text = response.clients[i];
            this.client_list_bounds.value = response.clients[i];
            this.set_client_bounds.appendChild(this.client_list_bounds);
            this.client_list_scale = document.createElement('option');
            this.client_list_scale.text = response.clients[i];
            this.client_list_scale.value = response.clients[i];
            this.set_client_scale.appendChild(this.client_list_scale);
            this.client_list_animation = document.createElement('option');
            this.client_list_animation.text = response.clients[i];
            this.client_list_animation.value = response.clients[i];
            this.client_animation.appendChild(this.client_list_animation);
            this.client_list_manage = document.createElement('option');
            this.client_list_manage.text = response.clients[i];
            this.client_list_manage.value = response.clients[i];
            this.client_manage.appendChild(this.client_list_manage);
          }
          if (this.length != 0) {
            this.doGetOpacity();
            this.doGetBounds();
            this.doGetScale();
            this.doGetVisibility();
          } else {
            this.value_opacity.value = '';
            this.set_x_bounds.value = '';
            this.set_y_bounds.value = '';
            this.set_w_bounds.value = '';
            this.set_h_bounds.value = '';
            this.set_sx_scale.value = '';
            this.set_sy_scale.value = '';
            this.set_visible.checked = false;
          }
        }
      });
    } catch {
      alert('Error in getting response');
    }
    try {
      this.getZOrder().then(response => {
        if (response.clients) {
          this.client_apps_zorder.innerHTML = response.clients;
        }
      });
    } catch {
      alert('Error in getting zorder of client apps');
    }
    try {
      this.getScreenResolution().then(response => {
        this.width.value = response.w;
        this.height.value = response.h;
      });
    } catch {
      alert('Error in getting resolution');
    }
    try {
      this.getAvailableTypes().then(response => {
        if (response != null && response.types) {
          this.available_types.innerHTML = response.types;
        } else {
          this.available_types.innerHTML = 'No data available';
        }
      });
    } catch {
      alert('Error in getting available types');
    }
    try {
      this.getState().then(responseStatus => {
        if (responseStatus != null && responseStatus.runtimes) {
          this.status_application.innerHTML = '';
          this.tr1 = document.createElement('tr');
          this.tr1.id = 'trLarge';
          this.tr1.className = 'text grid__col grid__col--8-of-8';
          this.td1 = document.createElement('th');
          this.td1.id = 'td';
          this.td1.className = 'text grid__col grid__col--2-of-8';
          this.td1div = document.createElement('div');
          this.td1div.innerHTML = 'Callsign';
          this.td2 = document.createElement('th');
          this.td2.id = 'td';
          this.td2div = document.createElement('div');
          this.td2.className = 'text grid__col grid__col--2-of-8';
          this.td2div.innerHTML = 'State';
          this.td3 = document.createElement('th');
          this.td3.id = 'td';
          this.td3div = document.createElement('div');
          this.td3.className = 'text grid__col grid__col--2-of-8';
          this.td3div.innerHTML = 'URI';
          this.td1.appendChild(this.td1div);
          this.td2.appendChild(this.td2div);
          this.td3.appendChild(this.td3div);
          this.tr1.appendChild(this.td1);
          this.tr1.appendChild(this.td2);
          this.tr1.appendChild(this.td3);
          this.status_application.appendChild(this.tr1);
          for (var i = 0; i < responseStatus.runtimes.length; i++) {
            this.status = document.createElement('tr');
            this.status.id = 'trLarge';
            this.status.className = 'label grid__col grid__col--8-of-8';
            this.callsign_state = document.createElement('td');
            this.callsign_state.id = 'td';
            this.callsign_state.className = 'label grid__col grid__col--2-of-8';
            this.callsign_div = document.createElement('div');
            this.callsign_div.innerHTML = responseStatus.runtimes[i].callsign;
            this.state = document.createElement('td');
            this.state.id = 'td';
            this.state_div = document.createElement('div');
            this.state.className = 'label grid__col grid__col--2-of-8';
            this.state_div.innerHTML = responseStatus.runtimes[i].state;
            this.uri = document.createElement('td');
            this.uri.id = 'td';
            this.uri_div = document.createElement('div');
            this.uri.className = 'label grid__col grid__col--2-of-8';
            this.uri_div.innerHTML = responseStatus.runtimes[i].uri;
            this.callsign_state.appendChild(this.callsign_div);
            this.state.appendChild(this.state_div);
            this.uri.appendChild(this.uri_div);
            this.status.appendChild(this.callsign_state);
            this.status.appendChild(this.state);
            this.status.appendChild(this.uri);
            this.status_application.appendChild(this.status);
          }
        } else {
          this.status_application.innerHTML = `
          <tr id='tr'>
          <th id='td'>Callsign</th>
          <th id='td'>State</th>
          <th id='td'>URI</th>
          </tr>
          <tr>
          <td id='td' colspan="3">No data available</td>
          </tr>
          `;
        }
      });
    } catch {
      alert('Error in getting state of apps');
    }
    try {
      this.getSystemResourceInfo().then(responseResource => {
        this.system_resource.innerHTML = '';
        if (responseResource != null && responseResource.runtimes) {
          this.system_resource.innerHTML = '';
          this.tr2 = document.createElement('tr');
          this.tr2.id = 'trLarge';
          this.tr2.className = 'text grid__col grid__col--8-of-8';
          this.td4 = document.createElement('th');
          this.td4.id = 'td';
          this.td4.className = 'text grid__col grid__col--2-of-8';
          this.td4div = document.createElement('div');
          this.td4div.innerHTML = 'Callsign';
          this.td5 = document.createElement('th');
          this.td5.id = 'td';
          this.td5div = document.createElement('div');
          this.td5.className = 'text grid__col grid__col--2-of-8';
          this.td5div.innerHTML = 'RAM';
          this.td6 = document.createElement('th');
          this.td6.id = 'td';
          this.td6div = document.createElement('div');
          this.td6.className = 'text grid__col grid__col--2-of-8';
          this.td6div.innerHTML = 'VRAM';
          this.td4.appendChild(this.td4div);
          this.td5.appendChild(this.td5div);
          this.td6.appendChild(this.td6div);
          this.tr2.appendChild(this.td4);
          this.tr2.appendChild(this.td5);
          this.tr2.appendChild(this.td6);
          this.system_resource.appendChild(this.tr2);
          for (var i = 0; i < responseResource.runtimes.length; i++) {
            this.resourceInfo = document.createElement('tr');
            this.resourceInfo.id = 'trLarge';
            this.resourceInfo.className = 'label grid__col grid__col--8-of-8';
            this.callsign_resource = document.createElement('td');
            this.callsign_resource.id = 'td';
            this.callsign_resource.className = 'label grid__col grid__col--2-of-8';
            this.callsign_div = document.createElement('div');
            this.callsign_div.innerHTML = responseResource.runtimes[i].callsign;
            this.ram = document.createElement('td');
            this.ram.id = 'td';
            this.ram_div = document.createElement('div');
            this.ram.className = 'label grid__col grid__col--2-of-8';
            this.ram_div.innerHTML = responseResource.runtimes[i].ram;
            this.vram = document.createElement('td');
            this.vram.id = 'td';
            this.vram_div = document.createElement('div');
            this.vram.className = 'label grid__col grid__col--2-of-8';
            this.vram_div.innerHTML = responseResource.runtimes[i].vram;
            this.callsign_resource.appendChild(this.callsign_div);
            this.ram.appendChild(this.ram_div);
            this.vram.appendChild(this.vram_div);
            this.resourceInfo.appendChild(this.callsign_resource);
            this.resourceInfo.appendChild(this.ram);
            this.resourceInfo.appendChild(this.vram);
            this.system_resource.appendChild(this.resourceInfo);
          }
        } else {
          this.system_resource.innerHTML = `
          <tr id='tr'>
          <th id='td'>Callsign</th>
          <th id='td'>RAM</th>
          <th id='td'>VRAM</th>
          </tr>
          <tr>
          <td id='td' colspan="3">No data available</td>
          </tr>
          `;
        }
      });
    } catch {
      alert('Error in getting system resource information');
    }
  }

  close() {}
}

export default RDKShell;
