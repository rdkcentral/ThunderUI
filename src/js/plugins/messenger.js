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
/**Messenger plugin allows exchanging text messages between users gathered in virtual rooms*/

import Plugin from '../core/plugin.js';

class Messenger extends Plugin {
    constructor(pluginData, api) {
        super(pluginData, api);
        this.displayName = 'Messenger';
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
                <select id="room_id">
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
                <select id="message_room_id">
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

    doJoinRoom() {
        this.joinRoom(this.user.value, this.room.value).then(response => {
            if (response != null && response.roomid) {
                this.joined_text.innerHTML = 'Joined room ' + response.roomid;
                setTimeout(this.removeJoinText, 2000);
                var option1 = document.createElement('option');
                option1.text = response.roomid;
                option1.value = response.roomid;
                this.room_id.appendChild(option1);
                var option2 = document.createElement('option');
                option2.text = response.roomid;
                option2.value = response.roomid;
                this.message_room_id.appendChild(option2);
            }
        });
    }

    doLeaveRoom() {
        this.roomIdValue = this.room_id.selectedIndex;
        if (this.roomIdValue >= 0) {
            this.leaveRoom(this.room_id[this.roomIdValue].value).then(response => {
              if (response == null) {
                this.left_text.innerHTML = 'Left room ' + this.room_id[this.roomIdValue].value;
                setTimeout(this.removeLeftText, 2000);
                this.room_id.remove(this.roomIdValue);
                this.message_room_id.remove(this.roomIdValue);
              }
            });
        }
    }

    doSentMessage() {
        this.messageRoomIdValue = this.message_room_id.selectedIndex;
        if (this.messageRoomIdValue >= 0) {
            this.sentMessage(this.message_room_id[this.messageRoomIdValue].value, this.message.value).then(response => {
              if (response == null) {
                this.send_text.innerHTML = 'Message sent to ' + this.message_room_id[this.messageRoomIdValue].value;
                setTimeout(this.removeSendText, 2000);
              }
            });
        }
  }

    joinRoom(user, room) {
        const _rest = {
          method: 'GET',
          path: `${this.callsign}`,
        };

        const _rpc = {
          plugin: this.callsign,
          method: 'join',
          params: {
            user: user,
            room: room,
          },
        };

        return this.api.req(_rest, _rpc);
    }

    leaveRoom(roomId) {
        const _rest = {
          method: 'GET',
          path: `${this.callsign}`,
        };

        const _rpc = {
          plugin: this.callsign,
          method: 'leave',
          params: {
            roomid: roomId,
          },
        };

        return this.api.req(_rest, _rpc);
    }

    sentMessage(roomId, message) {
        const _rest = {
          method: 'GET',
          path: `${this.callsign}`,
        };

        const _rpc = {
          plugin: this.callsign,
          method: 'sent',
          params: {
            roomid: roomId,
            message: message,
          },
        };

        return this.api.req(_rest, _rpc);
    }

    removeJoinText() {
        this.joined_text.innerHTML = '';
    }

    removeLeftText() {
        this.left_text.innerHTML = '';
    }

    removeSendText() {
        this.send_text.innerHTML = '';
    }

    close() {
        if (this.room_id) {
            for (var i = 0; i < this.room_id.options.length; i++) {
                this.leaveRoom(this.room_id.options[i]);
            }
        }
    }
}

export default Messenger;
