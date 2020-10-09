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
/** Timer plugin allows start,stop,suspend and resume timers. */

import Plugin from '../core/plugin.js';

class Timer extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);

    this.renderInMenu = true;
    this.displayName = 'Timer';
    this.mainDiv = document.getElementById('main');
    this.show = false;
    this.length = 0;
    this.onTimerExpired = this.api.t.on(this.callsign, 'timerExpired', notification => {
      if (this.show) {
        this.showAllTimers();
      }
    });

    this.template = `
      <div class="title grid__col grid__col--8-of-8">
        Timer
      </div>
      <div class="text grid__col grid__col--8-of-8">
          Start timer
      </div>
      <div class="label grid__col grid__col--2-of-8">
          Modes
      </div>
      <div class="text grid__col grid__col--6-of-8">
          <select id="modes" class="grid__col--5-of-8">
              <option value="GENERIC">GENERIC</option>
              <option value="WAKE">WAKE</option>
              <option value="SLEEP">SLEEP</option>
          </select>
      </div>
      <div class="label grid__col grid__col--2-of-8">
          Interval (in seconds)
      </div>
      <div class="text grid__col grid__col--6-of-8">
          <input type="number" id="interval" size="20" value='0' required />
      </div>
      <div class="label grid__col grid__col--2-of-8">
          Repeat Interval (in seconds)
      </div>
      <div class="text grid__col grid__col--6-of-8">
          <input type="number" id="rinterval" size="20" value='0' required />
      </div>
      <div class="label grid__col grid__col--2-of-8">
          Remind Before (in seconds)
      </div>
      <div class="text grid__col grid__col--6-of-8">
          <input type="number" id="rem_before" size="20" value='0' required />
      </div>
      <div class="text grid__col grid__col--8-of-8">
          <button type="button" id="timer_start">Start</button>
      </div>
      <div class="text grid__col grid__col--8-of-8">
          Status for all timers
      </div>
      <div class=" grid__col grid__col--8-of-8" id="test">
          <button type="button" id="all_timers">Show all timers</button>
          <div class=" grid__col grid__col--8-of-8"></div>
      </div>
      </div>
      <div class="text grid__col grid__col--8-of-8">
          Suspend/Resume/Stop Timers
      </div>
      <div class="label grid__col grid__col--1-of-8">
          Enter Timer ID
      </div>
      <div class="text grid__col grid__col--1-of-8">
          <input type="number" id="timer_id" size="20" value='0' min="1" step="1"
              onkeypress="return event.charCode >= 48 && event.charCode <= 57" required />
      </div>
      <div class="text grid__col grid__col--1-of-8">
          <select id="action">
              <option value="suspend">Suspend</option>
              <option value="resume">Resume</option>
              <option value="cancel">Cancel</option>
          </select>
      </div>
      <div class="text grid__col grid__col--1-of-8">
          <button type="button" id="ok">OK</button>
      </div>
      `;
  }

  render() {
    this.mainDiv.innerHTML = this.template;
    this.all_timers = document.getElementById('all_timers');
    this.t_interval = document.getElementById('interval');
    this.rep_interval = document.getElementById('rinterval');
    this.rem_before = document.getElementById('rem_before');
    this.timer_start = document.getElementById('timer_start');
    this.modes = document.getElementById('modes');
    this.ok = document.getElementById('ok');
    this.ok.onclick = this.stateChange.bind(this);
    this.all_timers.onclick = this.click.bind(this);
    this.timer_start.onclick = this.start.bind(this);
  }

  startTimer(interval, mode, rep_interval, rem_before) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'startTimer',
      params: {
        interval: interval,
        mode: mode,
        repeatInterval: rep_interval,
        remindBefore: rem_before,
      },
    };

    return this.api.req(_rest, _rpc);
  }

  start() {
    if (this.t_interval.value != '' && this.rep_interval.value != '' && this.rem_before.value != '') {
      this.startTimer(this.t_interval.value, this.modes.value, this.rep_interval.value, this.rem_before.value).then(
        () => {
          if (this.show) {
            this.showAllTimers();
          }
        }
      );
    } else {
      alert('Check your input parameters');
    }
  }

  change(state, id) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: state,
      params: { timerId: id },
    };

    return this.api.req(_rest, _rpc);
  }

  click() {
    if (this.all_timers.innerHTML == 'Show all timers') {
      this.showAllTimers();
    } else if (this.all_timers.innerHTML == 'Hide') {
      this.hideTimers();
      this.all_timers.innerHTML = 'Show all timers';
      this.show = false;
    }
  }

  getAllTimers() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getTimers',
    };

    return this.api.req(_rest, _rpc);
  }

  showAllTimers() {
    this.show = true;
    var mainDiv = document.getElementById('test');
    this.hideTimers();
    this.getAllTimers().then(response => {
      if (response != null && response.timers.length > 0) {
        this.length = response.timers.length;
        for (var i = 0; i < response.timers.length; i++) {
          this.tid_timer = document.createElement('div');
          this.tid_timer.id = 'tid_' + i;
          this.tid_timer.className = 'label grid__col grid__col--2-of-8';
          this.tid_timer.innerHTML = 'TimerID';
          this.tid_value = document.createElement('div');
          this.tid_value.id = 'tidValue_' + i;
          this.tid_value.className = 'text grid__col grid__col--6-of-8';
          this.tid_value.innerHTML = response.timers[i].timerId;
          this.timer_mode = document.createElement('div');
          this.timer_mode.id = 'tmode_' + i;
          this.timer_mode.className = 'label grid__col grid__col--2-of-8';
          this.timer_mode.innerHTML = 'Mode';
          this.tmode = document.createElement('div');
          this.tmode.id = 'tm_' + i;
          this.tmode.className = 'text grid__col grid__col--6-of-8';
          this.tmode.innerHTML = response.timers[i].mode;
          this.timer_state = document.createElement('div');
          this.timer_state.id = 'tstate_' + i;
          this.timer_state.className = 'label grid__col grid__col--2-of-8';
          this.timer_state.innerHTML = 'State';
          this.tstate = document.createElement('div');
          this.tstate.id = 'ts_' + i;
          this.tstate.className = 'text grid__col grid__col--6-of-8';
          this.tstate.innerHTML = response.timers[i].state;
          this.tInterval = document.createElement('div');
          this.tInterval.id = 'tInterval_' + i;
          this.tInterval.className = 'label grid__col grid__col--2-of-8';
          this.tInterval.innerHTML = 'Repeat Interval';
          this.tIntervalValue = document.createElement('div');
          this.tIntervalValue.id = 'tIntervalValue_' + i;
          this.tIntervalValue.className = 'text grid__col grid__col--6-of-8';
          this.tIntervalValue.innerHTML = response.timers[i].repeatInterval;
          this.rem_time = document.createElement('div');
          this.rem_time.id = 'remtime_' + i;
          this.rem_time.className = 'label grid__col grid__col--2-of-8';
          this.rem_time.innerHTML = 'Remind Before';
          this.remTimeValue = document.createElement('div');
          this.remTimeValue.id = 'rb_' + i;
          this.remTimeValue.className = 'text grid__col grid__col--6-of-8';
          this.remTimeValue.innerHTML = response.timers[i].remindBefore;
          this.spacing = document.createElement('div');
          this.spacing.id = 'spacing_' + i;
          this.spacing.className = 'text grid__col grid__col--8-of-8';
          mainDiv.appendChild(this.tid_timer);
          mainDiv.appendChild(this.tid_value);
          mainDiv.appendChild(this.timer_mode);
          mainDiv.appendChild(this.tmode);
          mainDiv.appendChild(this.timer_state);
          mainDiv.appendChild(this.tstate);
          mainDiv.appendChild(this.rem_time);
          mainDiv.appendChild(this.remTimeValue);
          mainDiv.appendChild(this.tInterval);
          mainDiv.appendChild(this.tIntervalValue);
          mainDiv.appendChild(this.spacing);
        }
        this.all_timers.innerHTML = 'Hide';
      } else {
        this.show = false;
        alert('No timers to show');
      }
    });
  }

  hideTimers() {
    for (var i = 0; i < this.length; i++) {
      document.getElementById('tid_' + i).remove();
      document.getElementById('tidValue_' + i).remove();
      document.getElementById('tmode_' + i).remove();
      document.getElementById('tm_' + i).remove();
      document.getElementById('tstate_' + i).remove();
      document.getElementById('ts_' + i).remove();
      document.getElementById('tInterval_' + i).remove();
      document.getElementById('tIntervalValue_' + i).remove();
      document.getElementById('spacing_' + i).remove();
      document.getElementById('remtime_' + i).remove();
      document.getElementById('rb_' + i).remove();
    }
    this.length = 0;
  }

  stateChange() {
    var id = document.getElementById('timer_id').value;
    var state = document.getElementById('action').value;

    this.change(state, id).then(notification => {
      if (!notification.success) {
        alert('Please check your timer ID and state once again');
      } else {
        this.showAllTimers();
      }
    });
  }

  close() {
    this.hideTimers();
    if (this.onTimerExpired && typeof this.onTimerExpired.dispose === 'function') {
      this.onTimerExpired.dispose();
      this.onTimerExpired = null;
    }
  }
}

export default Timer;
