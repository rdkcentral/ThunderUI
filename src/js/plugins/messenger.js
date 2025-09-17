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
/**Messenger plugin allows exchanging text messages between users gathered in virtual rooms*/

import Plugin from '../core/plugin.js';

class Messenger extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'Messenger';
    this.rooms = new Map();
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `
            <div class="title grid__col grid__col--8-of-8">
                Join
            </div>
            <div class="label grid__col grid__col--2-of-8">
                User
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="string" id="user">
            </div>
            <div class="label grid__col grid__col--2-of-8">
                Room
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="string" id="room">
            </div>
            <div class="text grid__col grid__col--2-of-8">
                <button type="button" id="join" >Join</button>
            </div>
            <div id="joined_text" class="text grid__col grid__col--6-of-8">
            </div>
            <div class="title grid__col grid__col--8-of-8">
                Leave
            </div>
            <div class="label grid__col grid__col--2-of-8">
                RoomId
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <select class="grid__col grid__col--5-of-8" id="room_id">
                </select>
            </div>
            <div class="text grid__col grid__col--2-of-8">
                <button type="button" id="leave" >Leave</button>
            </div>
            <div id="left_text" class="text grid__col grid__col--6-of-8">
            </div>
            <div class="title grid__col grid__col--8-of-8">
                Send Message
            </div>
            <div class="label grid__col grid__col--2-of-8">
                RoomId
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <select class="grid__col grid__col--5-of-8" id="message_room_id">
                </select>
            </div>
            <div class="label grid__col grid__col--2-of-8">
                Message
            </div>
            <div class="text grid__col grid__col--6-of-8">
                <input type="string" id="message">
            </div>
            <div class="text grid__col grid__col--2-of-8">
                <button type="button" id="sent" >Sent</button>
            </div>
            <div id="send_text" class="text grid__col grid__col--6-of-8">
            </div>
                    `;
    this.user = document.getElementById('user');
    this.room = document.getElementById('room');
    this.join = document.getElementById('join');
    this.join.onclick = this.doJoinRoom.bind(this);
    this.joined_text = document.getElementById('joined_text');
    this.room_id = document.getElementById('room_id');
    this.leave = document.getElementById('leave');
    this.leave.onclick = this.doLeaveRoom.bind(this);
    this.left_text = document.getElementById('left_text');
    this.message_room_id = document.getElementById('message_room_id');
    this.message = document.getElementById('message');
    this.sent = document.getElementById('sent');
    this.sent.onclick = this.doSentMessage.bind(this);
    this.send_text = document.getElementById('send_text');
  }

  _formatRoomLabel(roomId) {
    const meta = this.rooms.get(roomId);
    if (!meta) return roomId;
    return `${roomId} (${meta.user}/${meta.name})`;
  }

  _addRoomOptions(roomId) {
    const label = this._formatRoomLabel(roomId);

    if (![...this.room_id.options].some(o => o.value === roomId)) {
      const opt1 = document.createElement('option');
      opt1.value = roomId;
      opt1.text = label;
      this.room_id.appendChild(opt1);
    } else {
      [...this.room_id.options].forEach(o => { if (o.value === roomId) o.text = label; });
    }

    if (![...this.message_room_id.options].some(o => o.value === roomId)) {
      const opt2 = document.createElement('option');
      opt2.value = roomId;
      opt2.text = label;
      this.message_room_id.appendChild(opt2);
    } else {
      [...this.message_room_id.options].forEach(o => { if (o.value === roomId) o.text = label; });
    }
  }

  doJoinRoom() {
    if (
      this.user.value !== '' &&
      this.room.value !== '' &&
      this.user.value.trim().length !== 0 &&
      this.room.value.trim().length !== 0
    ) {
      const enteredUser = this.user.value.trim();
      const enteredRoomName = this.room.value.trim();

      this.joinRoom(enteredUser, enteredRoomName).then(response => {
        if (response && typeof response === 'object' && response.error) {
          console.warn('Join returned error object:', response.error);
          alert('Failed to join room (backend error)');
          return;
        }

        const roomId = (()=>{
          if (typeof response === 'string') return response;
          if (response && typeof response === 'object') {
            if (typeof response.result === 'string') return response.result;
            const candidate = (response.result !== undefined ? response.result : response);
            if (typeof candidate === 'string') return candidate;
            if (candidate && typeof candidate === 'object') {
              return candidate.roomid || candidate.roomId || candidate.room || candidate.id || null;
            }
          }
          return null;
        })();

        console.debug('Extracted roomId:', roomId);

        if (roomId && typeof roomId === 'string' && roomId.trim().length) {
          if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, { name: enteredRoomName, user: enteredUser });
          }
          this.joined_text.innerHTML = 'Joined room ' + this._formatRoomLabel(roomId);
          setTimeout(() => this.removeJoinText(), 2000);

          this._addRoomOptions(roomId);

          this.room_id.value = roomId;
          this.message_room_id.value = roomId;
        } else {
          console.warn('Join response missing usable room id after extraction:', response);
          alert('Failed to join room (no room identifier in response)');
        }
      }).catch(err => {
        console.error('Join RPC failed:', err);
        alert('Failed to join room (RPC error)');
      });
    } else if (
      (this.user.value === '' && this.room.value === '') ||
      (this.user.value.trim().length === 0 && this.room.value.trim().length === 0)
    ) {
      alert('Please provide user and room value to join the room');
    } else if (this.user.value === '' || this.user.value.trim().length === 0) {
      alert('Please provide user value to join the room');
    } else if (this.room.value === '' || this.room.value.trim().length === 0) {
      alert('Please provide room value to join the room');
    }
  }

  doLeaveRoom() {
    this.roomIdValue = this.room_id.selectedIndex;
    if (this.roomIdValue >= 0) {
      const leavingId = this.room_id[this.roomIdValue].value;
      this.leaveRoom(leavingId).then(response => {
        const hasError = response && response.error;
        if (!hasError) {
          this.left_text.innerHTML = 'Left room ' + this._formatRoomLabel(leavingId);
            setTimeout(() => this.removeLeftText(), 2000);
            this.room_id.remove(this.roomIdValue);
            this.message_room_id.remove(this.roomIdValue);
            this.rooms.delete(leavingId);
            this.user.value = '';
            this.room.value = '';
            this.message.value = '';
        } else {
          console.warn('Leave error response:', response);
          alert('Failed to leave room');
        }
      }).catch(err => {
        console.error('Leave RPC failed:', err);
        alert('Failed to leave room (RPC error)');
      });
    } else {
      alert('No rooms are available to leave');
    }
  }

  doSentMessage() {
    this.messageRoomIdValue = this.message_room_id.selectedIndex;
    if (this.messageRoomIdValue >= 0 && this.message.value !== '' && this.message.value.trim().length !== 0) {
      const targetRoomId = this.message_room_id.options[this.messageRoomIdValue].value;
      this.sentMessage(targetRoomId, this.message.value).then(response => {
        const hasError = response && response.error;
        if (!hasError) {
          this.send_text.innerHTML = 'Message sent to ' + targetRoomId;
          setTimeout(() => this.removeSendText(), 2000);
        } else {
          console.warn('Send error response:', response);
          alert('Failed to send message');
        }
      }).catch(err => {
        console.error('Send RPC failed:', err);
        alert('Failed to send message (RPC error)');
      });
    } else if (this.message.value === '' || this.message.value.trim().length === 0) {
      alert('Please provide message value');
    } else if (this.messageRoomIdValue < 0) {
      alert('No rooms are available to send message');
    }
  }

  joinRoom(user, room) {
    const _rpc = {
      plugin: this.callsign,
      method: 'join',
      params: {
        user: user,
        room: room,
      },
    };

    return this.api.req(null, _rpc);
  }

  leaveRoom(roomId) {
    const _rpc = {
      plugin: this.callsign,
      method: 'leave',
      params: {
        roomid: roomId,
      },
    };

    return this.api.req(null, _rpc);
  }

  sentMessage(roomId, message) {
    const _rpc = {
      plugin: this.callsign,
      method: 'sent',
      params: {
        roomid: roomId,
        message: message,
      },
    };

    return this.api.req(null, _rpc);
  }

  removeJoinText() {
    if (this.joined_text) this.joined_text.innerHTML = '';
  }

  removeLeftText() {
    if (this.left_text) this.left_text.innerHTML = '';
  }

  removeSendText() {
    if (this.send_text) this.send_text.innerHTML = '';
  }

  close() {
    if (this.room_id) {
      const ids = [...this.room_id.options].map(o => o.value);
      ids.forEach(id => this.leaveRoom(id));
      this.rooms.clear();
    }
  }
}

export default Messenger;
