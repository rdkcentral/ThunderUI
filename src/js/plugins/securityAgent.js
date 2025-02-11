import Plugin from '../core/plugin.js';

class SecurityAgent extends Plugin {
    constructor(pluginData, api) {
        super(pluginData, api);
        this.displayName = 'Security Agent';
      }
      render() {
      var mainDiv = document.getElementById('main');
      mainDiv.innerHTML = `
        <div class="title grid__col grid__col--8-of-8">
        Create Token
        </div>
        <div class="text grid__col grid__col--2-of-8">
       URL
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input type="string" id="URL" placeholder="Enter URL">
        </div>
        
        <div class="text grid__col grid__col--2-of-8">
       USER
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input type="string" id="User" placeholder="Enter User">
        </div>
        <div class="text grid__col grid__col--2-of-8">
       Hash
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input type="string" id="Hash" placeholder="Enter Hash">
        </div>
        <div class="text grid__col grid__col--6-of-8">
         <button id="create_token" type="button">create</button>
        </div>
        <div class="text grid__col grid__col--4-of-8">
        Token
        </div>
        <div id="value" class="text grid__col grid__col--4-of-8">
        -
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Validate Token
        </div>
        <div class="text grid__col grid__col--2-of-8">
       Token
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input type="string" id="token" placeholder="Enter Token">
        </div>
        <div class="text grid__col grid__col--6-of-8">
         <button id="validate_token" type="button">Validate</button>
        </div>

        `;
    this.URLValue=document.getElementById('URL');
    this.User=document.getElementById('User');
    this.Hash=document.getElementById('Hash');
    this.create_token = document.getElementById('create_token');
    this.create_token.onclick = this.createToken.bind(this);
    this.value = document.getElementById('value');
    this.token=document.getElementById('token');
    this.validate_token = document.getElementById('validate_token');
    this.validate_token.onclick = this.validateToken.bind(this);
      }
      createToken() {
        console.log("create token")
        console.log("URL:::::",this.URLValue.value)
        console.log("user name ::::",this.User.value)
        console.log("hash ::::",this.Hash.value)
        this.value.innerHTML = '-';
        if (this.URLValue.value == '') {
          alert('Please provide URL');
        }else if(this.User.value == ''){
            alert('Please provide user name');
        }else if(this.Hash.value == ''){
            alert('Please provide random hash');
        } else {
          this.getTokenValue(this.URLValue.value,this.User.value,this.Hash.value).then(response => {
            this.value.innerHTML = response.token;
          });
        }
      }
      getTokenValue(URL,User,Hash) {
        const _rest = {
          method: 'GET',
          path: `${this.callsign}`,
        };
    
        const _rpc = {
          plugin: this.callsign,
          method: 'createtoken',
          params: {
            url: URL,
            user:User,
            hash:Hash
          },
        };
    
        return this.api.req(_rest, _rpc);
      }
      validateToken(){
        if (this.token.value == '') {
            alert('Please provide token');
          }else{
                this.validate(this.token.value).then(response => {
                
                     if(response.valid===true){
                        alert("token validated successfully")
                     }else{
                        alert("validation unsuccessfull")
                     }
                 });
                }

      }
      validate(token){
        const _rest = {
            method: 'GET',
            path: `${this.callsign}`,
          };
      
          const _rpc = {
            plugin: this.callsign,
            method: 'validate',
            params: {
              token:token
            },
          };
      
          return this.api.req(_rest, _rpc);

      }
}
export default SecurityAgent;