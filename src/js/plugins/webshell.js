/** The webshell plugin provides a shell that can be managed through the webui
 */

class WebShell extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.webShellSocket = undefined;
    }

    render()        {
        var self = this;
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div id="shellHeader">WebShell</div>
        <div id="shell">
            <pre id="webShellData" class="text"></pre>
        </div>
        <div id="hashtag">#</div><input type="text" id="webShellInput" autofocus />`;

        // start the webshell
        api.startWebShell(function (error, ws) {
            self.webShellSocket = ws;
            self.webShellSocket.onmessage = function(e){
                var fileReader = new FileReader();
                fileReader.onload = function() {
                    document.getElementById('webShellData').innerHTML = String.fromCharCode.apply(null, new Uint8Array(fileReader.result));
                };
                fileReader.readAsArrayBuffer(e.data);
            };
            self.webShellSocket.onclose = function(){
                self.webShellSocket = null;
                self.render();
            };
        });

        // disable remote key listener (if active)
        if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = true;

        // bind key listener
        window.addEventListener('keydown', this.handleKey.bind(this));
    }

    close() { 
        if (plugins.RemoteControl !== undefined)
                plugins.RemoteControl.doNotHandleKeys = false;        
        window.removeEventListener('keydown', this.handleKey.bind(this), false);
    }

    handleKey(e) {
        if (this.webShellSocket && e.which === 13) {
            var str = document.getElementById('webShellInput').value + ' \n';
            var buf = new ArrayBuffer(str.length*2);
            var bufView = new Uint8Array(buf);
            for (var i=0, strLen=str.length; i<strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }

            document.getElementById('webShellInput').value = '';
            this.webShellSocket.send(buf);
        }

        setTimeout(function() {
            var shell = document.getElementById("shell");
            var webShellData = document.getElementById("webShellData");

            shell.scrollTop = webShellData.scrollHeight;
        }, 50);        
    }

}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.WebShell = WebShell;
