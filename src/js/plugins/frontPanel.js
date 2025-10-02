import Plugin from '../core/plugin.js';
class FrontPanel extends Plugin {
    constructor(pluginData, api) {
        super(pluginData, api);
        this.displayName = 'Front Panel';
      }  
      render() {
        var mainDiv = document.getElementById('main');
        mainDiv.innerHTML = `
          <div class="title grid__col grid__col--8-of-8">
          Brightness
          </div>
          <div class="label grid__col grid__col--2-of-8">
         Index
          </div>
          <div class="text grid__col grid__col--4-of-8">
          <input type="string" id="index" placeholder="Enter index name of front panel indicator">
          </div>
          <div class="text grid__col grid__col--2-of-8">
           <button id="get_brightnessBtn" type="button">Get Brightness</button>
          </div>
          <div class="label grid__col grid__col--4-of-8">
           brightness value
          </div>
          <div id="briness_value" class="text grid__col grid__col--4-of-8">
          -
          </div>
          <div class="label grid__col grid__col--2-of-8">
          Brightness
           </div>
           <div class="text grid__col grid__col--6-of-8">
           <input type="number" id="briness_input" min="0" max="100" placeholder="Enter Brightness value to be set">
           </div>
           <div class="label grid__col grid__col--2-of-8">
          Index value
           </div>
           <div class="text grid__col grid__col--6-of-8">
           <input type="string" id="index_input" placeholder="Enter Index (optional)">
           </div>
           <div class="text grid__col grid__col--6-of-8">
           <button id="set_brightnessBtn" type="button">Set Brightness</button>
          </div>
          <div class="title grid__col grid__col--8-of-8">
          Clock brightness
          </div>
          <div class="text grid__col grid__col--8-of-8">
           <button id="get_clockBrightnessBtn" type="button">Get Clock brightness</button>
          </div>
          <div class="label grid__col grid__col--4-of-8">
         clock brightness value
         </div>
         <div id="clockBriness_value" class="text grid__col grid__col--4-of-8">
         -
         </div>
         <div class="label grid__col grid__col--2-of-8">
         clock Brightness
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="number" id="clockBriness_input" min="0" max="100" placeholder="Enter clock Brightness value to be set">
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <button id="set_clockBrightnessBtn" type="button">Set clock Brightness</button>
         </div>
         <div class="title grid__col grid__col--8-of-8">
          Preferences
          </div>
          <div class="text grid__col grid__col--8-of-8">
          <button id="get_preferencesBtn" type="button">Get preferences</button>
         </div>
         <div class="label grid__col grid__col--4-of-8">
       Preferences
        </div>
        <div id="preferences_value" class="text grid__col grid__col--4-of-8">
        -
        </div> 
        <div class="label grid__col grid__col--2-of-8">
         Preference value
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="string" id="preference_input" placeholder="Enter preference value to be set">
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <button id="set_preferencesBtn" type="button">Set preferences</button>
         </div>
         <div class="label grid__col grid__col--4-of-8">
         is 24 hour clock
         </div>
         <div id="is24HourClock" class="text grid__col grid__col--4-of-8">
         -
         </div>
         <div class="label grid__col grid__col--2-of-8">
         set 24 hour clock(true/false)
          </div>
         <div class="text grid__col grid__col--4-of-8">
          <input type="string" id="24hrClock_input" placeholder="Enter true/false">
          </div>
         <div class="text grid__col grid__col--2-of-8">
          <button id="set_24HourClock" type="button">Set 24 clock</button>
         </div>
         <div class="title grid__col grid__col--8-of-8">
         Front panel lights info
          </div>
          <div class="label grid__col grid__col--2-of-8">
         Supported lights
           </div>
           <div id="supportedLightsInfo" class="text grid__col grid__col--6-of-8">
           -
             </div> 
             <div class="label grid__col grid__col--2-of-8">
         range
           </div>
           <div id="supportedLightsRange" class="text grid__col grid__col--6-of-8">
           -
             </div> 
             <div class="label grid__col grid__col--2-of-8">
             Min:
               </div>
               <div id="supportedLightsMin" class="text grid__col grid__col--6-of-8">
               -
             </div>
             <div class="label grid__col grid__col--2-of-8">
             Max:
               </div>
               <div id="supportedLightsMax" class="text grid__col grid__col--6-of-8">
               -
             </div>
             <div class="label grid__col grid__col--2-of-8">
             Step:
               </div>
               <div id="supportedLightsStep" class="text grid__col grid__col--6-of-8">
               -
             </div> 
             <div class="label grid__col grid__col--2-of-8">
             colorMode:
               </div>
               <div id="supportedLightscolorMode" class="text grid__col grid__col--6-of-8">
               -
             </div> 
             <div class="title grid__col grid__col--8-of-8">
        Clock test pattern
          </div>
          <div class="label grid__col grid__col--2-of-8">
         show
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="string" id="showClk_input" placeholder="Enter show value to be set">
          </div>
          <div class="label grid__col grid__col--2-of-8">
          Time Interval
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="number" id="timeInt_input" placeholder="Enter time interval value to be set">
          </div>
          <div class="text grid__col grid__col--2-of-8">
          <button id="set_ClockTestBtn" type="button">Set ClockTest Pattern</button>
         </div>
         <div class="title grid__col grid__col--8-of-8">
        LED
          </div>
          <div class="label grid__col grid__col--2-of-8">
          ledIndicator
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="string" id="ledIndicator_input" placeholder="Enter LED Indicator value to be set">
          </div>
          <div class="label grid__col grid__col--2-of-8">
         brightness
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="number" min="0" max="100" id="LEDbrightness_input" placeholder="Enter brightness value to be set">
          </div>
          <div class="label grid__col grid__col--2-of-8">
          color
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="string" id="ledcolor_input" placeholder="Enter LED color value to be set">
          </div>
          <div class="label grid__col grid__col--2-of-8">
         Red
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="number" id="LEDRed_input" placeholder="Enter Red value to be set">
          </div>
          <div class="label grid__col grid__col--2-of-8">
         Green
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="number" id="LEDGreen_input" placeholder="Enter Green value to be set">
          </div>
          <div class="label grid__col grid__col--2-of-8">
         Blue
          </div>
          <div class="text grid__col grid__col--6-of-8">
          <input type="number" id="LEDBlue_input" placeholder="Enter Blue value to be set">
          </div>
          <div class="text grid__col grid__col--2-of-8">
          <button id="set_LEDBtn" type="button">Set LED</button>
         </div>
         <div class="title grid__col grid__col--8-of-8">
        power LED On
          </div>
          <div class="label grid__col grid__col--2-of-8">
          Index
           </div>
           <div class="text grid__col grid__col--6-of-8">
           <input type="string" id="powerOnIndex_input" placeholder="Enter Index value power on">
           </div> 
           <div class="text grid__col grid__col--2-of-8">
          <button id="powerLEDOnBtn" type="button">Set LED</button>
         </div>
         <div class="title grid__col grid__col--8-of-8">
         power LED Off
           </div>
           <div class="label grid__col grid__col--2-of-8">
           Index
            </div>
            <div class="text grid__col grid__col--6-of-8">
            <input type="string" id="powerOffIndex_input" placeholder="Enter Index value power off">
            </div> 
            <div class="text grid__col grid__col--2-of-8">
           <button id="powerLEDOffBtn" type="button">Set LED</button>
          </div>
          `;
      //values to get brightness
      this.indexValue=document.getElementById('index');
      this.get_brightness = document.getElementById('get_brightnessBtn');
      this.briness_value=document.getElementById('briness_value');
      this.get_brightness.onclick = this.getBrightness.bind(this);
      //values to set brightness
      this.set_brightness = document.getElementById('set_brightnessBtn');
      this.briness_input=document.getElementById('briness_input');
      this.index_input=document.getElementById('index_input');
      this.set_brightness.onclick = this.setBrightness.bind(this);
      //values to get clock brightness
      this.get_clockBrightness = document.getElementById('get_clockBrightnessBtn');
      this.clockBriness_value=document.getElementById('clockBriness_value');
      this.get_clockBrightness.onclick = this.getClockBrightness().bind(this);
      //values to set clock brightness
      this.clockBriness_input=document.getElementById('clockBriness_input');
      this.set_clockBrightness = document.getElementById('set_clockBrightnessBtn');
      this.set_clockBrightness.onclick = this.setClockBrightness().bind(this);
      //values to get preferences
      this.preferences_value=document.getElementById('preferences_value');
      this.get_preferences = document.getElementById('get_preferencesBtn');
      this.get_preferences.onclick = this.getPreferences().bind(this);
      //values to set preferences
      this.preference_input=document.getElementById('preference_input');
      this.set_preferences = document.getElementById('set_preferencesBtn');
      this.set_preferences.onclick = this.setPreferences().bind(this);
      //is24HourClock
      this.is24HourClock=document.getElementById('is24HourClock')
      this.set_24HourClockBtn=document.getElementById('set_24HourClock')
      this.set_24HourClockBtn.onclick = this.set24HourClock().bind(this);
      this.set24Hrclock_input=document.getElementById('24hrClock_input');
      //frontpanellightsinfo
      this.supportedLightsInfo=document.getElementById('supportedLightsInfo');
      this.supportedLightsRange=document.getElementById('supportedLightsRange');
      this.supportedLightsMin=document.getElementById('supportedLightsMin');
      this.supportedLightsMax=document.getElementById('supportedLightsMax');
      this.supportedLightsStep=document.getElementById('supportedLightsStep');
      this.supportedLightscolorMode=document.getElementById('supportedLightscolorMode');
      //clockTestPattern
      this.showValueClock=document.getElementById('showClk_input')
      this.timeIntervalClock=document.getElementById('timeInt_input')
      this.setClockTestPatnBtn=document.getElementById('set_ClockTestBtn')
      this.setClockTestPatnBtn.onclick = this.setClockTestPatn().bind(this);
      //LED
      this.ledIndicator=document.getElementById('ledIndicator_input')
      this.LEDBrightness=document.getElementById('LEDbrightness_input')
      this.LEDColor=document.getElementById('ledcolor_input')
      this.LEDRed=document.getElementById('LEDRed_input')
      this.LEDGreen=document.getElementById('LEDGreen_input')
      this.LEDBlue=document.getElementById('LEDBlue_input')
      this.setLEDBtn=document.getElementById('set_LEDBtn')
      this.setLEDBtn.onclick=this.setLED().bind(this);
      //powerLEDOn
      this.powerOnIndex=document.getElementById('powerOnIndex_input')
      this.powerLEDOnBtn=document.getElementById('powerLEDOnBtn')
      this.powerLEDOnBtn.onclick=this.powerOnLED().bind(this);
      //powerLEDOff
      this.powerOffIndex=document.getElementById('powerOffIndex_input')
      this.powerLEDOffBtn=document.getElementById('powerLEDOffBtn')
      this.powerLEDOffBtn.onclick=this.powerOffLED().bind(this);
        }
        getBrightness(){
            let indexPossibleVal=["data_led","record_led","power_led"]
            this.briness_value.innerHTML = '-';  
            if (this.indexValue.value == '') {
                alert('Please provide index name of front panel indicator');
              }else{
                if(indexPossibleVal.includes(this.indexValue.value)){
                    this.getBrightnessValue(this.indexValue.value).then(response => {
                        if(response.success){
                            this.briness_value.innerHTML=  response.brightness
                        }
                    });
              }else{
                alert(' Index name possible values are data_led, record_led, power_led');
              }
            } 
        }
        getBrightnessValue(indexVal){
            const _rest = {
                method: 'GET',
                path: `${this.callsign}`,
              };
          
              const _rpc = {
                plugin: this.callsign,
                method: 'getBrightness',
                params: {
                    index: indexVal,
                 
                },
              };
          
              return this.api.req(_rest, _rpc);
        }
        setBrightness(){
             
            if (this.briness_input.value == '') {
                alert('Please provide brightness');
              }else{
                this.setBrightnessValue(this.briness_input.value,this.index_input.value).then(response => {
                        if(response.success){
                           alert("brightness set successfully")
                        }else{
                            alert("Error in setting brightness") 
                        }
                    });
            
            } 
        }
        setBrightnessValue(briInput,indexInput){
            const _rest = {
                method: 'GET',
                path: `${this.callsign}`,
              };
          
              const _rpc = {
                plugin: this.callsign,
                method: 'setBrightness',
                params: {
                    brightness: briInput,
                    index: indexInput
                 
                },
              };
          
              return this.api.req(_rest, _rpc);
        }
        getClockBrightness(){
          this.clockBriness_value.innerHTML = '-';  
          this.getClockBrightnessValue().then(response => {
                      if(response.success){
                          this.clockBriness_value.innerHTML=  response.brightness
                      }
                  });
           
          
      }
      getClockBrightnessValue(){
        const _rest = {
            method: 'GET',
            path: `${this.callsign}`,
          };
      
          const _rpc = {
            plugin: this.callsign,
            method: 'getClockBrightness',
            
          };
      
          return this.api.req(_rest, _rpc);
    }
    setClockBrightness(){
             
      if (this.clockBriness_input.value == '') {
          alert('Please provide clock brightness');
        }else{
          this.setClockBrightnessValue(this.clockBriness_input.value).then(response => {
                  if(response.success){
                     alert("Clock brightness set successfully")
                  }else{
                      alert("Error in setting clock brightness") 
                  }
              });
      
      } 
  }
  setClockBrightnessValue(clockBrightness){
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setClockBrightness',
      params: {
        brightness: clockBrightness
      },
    };

    return this.api.req(_rest, _rpc);
  } 
  getPreferences(){
    this.preferences_value.innerHTML = '-';  
          this.getPreferncesValue().then(response => {
                      if(response.success){
                          this.preferences_value.innerHTML=  response.preferences
                      }
                  });
  }
  getPreferncesValue(){
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getPreferences',
      
    };

    return this.api.req(_rest, _rpc);
  }
  setPreferences(){
    if (this.preference_input.value == '') {
      alert('Please provide preference value');
    }else{
      this.setPreferencesValue(this.preference_input.value).then(response => {
              if(response.success){
                 alert("preferences set successfully")
              }else{
                  alert("Error in setting preferences") 
              }
          });
  
  } 
  }
  setPreferencesValue(preference){
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setPreferences',
      params: {
        preferences: preference
      },
    };

    return this.api.req(_rest, _rpc);
  }
  is24HourClock(){
    const _rest = {
      method  : 'GET',
      path    : `${this.callsign}`,
  };

  const _rpc = {
      plugin : this.callsign,
      method : 'is24HourClock'
  };

  return this.api.req(_rest, _rpc);
  }
  update() {
    this.is24HourClock.innerHTML="-"
    this.is24HourClock().then( res => {
      if(res.success){
        this.is24HourClock.innerHTML=res.is24Hour
      }
      
    })
    this.supportedLightsInfo.innerHTML="-"
    this.supportedLightsRange.innerHTML="-"
    this.supportedLightsMin.innerHTML="-"
    this.supportedLightsMax.innerHTML="-"
    this.supportedLightsStep.innerHTML="-"
    this.supportedLightscolorMode.innerHTML="-"
    
    this.getFrontPanelLightsInfo().then(result=>{
    if(result.success){
      this.supportedLightsInfo.innerHTML=result.supportedLights.toString();
      this.supportedLightsRange.innerHTML=result.supportedLightsInfo.power_led.range;
      this.supportedLightsMin.innerHTML=result.supportedLightsInfo.power_led.min;
      this.supportedLightsMax.innerHTML=result.supportedLightsInfo.power_led.max;
      this.supportedLightsStep.innerHTML=result.supportedLightsInfo.power_led.step
      this.supportedLightscolorMode.innerHTML=result.supportedLightsInfo.power_led.colorMode
      }
    })
  }
  set24HourClock(){
    if (this.set24Hrclock_input.value == '') {
      alert('Please provide input');
    }else{
      this.set24HourClockValue(this.set24Hrclock_input.value).then(response => {
              if(response.success){
                 alert("24/12 Hour clock set successfully")
              }else{
                  alert("Error in setting 24/12 Hour clock") 
              }
          });
  
  } 
  }

  set24HourClockValue(clockInput){
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'set24HourClock',
      params: {
        is24Hour: clockInput
      },
    };

    return this.api.req(_rest, _rpc);
  }
  getFrontPanelLightsInfo(){
    const _rest = {
      method  : 'GET',
      path    : `${this.callsign}`,
  };

  const _rpc = {
      plugin : this.callsign,
      method : 'getFrontPanelLights'
  };

  return this.api.req(_rest, _rpc);
  }
  setClockTestPatn(){
    if (this.showValueClock.value == '') {
      alert('Please provide show value');
    }else if(this.timeIntervalClock.value == ''){
      alert('Please provide time interval value');
    }else{
      this.setClockTestPattern(this.showValueClock.value,this.timeIntervalClock.value).then(response => {
              if(response.success){
                 alert("clock test pattern set successfully")
              }else{
                  alert("Error in setting clock test pattern ") 
              }
          });
  
  } 

  }
  setClockTestPattern(showValue,timeIntervalVal){
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setClockTestPattern',
      params: {
        show: showValue,
        timeInterval: timeIntervalVal
      },
    };

    return this.api.req(_rest, _rpc);
  }
  setLED(){
    if (this.ledIndicator.value == '') {
      alert('Please provide LED Indicator Value');
    }else if(this.LEDBrightness.value == ''){
      alert('Please provide LED Brightness value');
    }else{
      this.setLEDValues(this.ledIndicator.value,this.LEDBrightness.value,this.LEDColor.value,this,this.LEDRed.value,this.LEDGreen.value,this,this.LEDBlue.value).then(response => {
              if(response.success){
                 alert("LED Values set successfully")
              }else{
                  alert("Error in setting LED Values ") 
              }
          });
  
  } 

  }
  setLEDValues(LED_Indicator,LED_Brightness,LED_Color,LED_Red,LED_Green,LED_Blue){
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setLED',
      params: {
        ledIndicator: LED_Indicator,
        brightness: LED_Brightness,
        color: LED_Color,
        red: LED_Red,
        green: LED_Green,
        blue: LED_Blue
      },
    };

    return this.api.req(_rest, _rpc);

  }
  powerOnLED(){
    if (this.powerOnIndex.value == '') {
      alert('Please provideIndex Value');
    }else{
      this.LEDPowerOn(this.powerOnIndex.value).then(response => {
              if(response.success){
                 alert("LED power on successfully")
              }else{
                  alert("Error in switching on power LED ") 
              }
          });
  
  } 
  }
  LEDPowerOn(IndexVal){
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'powerLedOn',
      params: {
        index: IndexVal
      },
    };

    return this.api.req(_rest, _rpc);
  }
  powerOffLED(){
    if (this.powerOffIndex.value == '') {
      alert('Please provide Index Value');
    }else{
      this.LEDPowerOff(this.powerOffIndex.value).then(response => {
              if(response.success){
                 alert("LED power off successfully")
              }else{
                  alert("Error in switching off power LED ") 
              }
          });
  
  } 
  }
  LEDPowerOff(IndexVal){
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'powerLedOff',
      params: {
        index: IndexVal
      },
    };

    return this.api.req(_rest, _rpc);
  }
}

export default FrontPanel;