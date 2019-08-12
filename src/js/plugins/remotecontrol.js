/** Keyboard provides an onscreen keyboard for touch based devices
 * This file is instantiated by menu.js
 */

import Plugin from '../core/Plugin.js';

class RemoteControl extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
        this.displayName = 'Remote Control';
        this.onScreenKeyBoardIsRendered     = false;
        this.doNotHandleKeys                = false;
        this.devicesThatSupportPairing      = ['GreenPeakRF4CE', 'GreenPeak', 'RF4CE'];

        this.autoFwdKeys                    = window.localStorage.getItem('autoFwdKeys');
        this.automaticallyForwardKeys       = (this.autoFwdKeys !== 'false');

        /**
         * Human to WPE key codes.
         * Note! This Array is drawn as the on screen keyboard in ASC order.
         *       Changing the order or adding stuff will add it to the render loop  for the keyboard
         */
        this.keyMapping = {
            '1'     : { code : '0x0021', color: undefined, string: '1' },
            '2'     : { code : '0x0022', color: undefined, string: '2' },
            '3'     : { code : '0x0023', color: undefined, string: '3' },
            '4'     : { code : '0x0024', color: undefined, string: '4' },
            '5'     : { code : '0x0025', color: undefined, string: '5' },
            '6'     : { code : '0x0026', color: undefined, string: '6' },
            '7'     : { code : '0x0027', color: undefined, string: '7' },
            '8'     : { code : '0x0028', color: undefined, string: '8' },
            '9'     : { code : '0x0029', color: undefined, string: '9' },
            '0'     : { code : '0x0020', color: undefined, string: '0' },
            'exit'  : { code : '0x0009', color: 'blue',    string: 'exit' },
            'a'     : { code : '0x8004', color: undefined, string: 'a' },
            'b'     : { code : '0x8005', color: undefined, string: 'b' },
            'c'     : { code : '0x8006', color: undefined, string: 'c' },
            'd'     : { code : '0x8007', color: undefined, string: 'd' },
            'e'     : { code : '0x8008', color: undefined, string: 'e' },
            'f'     : { code : '0x8009', color: undefined, string: 'f' },
            'g'     : { code : '0x800A', color: undefined, string: 'g' },
            'h'     : { code : '0x800B', color: undefined, string: 'h' },
            'i'     : { code : '0x800C', color: undefined, string: 'i' },
            'back'  : { code : '0x0032', color: 'blue double', string: 'back' },
            'j'     : { code : '0x800D', color: undefined, string: 'j' },
            'k'     : { code : '0x800E', color: undefined, string: 'k' },
            'l'     : { code : '0x800F', color: undefined, string: 'l' },
            'm'     : { code : '0x8010', color: undefined, string: 'm' },
            'n'     : { code : '0x8011', color: undefined, string: 'n' },
            'o'     : { code : '0x8012', color: undefined, string: 'o' },
            'p'     : { code : '0x8013', color: undefined, string: 'p' },
            'q'     : { code : '0x8014', color: undefined, string: 'q' },
            'r'     : { code : '0x8015', color: undefined, string: 'r' },
            'up'    : { code : '0x0001', color: 'blue',    string: 'up',    div : '<div class="fa fa-caret-up"></div>', },
            'ok'    : { code : '0x002B', color: 'blue',    string: 'ok' },
            's'     : { code : '0x8016', color: undefined, string: 's' },
            't'     : { code : '0x8017', color: undefined, string: 't' },
            'u'     : { code : '0x8018', color: undefined, string: 'u' },
            'v'     : { code : '0x8019', color: undefined, string: 'v' },
            'w'     : { code : '0x801A', color: undefined, string: 'w' },
            'x'     : { code : '0x801B', color: undefined, string: 'x' },
            'y'     : { code : '0x801C', color: undefined, string: 'y' },
            'z'     : { code : '0x801D', color: undefined, string: 'z' },
            'left'  : { code : '0x0003', color: 'blue',    string: 'left',  div : '<div class="fa fa-caret-left"></div>'  },
            'down'  : { code : '0x0002', color: 'blue',    string: 'down',  div : '<div class="fa fa-caret-down"></div>' },
            'right' : { code : '0x0004', color: 'blue',    string: 'right', div : '<div class="fa fa-caret-right"></div>' }
        };

        /** JS to WPE Keymap for the onkey bindings */
        this.jsToWpeKeyMap = {
            13: { code: '0x002B', string: 'enter' },
            37: { code: '0x0003', string: 'left' },
            38: { code: '0x0001', string: 'up' },
            39: { code: '0x0004', string: 'right' },
            40: { code :'0x0002', string: 'down' },
            27: { code :'0x0009', string: 'esc' },
             8: { code :'0x0032', string: 'backspace' },
            48: { code :'0x0020', string: '0' },
            49: { code :'0x0021', string: '1' },
            50: { code :'0x0022', string: '2' },
            51: { code :'0x0023', string: '3' },
            52: { code :'0x0024', string: '4' },
            53: { code :'0x0025', string: '5' },
            54: { code :'0x0026', string: '6' },
            55: { code :'0x0027', string: '7' },
            56: { code :'0x0028', string: '8' },
            57: { code :'0x0029', string: '9' },
            33: { code :'0x0030', string: 'page up' },
            34: { code :'0x0031', string: 'page down' },
            65: { code :'0x8004', string: 'a' },
            66: { code :'0x8005', string: 'b' },
            67: { code :'0x8006', string: 'c' },
            68: { code :'0x8007', string: 'd' },
            69: { code :'0x8008', string: 'e' },
            70: { code :'0x8009', string: 'f' },
            71: { code :'0x800A', string: 'g' },
            72: { code :'0x800B', string: 'h' },
            73: { code :'0x800C', string: 'i' },
            74: { code :'0x800D', string: 'j' },
            75: { code :'0x800E', string: 'k' },
            76: { code :'0x800F', string: 'l' },
            77: { code :'0x8010', string: 'm' },
            78: { code :'0x8011', string: 'n' },
            79: { code :'0x8012', string: 'o' },
            80: { code :'0x8013', string: 'p' },
            81: { code :'0x8014', string: 'q' },
            82: { code :'0x8015', string: 'r' },
            83: { code :'0x8016', string: 's' },
            84: { code :'0x8017', string: 't' },
            85: { code :'0x8018', string: 'u' },
            86: { code :'0x8019', string: 'v' },
            87: { code :'0x801A', string: 'w' },
            88: { code :'0x801B', string: 'x' },
            89: { code :'0x801C', string: 'y' },
            90: { code :'0x801D', string: 'z' },
            46: { code :'0x802A', string: 'delete' },
            32: { code :'0x802C', string: 'space' },
            189: { code :'0x802D', string: '-' },
            187: { code :'0x802E', string: '=' },
            220: { code :'0x8031', string: '\\' },
            186: { code :'0x8033', string: ';' },
            222: { code :'0x8034', string: '`' },
            188: { code :'0x8036', string: ',' },
            190: { code :'0x8037', string: '.' },
            191: { code :'0x8038',  string: '/' }
        };

        // add the keyboard button to the menu
        this.addKeyboardButton();

        this.keyboardDiv = document.getElementById('keyboard');
        this.keyBoardInnerDiv = document.createElement('div');
        this.keyBoardInnerDiv.id = 'keyboard-inner';

        // add the keys to the div
        var keyList = Object.keys(this.keyMapping);
        for (var i=0; i<keyList.length; i++) {
            var key = this.keyMapping[ keyList[i] ];
            var keyName = keyList[i];

            var keyEl = document.createElement('div');
            keyEl.className = 'button ' + (key.color || '');

            if (key.div !== undefined)
                keyEl.innerHTML = key.div;
            else
                keyEl.innerHTML = keyName;


            keyEl.onclick = this.handleKey.bind(this, keyName);
            this.keyBoardInnerDiv.appendChild(keyEl);
        }

        // bind lister for keyboard input directly from the user
        window.addEventListener('keyup', this.handleKeyFromJs.bind(this, false));
        window.addEventListener('keydown', this.handleKeyFromJs.bind(this, true));
    }

    sendKey(key) {
        var body = {
            'device': 'Web',
            'code'  : key,
        };

        const _rest = {
            method  : 'PUT',
            path    : 'RemoteControl/Web/Send',
            body    : body
        };

        const _rpc = {
            plugin : 'RemoteControl',
            method : 'send',
            params : body
        };

        return this.api.req(_rest, _rpc);
    }

    sendKeyPress(key) {
        var body = {
            'device': 'Web',
            'code'  : key,
        };

        const _rest = {
            method  : 'PUT',
            path    : 'RemoteControl/Web/Press',
            body    : body
        };

        const _rpc = {
            plugin : 'RemoteControl',
            method : 'press',
            params : body
        };

        return this.api.req(_rest, _rpc);
    }

    sendKeyRelease(key) {
        var body = {
            'device': 'Web',
            'code'  : key,
        };

        const _rest = {
            method  : 'PUT',
            path    : 'RemoteControl/Web/Release',
            body    : body
        };

        const _rpc = {
            plugin : 'RemoteControl',
            method : 'release',
            params : body
        };

        return this.api.req(_rest, _rpc);
    }


    renderKey(keyString) {
        var statusBarEl = document.getElementById('keyPressed');
        if (statusBarEl !== null)
            statusBarEl.innerHTML = keyString;


        var remoteControlEl = document.getElementById('remoteControlKeyPressed');
        if (remoteControlEl !== null)
            remoteControlEl.innerHTML = keyString;
    }

    handleKeyFromJs(keyDown, e) {
        if (this.doNotHandleKeys === true || e.repeat || this.automaticallyForwardKeys === false) return;

        var mappedKey = this.jsToWpeKeyMap[ e.which ];
        if (mappedKey === undefined)
            return;


        this.renderKey(mappedKey.string);

        if (keyDown)
            this.sendKeyPress(mappedKey.code);
        else
            this.sendKeyRelease(mappedKey.code);
    }

    handleKey(key) {
        var mappedKey = this.keyMapping[ key ];
        if (mappedKey === undefined)
            return;

        this.renderKey(mappedKey.string);
        this.sendKey(mappedKey.code);
    }

    addKeyboardButton() {
        // add button to top menu
        var headerDiv = document.getElementById('header');

        // header seems to not be rendered yet, try again in a bit (this happens if the top menu didnt initialize yet)
        if (headerDiv === null) {
            setTimeout(this.addKeyboardButton.bind(this), 500);
            return;
        }

        var keyboardButtonDiv = document.createElement('div');
        keyboardButtonDiv.id = 'button-right';
        keyboardButtonDiv.className = 'fa fa-keyboard-o right';
        keyboardButtonDiv.onclick = this.showKeyboard.bind(this);
        headerDiv.appendChild(keyboardButtonDiv);
    }

    showKeyboard() {
        if (this.onScreenKeyBoardIsRendered === true) {
            this.closeKeyboard();
        } else {
            this.renderKeyboard();
        }
    }

    closeKeyboard() {
        this.keyboardDiv.innerHTML = '';
        this.onScreenKeyBoardIsRendered = false;
    }

    renderKeyboard() {
        this.keyboardDiv.appendChild(this.keyBoardInnerDiv);
        this.keyboardDiv.style.bottom = '0px';
        this.onScreenKeyBoardIsRendered = true;
    }

    close() {
        document.getElementById('main').innerHTML = '';
    }

    activatePairing(deviceName) {
        const _rest = {
            method  : 'PUT',
            path    : `RemoteControl/${deviceName}/Pair`
        };

        const _rpc = {
            plugin : 'RemoteControl',
            method : 'pair',
            params : { 'device': deviceName }
        };

        return this.api.req(_rest, _rpc);
    }

    render() {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Device
          </div>

          <div class="label grid__col grid__col--2-of-8">
            Key
          </div>
          <div id="remoteControlKeyPressed" class="text grid__col grid__col--6-of-8">
            -
          </div>

          <div class="label grid__col grid__col--2-of-8">
            Remotes
          </div>
          <div id="remotesList" class="text grid__col grid__col--6-of-8"></div>

          <div id="pairingDiv"></div>

          <div class="label grid__col grid__col--2-of-8">
            <label for="autofwd">Auto forward keys</label>
          </div>
          <div class="grid__col grid__col--6-of-8 " id="autofwdDiv">
            <div class="checkbox">
                <input type="checkbox" id="autoFwdCheckbox"></input>
                <label for="autoFwdCheckbox"></label>
            </div>
           </div>`;

        var self = this;

        this.autoFwdCheckboxEl = document.getElementById('autoFwdCheckbox');
        this.autoFwdCheckboxEl.checked = this.automaticallyForwardKeys;
        this.autoFwdCheckboxEl.onclick = this.toggleAutoforwardOfKeys.bind(this);

        this.status().then( remotes => {
            if (remotes === undefined || remotes.devices === undefined)
                return;

            var devices = remotes.devices;
            var remotesDiv = document.getElementById('remotesList');
            var pairingDiv = document.getElementById('pairingDiv');

            for (var i = 0; i < devices.length; i++) {
                var device = devices[i];

                remotesDiv.innerHTML += '' + device;

                if (i < devices.length-1)
                    remotesDiv.innerHTML += ', ';

                if (self.devicesThatSupportPairing.indexOf(device) != -1) {

                    if (pairingDiv.innerHTML === '') {
                        // add the title
                        pairingDiv.innerHTML += `<div class="title grid__col grid__col--8-of-8">
                          Pairing
                        </div>`;
                    }

                    pairingDiv.innerHTML += `<div class="label grid__col grid__col--2-of-8">${device}</div>
                        <div class="text grid__col grid__col--6-of-8">
                            <button type="button" id="${device}-PairingMode">Enable Pairing</button>
                        </div>`;

                    var pairingButton = document.getElementById(device + '-PairingMode');
                    pairingButton.onclick = self.activatePairing.bind(self, device);
                }
            }
        });
    }


    toggleAutoforwardOfKeys() {
        this.automaticallyForwardKeys = this.automaticallyForwardKeys === true ? false : true;
        window.localStorage.setItem('autoFwdKeys', this.automaticallyForwardKeys);
    }
}

function name() {
    return  'RemoteControl';
}

export { name };
export default RemoteControl;
