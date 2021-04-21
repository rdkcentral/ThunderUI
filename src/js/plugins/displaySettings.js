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
/** The DisplaySetting plugin is used to get the display information like currentVideoResolution, SupportedVideoDisplays, ZoomSetting, SoundMode, ConnectedVideoDisplays etc. */

import Plugin from '../core/plugin.js';

class DisplaySettings extends Plugin {
  constructor(pluginData, api) {
    super(pluginData, api);
    this.displayName = 'Display Settings';
  }

  render() {
    var mainDiv = document.getElementById('main');

    mainDiv.innerHTML = `
        <div class="title grid__col grid__col--8-of-8">
        Resolution
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Supported Resolutions
        </div>
        <div class="label grid__col grid__col--2-of-8">
        VideoDisplay
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="video_display_resolution">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Supported Resolutions
        </div>
        <div id="supported_resolutions" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Supported Tv Resolutions
        </div>
        <div id="supported_tv_resolutions" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="text grid__col grid__col--8-of-8">
        Current Resolution
        </div>
        <div class="label grid__col grid__col--2-of-8">
        VideoDisplay
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="video_display_current">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Resolution
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="resolution">
        </select>
        </div>
        <div class="text grid__col grid__col--8-of-8">
        <button type="button" id="set_resolution" >Set</button>
        <div id = 'notification_resolution' class="text grid__col grid__col--6-of-8">
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Supported STB Resolutions
        </div>
        <div id="supported_stb_resolutions" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Default Resolution
        </div>
        <div id="default_resolution" class="text grid__col grid__col--6-of-8">
        -
        </div>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Audio Ports
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Connected Audio Ports
        </div>
        <div id="connected_audio_ports" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Supported Audio Ports
        </div>
        <div id="supported_audio_ports" class="text grid__col grid__col--6-of-8">
        -
        </div>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Video Display
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Connected Video Displays
        </div>
        <div id="connected_video_displays" class="text grid__col grid__col--6-of-8">
          -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Supported Video Displays
        </div>
        <div id="supported_video_displays" class="text grid__col grid__col--6-of-8">
          -
        </div>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        EDID
        </div>
        <div class="label grid__col grid__col--2-of-8">
        EDID from HDMI device
        </div>
        <div id='edid_hdmi' class="label grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        EDID Host
        </div>
        <div id='edid_host' class="label grid__col grid__col--6-of-8">
        -
        </div>
        <div class="title grid__col grid__col--8-of-8">
        HDR Support
        </div>
        <div class="label grid__col grid__col--2-of-8">
        HDR support standards for TV
        </div>
        <div id="hdr_tv" class="text grid__col grid__col--6-of-8">
        -
        </div>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        HDR support standards for STB
        </div>
        <div id="hdr_stb" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        TV HDR Capabilities
        </div>
        <div id="hdr_tv_capabilities" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="title grid__col grid__col--8-of-8">
        HDCP Repeater
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Is HDCP Repeater
        </div>
        <div id='repeater' class="label grid__col grid__col--6-of-8">
        -
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Output Setting
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Color Space
        </div>
        <div id="color_space" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Color Depth
        </div>
        <div id="color_depth" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Matrix coefficients
        </div>
        <div id="matrix_coefficients" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Video EOTF
        </div>
        <div id="video_EOTF" class="text grid__col grid__col--6-of-8">
        -
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Audio Modes
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="select_audio_port">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Supported Audio Modes
        </div>
        <div id="supported_audio_modes" class="text grid__col grid__col--6-of-8">
          -
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Active Input
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Video Display
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="select_video_display">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Active/Inactive
        </div>
        <div id="active_inactive" class="text grid__col grid__col--6-of-8">
          -
        </div>
        </div>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Zoom Setting
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Zoom Setting
        </div>
        <div id = 'notification_zoom' class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="select_zoom_setting">
        </select>
        <button id="zoom_set" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        AudioCompression
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Compresion Level
        </div>
        <div id = 'notification_compression' class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="select_MS12_audio_compression" type='number'>
        </select>
        <button type="button" id="set_compression" >Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Dialog Enhancement
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Enhancer level
        </div>
        <div id = 'notification_enhancement' class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="select_enhancer">
        </select>
        <button id="set_enhancer" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Intelligent Equalizer
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Equalizer mode
        </div>
        <div id = 'notification_equalizer' class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="select_mode">
        </select>
        <button id="set_mode" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Sound Mode
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audio_port">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Sound Mode
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="sound_mode">
        </select>
        </div>
        <div id = 'notification_soundMode' class="text grid__col grid__col--6-of-8">
        <button type="button" id="set_sound_mode" >Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Volume Leveller
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_leveller">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Level
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="leveller">
        </select>
        </div>
        <div id = 'notification_volumeLeveller' class="text grid__col grid__col--6-of-8">
        <button id="set_leveller" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Volume Level
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_level">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Volume Level (0-100)
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="level" type="number" placeholder='Value between 0 and 100'>
        </div>
        <div id = 'notification_volumeLevel' class="text grid__col grid__col--6-of-8">
        <button id="set_level" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Bass Enhancer
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_bass">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Bass boost
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="bass">
        </select>
        </div>
        <div id = 'notification_bassEnhancer' class="text grid__col grid__col--6-of-8">
        <button id="set_bass" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Surround Virtualizer
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_boost">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Boost
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="boost">
        </select>
        </div>
        <div id = 'notification_virtualizer' class="text grid__col grid__col--6-of-8">
        <button id="set_boost" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        DRC Mode
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_drc">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Mode
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="drc">
        </select>
        </div>
        <div id = 'notification_drc' class="text grid__col grid__col--6-of-8">
        <button id="set_drc" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Gain
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_gain">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Gain (0-100)
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="gain" type="string" placeholder='Value between 0 and 100'>
        </div>
        <div id = 'notification_gain' class="text grid__col grid__col--6-of-8">
        <button id="set_gain" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Scart
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Scart Parameter
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="scart_param">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Scart Parameter Data
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="scart_data">
        </select>
        </div>
        <div id = 'notification_scart' class="text grid__col grid__col--6-of-8">
        <button id="set_scart" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Audio Delay
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_delay">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Delay(in ms)
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="delay" type="string">
        </div>
        <div id = 'notification_delay' class="text grid__col grid__col--6-of-8">
        <button id="set_delay" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Audio Delay Offset
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_delayOffset">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Delay Offset(in ms)
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <input id="delayOffset" type="string">
        </div>
        <div id = 'notification_delayOffset' class="text grid__col grid__col--6-of-8">
        <button id="set_delayOffset" type="button">Set</button>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Video port Stand by
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Port name
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="select_port_standby">
        </select>
        </div>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Standby Mode
        </div>
        <div id = 'notification_standby' class="text grid__col grid__col--6-of-8">
        <div class="checkbox">
        <input type="checkbox" id="standby_mode"></input>
        <label for="standby_mode"></label>
        </div>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        MI Steering
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_steering">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        MI Steering Enable
        </div>
        <div id = 'notification_miEnable' class="text grid__col grid__col--6-of-8">
        <div class="checkbox">
        <input type="checkbox" id="mi_enable"></input>
        <label for="mi_enable"></label>
        </div>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Surround Decoder
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_surroundDecoder">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Enable/Disable
        </div>
        <div id = 'notification_surroundDecoder' class="text grid__col grid__col--6-of-8">
        <div class="checkbox">
        <input type="checkbox" id="surroundDecoder_enable"></input>
        <label for="surroundDecoder_enable"></label>
        </div>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Mute
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio Port
        </div>
        <div class="text grid__col grid__col--6-of-8">
        <select class="grid__col--5-of-8" id="audioPort_muted">
        </select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Muted
        </div>
        <div id = 'notification_mute' class="text grid__col grid__col--6-of-8">
        <div class="checkbox">
        <input type="checkbox" id="muted_enable"></input>
        <label for="muted_enable"></label>
        </div>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Atmos
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Sink Atmos capability
        </div>
        <div id='sink_atmos' class="label grid__col grid__col--6-of-8">
        -
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Audio atmos Output mode
        </div>
        <div id = 'notification_atmos' class="text grid__col grid__col--6-of-8">
        <div class="checkbox">
        <input type="checkbox" id="atmos_mode"></input>
        <label for="atmos_mode"></label>
        </div>
        </div>
        <div class="title grid__col grid__col--8-of-8">
        Dolby Mode
        </div>
        <div class="label grid__col grid__col--2-of-8">
        Dolby Mode
        </div>
        <div id = 'notification_dolby' class="text grid__col grid__col--6-of-8">
        <div class="checkbox">
        <input type="checkbox" id="dolby_mode"></input>
        <label for="dolby_mode"></label>
        </div>
        </div>
            `;

    this.supported_resolutions = document.getElementById('supported_resolutions');
    this.supported_tv_resolutions = document.getElementById('supported_tv_resolutions');
    this.supported_stb_resolutions = document.getElementById('supported_stb_resolutions');
    this.default_resolution = document.getElementById('default_resolution');
    this.video_display_resolution = document.getElementById('video_display_resolution');
    this.video_display_resolution.onchange = this.updateDisplayResolution.bind(this);
    this.video_display_current = document.getElementById('video_display_current');
    this.resolution = document.getElementById('resolution');
    this.setResolution = document.getElementById('set_resolution');
    this.setResolution.onclick = this.updateResolution.bind(this);
    this.connected_audio_ports = document.getElementById('connected_audio_ports');
    this.supported_audio_ports = document.getElementById('supported_audio_ports');
    this.edid_hdmi = document.getElementById('edid_hdmi');
    this.edid_host = document.getElementById('edid_host');
    this.standby_mode = document.getElementById('standby_mode');
    this.standby_mode.onclick = this.updateStandBy.bind(this);
    this.dolby_mode = document.getElementById('dolby_mode');
    this.dolby_mode.onclick = this.updateDolbyMode.bind(this);
    this.select_port_standby = document.getElementById('select_port_standby');
    this.hdr_tv = document.getElementById('hdr_tv');
    this.hdr_stb = document.getElementById('hdr_stb');
    this.hdr_tv_capabilities = document.getElementById('hdr_tv_capabilities');
    this.color_space = document.getElementById('color_space');
    this.color_depth = document.getElementById('color_depth');
    this.matrix_coefficients = document.getElementById('matrix_coefficients');
    this.video_EOTF = document.getElementById('video_EOTF');
    this.select_audio_port = document.getElementById('select_audio_port');
    this.supported_audio_modes = document.getElementById('supported_audio_modes');
    this.select_audio_port.onchange = this.updateAudioMode.bind(this);
    this.connected_video_display = document.getElementById('connected_video_displays');
    this.supported_video_displays = document.getElementById('supported_video_displays');
    this.active_inactive = document.getElementById('active_inactive');
    this.select_zoom_setting = document.getElementById('select_zoom_setting');
    this.zoom_set = document.getElementById('zoom_set');
    this.zoom_set.onclick = this.updateZoomSetting.bind(this);
    this.sound_mode = document.getElementById('sound_mode');
    this.set_sound_mode = document.getElementById('set_sound_mode');
    this.set_sound_mode.onclick = this.updateSoundMode.bind(this);
    this.select_MS12_audio_compression = document.getElementById('select_MS12_audio_compression');
    this.set_compression = document.getElementById('set_compression');
    this.set_compression.onclick = this.updateAudioCompression.bind(this);
    this.video_display_active = document.getElementById('select_video_display');
    this.video_display_active.onchange = this.updateActiveInput.bind(this);
    this.audio_port = document.getElementById('audio_port');
    this.select_enhancer = document.getElementById('select_enhancer');
    this.set_enhancer = document.getElementById('set_enhancer');
    this.set_enhancer.onclick = this.updateEnhanceLevel.bind(this);
    this.select_mode = document.getElementById('select_mode');
    this.set_mode = document.getElementById('set_mode');
    this.set_mode.onclick = this.updateEqualizerMode.bind(this);
    this.sink_atmos = document.getElementById('sink_atmos');
    this.atmos_mode = document.getElementById('atmos_mode');
    this.atmos_mode.onclick = this.updateAtmosMode.bind(this);
    this.repeater = document.getElementById('repeater');
    this.audioPort_leveller = document.getElementById('audioPort_leveller');
    this.leveller = document.getElementById('leveller');
    this.set_leveller = document.getElementById('set_leveller');
    this.set_leveller.onclick = this.updateAudioLeveller.bind(this);
    this.audioPort_level = document.getElementById('audioPort_level');
    this.level = document.getElementById('level');
    this.set_level = document.getElementById('set_level');
    this.set_level.onclick = this.updateAudioLevel.bind(this);
    this.audioPort_bass = document.getElementById('audioPort_bass');
    this.bass = document.getElementById('bass');
    this.set_bass = document.getElementById('set_bass');
    this.set_bass.onclick = this.updateBassEnhancer.bind(this);
    this.audioPort_boost = document.getElementById('audioPort_boost');
    this.boost = document.getElementById('boost');
    this.set_boost = document.getElementById('set_boost');
    this.set_boost.onclick = this.updateBoostValue.bind(this);
    this.audioPort_steering = document.getElementById('audioPort_steering');
    this.mi_enable = document.getElementById('mi_enable');
    this.mi_enable.onclick = this.updateMISteering.bind(this);
    this.audioPort_surroundDecoder = document.getElementById('audioPort_surroundDecoder');
    this.surroundDecoder_enable = document.getElementById('surroundDecoder_enable');
    this.surroundDecoder_enable.onclick = this.updateSurroundDecoder.bind(this);
    this.audioPort_drc = document.getElementById('audioPort_drc');
    this.drc = document.getElementById('drc');
    this.set_drc = document.getElementById('set_drc');
    this.set_drc.onclick = this.updateDRCMode.bind(this);
    this.audioPort_gain = document.getElementById('audioPort_gain');
    this.gain = document.getElementById('gain');
    this.set_gain = document.getElementById('set_gain');
    this.set_gain.onclick = this.updateGain.bind(this);
    this.scart_param = document.getElementById('scart_param');
    this.scart_data = document.getElementById('scart_data');
    this.scart_param.onclick = this.updateScartData.bind(this);
    this.set_scart = document.getElementById('set_scart');
    this.set_scart.onclick = this.updateScart.bind(this);
    this.audioPort_muted = document.getElementById('audioPort_muted');
    this.muted_enable = document.getElementById('muted_enable');
    this.muted_enable.onclick = this.updateMuted.bind(this);
    this.audioPort_delay = document.getElementById('audioPort_delay');
    this.delay = document.getElementById('delay');
    this.set_delay = document.getElementById('set_delay');
    this.set_delay.onclick = this.updateDelay.bind(this);
    this.audioPort_delayOffset = document.getElementById('audioPort_delayOffset');
    this.delayOffset = document.getElementById('delayOffset');
    this.set_delayOffset = document.getElementById('set_delayOffset');
    this.set_delayOffset.onclick = this.updateDelayOffset.bind(this);
    this.onResolutionChanged = this.api.t.on(
      this.callsign,
      'resolutionChanged',
      this.updateCurrentResolution.bind(this)
    );
    this.onZoomSettingUpdated = this.api.t.on(this.callsign, 'zoomSettingUpdated', this.updateZoomValue.bind(this));
    this.onActiveInputChanged = this.api.t.on(this.callsign, 'activeInputChanged', this.updateActiveInput.bind(this));
    this.onConnectedVideoDisplaysUpdated = this.api.t.on(
      this.callsign,
      'connectedVideoDisplaysUpdated',
      this.updateConnectedDisplay.bind(this)
    );
    this.update();
  }

  updateCurrentResolution() {
    this.resolution.innerHTML = '';
    this.getCurrentResolution(this.video_display_current.value).then(response => {
      if (response != null && response.success) {
        var currentResolution = response.resolution;
        this.resolutionArray = document.createElement('option');
        this.resolutionArray.text = response.resolution;
        this.resolutionArray.value = response.resolution;
        this.resolution.appendChild(this.resolutionArray);
        this.resolutionArrayFiltered = this.totalResolution.filter(x => currentResolution != x);
        for (var i = 0; i < this.resolutionArrayFiltered.length; i++) {
          var option = document.createElement('option');
          option.text = this.resolutionArrayFiltered[i];
          option.value = this.resolutionArrayFiltered[i];
          this.resolution.appendChild(option);
        }
      }
    });
  }

  updateDisplayResolution() {
    this.selectedIndex = this.video_display_resolution.selectedIndex;
    this.getSupportedTvResolutions(this.video_display_resolution[this.selectedIndex].value).then(response => {
      this.supported_tv_resolutions.innerHTML = response.supportedTvResolutions;
    });
    this.getSupportedResolutions(this.video_display_resolution[this.selectedIndex].value).then(response => {
      this.supported_resolutions.innerHTML = response.supportedResolutions;
    });
  }

  updateAudioMode() {
    this.supportedAudioModes(this.select_audio_port.value).then(response => {
      if (response != null && response.supportedAudioModes) {
        this.supported_audio_modes.innerHTML = response.supportedAudioModes;
      } else {
        this.supported_audio_modes.innerHTML = '-';
      }
    });
  }

  updateZoomValue() {
    this.getZoomSetting().then(response => {
      if (response != null && response.success) {
        var supportedZoomSetting = [
          'FULL',
          'NONE',
          'Letterbox 16x9',
          'Letterbox 14x9',
          'CCO',
          'PanScan',
          'Letterbox 2.21 on 4x3',
          'Letterbox 2.21 on 16x9',
          'Platform',
          'Zoom 16x9',
          'Pillarbox 4x3',
          'Widescreen 4x3',
        ];
        this.select_zoom_setting.innerHTML = '';
        var option = document.createElement('option');
        option.text = response.zoomSetting;
        option.value = response.zoomSetting;
        this.select_zoom_setting.appendChild(option);
        this.supportedZoomSettingFiltered = supportedZoomSetting.filter(x => response.zoomSetting != x);
        for (var i = 0; i < this.supportedZoomSettingFiltered.length; i++) {
          var option = document.createElement('option');
          option.text = this.supportedZoomSettingFiltered[i];
          option.value = this.supportedZoomSettingFiltered[i];
          this.select_zoom_setting.appendChild(option);
        }
      }
    });
  }

  showNotification(elem, message) {
    this.set_val = document.createElement('div');
    this.set_val.innerHTML = message;
    document.getElementById(elem).appendChild(this.set_val);
    setTimeout(this.removeNotification, 1000, this.set_val);
  }
  removeNotification(set_val) {
    set_val.parentNode.removeChild(set_val);
  }

  updateZoomSetting() {
    if (this.select_zoom_setting.value != '') {
      this.setZoomSetting(this.select_zoom_setting.value).then(response => {
        if (response != null && response.success) {
          this.updateZoomValue();
          this.showNotification('notification_zoom', 'Successfully set zoom setting');
        } else {
          alert('Failed to set zoom value');
          this.updateZoomValue();
        }
      });
    } else {
      alert('No zoom values are available');
    }
  }

  updateConnectedDisplay() {
    this.getConnectedVideoDisplays().then(response => {
      this.connected_video_display.innerHTML = response.connectedVideoDisplays;
    });
  }

  updateMS12Compression() {
    this.select_MS12_audio_compression.innerHTML = '';
    this.getMS12AudioCompression().then(response => {
      if (response != null && response.success) {
        var option = document.createElement('option');
        option.text = response.compressionlevel;
        option.value = response.compressionlevel;
        this.select_MS12_audio_compression.appendChild(option);
        var supportedCompression = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.supportedCompressionFiltered = supportedCompression.filter(x => response.compressionlevel.toString() != x);
        for (var i = 0; i < this.supportedCompressionFiltered.length; i++) {
          var option = document.createElement('option');
          option.text = this.supportedCompressionFiltered[i];
          option.value = this.supportedCompressionFiltered[i];
          this.select_MS12_audio_compression.appendChild(option);
        }
      }
    });
  }

  updateEnhancerList() {
    this.select_enhancer.innerHTML = '';
    this.getDialogEnhancement().then(response => {
      if (response != null && response.success) {
        var supportedEnhancerLevel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        var option = document.createElement('option');
        option.text = response.enhancerlevel;
        option.value = response.enhancerlevel;
        this.select_enhancer.appendChild(option);
        this.supportedEnhancerLevelFiltered = supportedEnhancerLevel.filter(
          x => response.enhancerlevel.toString() != x
        );
        for (var i = 0; i < this.supportedEnhancerLevelFiltered.length; i++) {
          var option = document.createElement('option');
          option.text = this.supportedEnhancerLevelFiltered[i];
          option.value = this.supportedEnhancerLevelFiltered[i];
          this.select_enhancer.appendChild(option);
        }
      }
    });
  }

  updateDRCList() {
    this.drc.innerHTML = '';
    this.getDRCMode(this.audioPort_drc.value).then(response => {
      if (response != null && response.success) {
        var supportedDRCMode = ['line', 'rf'];
        var option = document.createElement('option');
        option.text = response.DRCMode;
        option.value = response.DRCMode;
        this.drc.appendChild(option);
        this.supportedDRCModeFiltered = supportedDRCMode.filter(x => response.DRCMode != x);
        for (var i = 0; i < this.supportedDRCModeFiltered.length; i++) {
          var option = document.createElement('option');
          option.text = this.supportedDRCModeFiltered[i];
          option.value = this.supportedDRCModeFiltered[i];
          this.drc.appendChild(option);
        }
      }
    });
  }

  updateGainList() {
    this.gain.innerHTML = '';
    this.getGain(this.audioPort_gain.value).then(response => {
      if (response != null && response.success) {
        this.gain.value = response.gain;
      }
    });
  }

  updateScart() {
    this.setScartParameter(this.scart_param.value, this.scart_data.value).then(response => {
      if (response != null && response.success) {
        this.showNotification('notification_scart', 'Successfully set scart value');
      } else {
        alert('Failed to set scart value');
      }
    });
  }

  updateScartData() {
    this.scart_data.innerHTML = '';
    switch (this.scart_param.value) {
      case 'aspect_ratio':
        var aspectRatio = ['4x3', '16x9'];
        for (var j = 0; j < aspectRatio.length; j++) {
          var option = document.createElement('option');
          option.text = aspectRatio[j];
          option.value = aspectRatio[j];
          this.scart_data.appendChild(option);
        }
        break;
      case 'tv_startup':
        var tv_startup = ['on', 'off'];
        for (var j = 0; j < tv_startup.length; j++) {
          var option = document.createElement('option');
          option.text = tv_startup[j];
          option.value = tv_startup[j];
          this.scart_data.appendChild(option);
        }
        break;
      case 'rgb':
        var rgb = ['on'];
        for (var j = 0; j < rgb.length; j++) {
          var option = document.createElement('option');
          option.text = rgb[j];
          option.value = rgb[j];
          this.scart_data.appendChild(option);
        }
        break;
      case 'cvbs':
        var cvbs = ['on'];
        for (var j = 0; j < cvbs.length; j++) {
          var option = document.createElement('option');
          option.text = cvbs[j];
          option.value = cvbs[j];
          this.scart_data.appendChild(option);
        }
        break;
      case 'macrovision':
        var macrovision = ['*'];
        for (var j = 0; j < macrovision.length; j++) {
          var option = document.createElement('option');
          option.text = macrovision[j];
          option.value = macrovision[j];
          this.scart_data.appendChild(option);
        }
        break;
      case 'cgms':
        var cgms = ['disabled', 'copyNever', 'copyOnce', 'copyFreely', 'copyNoMore'];
        for (var j = 0; j < cgms.length; j++) {
          var option = document.createElement('option');
          option.text = cgms[j];
          option.value = cgms[j];
          this.scart_data.appendChild(option);
        }
        break;
      case 'port':
        var port = ['on', 'off'];
        for (var j = 0; j < cgms.length; j++) {
          var option = document.createElement('option');
          option.text = port[j];
          option.value = port[j];
          this.scart_data.appendChild(option);
        }
        break;
    }
  }

  updateEqualizerList() {
    this.select_mode.innerHTML = '';
    this.getIntelligentEqualizerMode().then(response => {
      if (response != null && response.success) {
        var supportedEqualizerMode = [1, 2, 3];
        var option = document.createElement('option');
        option.text = response.mode;
        option.value = response.mode;
        this.select_mode.appendChild(option);
        this.supportedEqualizerModeFiltered = supportedEqualizerMode.filter(x => response.mode.toString() != x);
        for (var i = 0; i < this.supportedEqualizerModeFiltered.length; i++) {
          var option = document.createElement('option');
          option.text = this.supportedEqualizerModeFiltered[i];
          option.value = this.supportedEqualizerModeFiltered[i];
          this.select_mode.appendChild(option);
        }
      }
    });
  }

  updateSoundModeList() {
    this.getSoundMode().then(response => {
      var supported_sound_modes = [
        'mono',
        'stereo',
        'surround',
        'passthru',
        'auto',
        'auto *',
        'AUTO *',
        'dolby digital 5.1',
      ];
      this.sound_mode.innerHTML = '';
      var option = document.createElement('option');
      option.text = response.soundMode;
      option.value = response.soundMode;
      this.sound_mode.appendChild(option);
      this.supportedSoundModeFiltered = supported_sound_modes.filter(x => response.soundMode != x);
      for (var i = 0; i < this.supportedSoundModeFiltered.length; i++) {
        var option = document.createElement('option');
        option.text = this.supportedSoundModeFiltered[i];
        option.value = this.supportedSoundModeFiltered[i];
        this.sound_mode.appendChild(option);
      }
    });
  }

  updateAudioCompression() {
    if (this.select_MS12_audio_compression.value != '') {
      this.setMS12AudioCompression(parseInt(this.select_MS12_audio_compression.value)).then(response => {
        if (response != null && response.success) {
          this.showNotification('notification_compression', 'Successfully set compression');
          this.updateMS12Compression();
        } else {
          alert('Failed to set audio compression');
          this.updateMS12Compression();
        }
      });
    } else {
      alert('No audio compression values are available');
    }
  }
  updateResolution() {
    if (this.video_display_current.value != '' && this.resolution.value != '') {
      this.setCurrentResolution(this.video_display_current.value, this.resolution.value).then(response => {
        if (response != null && response.success) {
          this.showNotification('notification_resolution', 'Successfully set resolution');
        } else {
          alert('Failed to set current resolution');
        }
      });
    } else if (this.video_display_current.value == '') {
      alert('No video displays are available to set the current resolution');
    } else if (this.resolution.value == '') {
      alert('No resolution is supported on the video display port');
    }
  }
  updateSoundMode() {
    if (this.audio_port.value != '' && this.sound_mode.value != '') {
      this.setSoundMode(this.audio_port.value, this.sound_mode.value).then(response => {
        if (response != null && response.success) {
          this.showNotification('notification_soundMode', 'Successfully set sound mode');
          this.updateSoundModeList();
        } else {
          alert('Failed to set sound mode');
          this.updateSoundModeList();
        }
      });
    } else if (this.audio_port.value == '') {
      alert('No audio ports are available to set sound mode');
    } else if (this.sound_mode.value != '') {
      alert('No sound modes are available to set sound mode');
    }
  }
  updateStandBy() {
    if (this.select_port_standby.value != '') {
      this.setVideoPortStatusInStandby(this.select_port_standby.value, this.standby_mode.checked).then(response => {
        if (response.success && response != null) {
          if (this.standby_mode.checked == true) {
            var notifyMsg = 'enabled';
          } else {
            var notifyMsg = 'disabled';
          }
          this.showNotification('notification_standby', 'Successfully ' + notifyMsg + ' standby mode ');
        }
        this.getVideoPortStatusInStandby(this.select_port_standby.value).then(response => {
          this.standby_mode.checked = response.videoPortStatusInStandby;
        });
      });
    } else if (this.select_port_standby.value == '') {
      alert('No audio ports are available to set standby mode');
    }
  }
  updateDolbyMode() {
    try {
      this.setDolbyVolumeMode(this.dolby_mode.checked).then(response => {
        if (response != null && response.success) {
          if (this.dolby_mode.checked == true) {
            var notifyMsg = 'enabled';
          } else {
            var notifyMsg = 'disabled';
          }
          this.showNotification('notification_dolby', 'Successfully ' + notifyMsg + ' dolby mode');
          this.getDolbyVolumeMode().then(response => {
            if (response && response.dolbyVolumeMode != null) {
              this.dolby_mode.checked = response.dolbyVolumeMode;
            }
          });
        } else {
          this.dolby_mode.checked = !this.dolby_mode.checked;
          alert('Failed to set dolby mode');
        }
      });
    } catch (err) {
      alert('Error in setting dolby volume mode');
    }
  }

  updateAtmosMode() {
    try {
      this.setAudioAtmosOutputMode(this.atmos_mode.checked).then(response => {
        var value;
        if (this.atmos_mode.checked) {
          value = true;
        } else {
          value = false;
        }
        if (response != null && response.success) {
          if (this.atmos_mode.checked == true) {
            var notifyMsg = 'enabled';
          } else {
            var notifyMsg = 'disabled';
          }
          this.showNotification('notification_atmos', 'Successfully ' + notifyMsg + ' atmos mode');
          this.atmos_mode.checked = value;
        } else {
          this.atmos_mode.checked = !value;
          alert('Failed to set audio atmos mode');
        }
      });
    } catch (err) {
      alert('Error in setting audio atmos mode');
    }
  }

  updateActiveInput() {
    this.getActiveInput(this.video_display_active.value).then(response => {
      if (response.activeInput == true) {
        this.active_inactive.innerHTML = 'Active';
      } else {
        this.active_inactive.innerHTML = 'InActive';
      }
    });
  }

  updateEnhanceLevel() {
    if (this.select_enhancer.value != '') {
      this.setDialogEnhancement(parseInt(this.select_enhancer.value)).then(response => {
        if (response != null && response.success) {
          this.showNotification('notification_enhancement', 'Successfully set dialog enhancement');
          this.updateEnhancerList();
        } else {
          alert('Failed to set dialog enhancer level');
          this.updateEnhancerList();
        }
      });
    } else {
      alert('No enhancer levels are available');
    }
  }

  updateEqualizerMode() {
    if (this.select_mode.value != '') {
      this.setIntelligentEqualizerMode(parseInt(this.select_mode.value)).then(response => {
        if (response != null && response.success) {
          this.showNotification('notification_equalizer', 'Successfully set equalizer mode');
          this.updateEqualizerList();
        } else {
          alert('Failed to set equalizer mode');
          this.updateEqualizerList();
        }
      });
    } else {
      alert('No equalizer modes are available');
    }
  }
  updateLevel() {
    if (this.audioPort_level.value != '') {
      this.getVolumeLevel(this.audioPort_level.value).then(response => {
        if (response.success && response != null) {
          this.level.value = response.volumeLevel;
        } else {
          this.level.value = '';
        }
      });
    }
  }
  updateAudioLevel() {
    if (
      this.audioPort_level.value != '' &&
      this.level.value != '' &&
      this.level.value >= 0 &&
      this.level.value <= 100
    ) {
      try {
        this.setVolumeLevel(this.audioPort_level.value, this.level.value).then(response => {
          if (response.success && response != null) {
            this.showNotification('notification_volumeLevel', 'Successfully set volume level');
            this.updateLevel();
          } else {
            alert('Failed to set volume level');
            this.updateLevel();
          }
        });
      } catch (error) {
        alert('Error in setting volume level');
      }
    } else if (this.audioPort_level.value == '') {
      alert('No audio ports are available for setting volume level');
    } else if (this.level.value == '') {
      alert('Please provide volume level value');
    } else if (this.level.value < 0 || this.level.value > 100) {
      alert('Please provide a volume level value between 0 and 100');
    }
  }

  updateLeveller() {
    if (this.audioPort_leveller.value != '') {
      this.getVolumeLeveller(this.audioPort_leveller.value).then(response => {
        if (response != null && response.success) {
          var supportedLeveller = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          this.leveller.innerHTML = '';
          var option = document.createElement('option');
          option.text = response.level;
          option.value = response.level;
          this.leveller.appendChild(option);
          this.supportedLevellerFiltered = supportedLeveller.filter(x => response.level.toString() != x);
          for (var i = 0; i < this.supportedLevellerFiltered.length; i++) {
            var option = document.createElement('option');
            option.text = this.supportedLevellerFiltered[i];
            option.value = this.supportedLevellerFiltered[i];
            this.leveller.appendChild(option);
          }
        }
      });
    }
  }
  updateAudioLeveller() {
    if (this.audioPort_leveller.value != '' && this.leveller.value != '') {
      try {
        this.setVolumeLeveller(this.audioPort_leveller.value, this.leveller.value).then(response => {
          if (response != null && response.success) {
            this.showNotification('notification_volumeLeveller', 'Successfully set volume leveller');
            this.updateLeveller();
          } else {
            alert('Failed to set volume leveller');
            this.updateLeveller();
          }
        });
      } catch (error) {
        alert('Error in setting volume leveller');
      }
    } else if (this.audioPort_leveller.value == '') {
      alert('No audio port are available to set volume leveller');
    } else if (this.leveller.value == '') {
      alert('No leveller values are available to set volume leveller');
    }
  }

  updateBass() {
    if (this.audioPort_bass.value != '') {
      this.getBassEnhancer(this.audioPort_bass.value).then(response => {
        if (response != null && response.success) {
          var supportedBass = [];
          for (var i = 0; i <= 100; i++) {
            supportedBass.push(i);
          }
          this.bass.innerHTML = '';
          var option = document.createElement('option');
          option.text = response.bassBoost;
          option.value = response.bassBoost;
          this.bass.appendChild(option);
          this.supportedBassFiltered = supportedBass.filter(x => response.bassBoost.toString() != x);
          for (var i = 0; i < this.supportedBassFiltered.length; i++) {
            var option = document.createElement('option');
            option.text = this.supportedBassFiltered[i];
            option.value = this.supportedBassFiltered[i];
            this.bass.appendChild(option);
          }
        }
      });
    }
  }
  updateBassEnhancer() {
    if (this.audioPort_bass.value != '' && this.bass.value != '') {
      this.setBassEnhancer(this.audioPort_bass.value, this.bass.value).then(response => {
        if (response != null && response.success) {
          this.showNotification('notification_bassEnhancer', 'Successfully set bass enhancer value');
          this.updateBass();
        } else {
          alert('Failed to set bass enhancer');
          this.updateBass();
        }
      });
    } else if (this.audioPort_bass.value == '' && this.bass.value == '') {
      alert('No audio ports and bass values are available');
    } else if (this.audioPort_bass.value == '') {
      alert('No audio ports are available');
    } else if (this.bass.value == '') {
      alert('No bass values are available');
    }
  }

  updateBoost() {
    if (this.audioPort_boost.value != '') {
      this.getSurroundVirtualizer(this.audioPort_boost.value).then(response => {
        if (response.success && response != null) {
          var supportedBoost = [];
          for (var i = 0; i <= 96; i++) {
            supportedBoost.push(i);
          }
          this.boost.innerHTML = '';
          var option = document.createElement('option');
          option.text = response.boost;
          option.value = response.boost;
          this.boost.appendChild(option);
          this.supportedBoostFiltered = supportedBoost.filter(x => response.boost.toString() != x);
          for (var i = 0; i < this.supportedBoostFiltered.length; i++) {
            var option = document.createElement('option');
            option.text = this.supportedBoostFiltered[i];
            option.value = this.supportedBoostFiltered[i];
            this.boost.appendChild(option);
          }
        }
      });
    }
  }

  updateBoostValue() {
    if (this.audioPort_boost.value != '' && this.boost.value != '') {
      this.setSurroundVirtualizer(this.audioPort_boost.value, this.boost.value).then(response => {
        if (response != null && response.success) {
          this.showNotification('notification_virtualizer', 'Successfully set virtualizer');
          this.updateBoost();
        } else {
          alert('Failed to set boost value');
          this.updateBoost();
        }
      });
    } else if (this.audioPort_boost.value == '' && this.boost.value == '') {
      alert('No audio ports and bass values are available');
    } else if (this.audioPort_boost.value == '') {
      alert('No audio ports available are available');
    } else if (this.boost.value == '') {
      alert('No boost values available are available');
    }
  }

  updateMISteering() {
    if (this.audioPort_steering.value != '') {
      try {
        this.setMISteering(this.audioPort_steering.value, this.mi_enable.checked).then(response => {
          var enabledMI = this.mi_enable.checked;
          if (response != null && response.success) {
            if (this.mi_enable.checked == true) {
              var notifyMsg = 'enabled';
            } else {
              var notifyMsg = 'disabled';
            }
            this.showNotification('notification_miEnable', 'Successfully ' + notifyMsg + ' MI steering');
            this.getMISteering(this.audioPort_steering.value).then(response => {
              if (response && response.MISteeringEnable != null) {
                this.mi_enable.checked = response.MISteeringEnable;
              } else {
                this.mi_enable.checked = false;
              }
            });
          } else {
            this.mi_enable.checked = !enabledMI;
            alert('Failed to set MI steering');
          }
        });
      } catch (err) {
        alert('Error in setting MI steering');
      }
    } else if (this.audioPort_steering.value == '') {
      alert('No audio ports available');
    }
  }

  updateSurroundDecoder() {
    if (this.audioPort_surroundDecoder.value != '') {
      try {
        this.enableSurroundDecoder(this.audioPort_surroundDecoder.value, this.surroundDecoder_enable.checked).then(
          response => {
            var enabledDecoder = this.surroundDecoder_enable.checked;
            if (response != null && response.success) {
              if (this.surroundDecoder_enable.checked == true) {
                var notifyMsg = 'enabled';
              } else {
                var notifyMsg = 'disabled';
              }
              this.showNotification('notification_surroundDecoder', 'Successfully ' + notifyMsg + ' surround decoder');
              this.isSurroundDecoderEnabled(
                this.audioPort_surroundDecoder[this.audioPort_surroundDecoder.selectedIndex].value
              ).then(response => {
                if (response && response.surroundDecoderEnable != null) {
                  this.surroundDecoder_enable.checked = response.surroundDecoderEnable;
                } else {
                  this.surroundDecoder_enable.checked = false;
                }
              });
            } else {
              this.surroundDecoder_enable.checked = !enabledDecoder;
              alert('Failed to set surround decoder');
            }
          }
        );
      } catch (err) {
        alert('Error in enabling surround decoder');
      }
    } else if (this.audioPort_surroundDecoder.value == '') {
      alert('No audio ports available');
    }
  }

  updateMuted() {
    if (this.audioPort_muted.value != '') {
      try {
        this.setMuted(this.audioPort_muted.value, this.muted_enable.checked).then(response => {
          var enabledMuted = this.muted_enable.checked;
          if (response != null && response.success) {
            if (this.muted_enable.checked == true) {
              var notifyMsg = 'enabled';
            } else {
              var notifyMsg = 'disabled';
            }
            this.showNotification('notification_mute', 'Successfully ' + notifyMsg + ' mute option');
            this.getMuted(this.audioPort_muted.value).then(response => {
              if (response != null && response.muted) {
                this.muted_enable.checked = response.muted;
              } else {
                this.muted_enable.checked = false;
              }
            });
          } else {
            this.muted_enable.checked = !enabledMuted;
            if (enabledMuted) {
              var alertmsg = 'enable';
            } else {
              var alertmsg = 'disbale';
            }
            alert('Failed to ' + alertmsg + ' mute');
          }
        });
      } catch (err) {
        alert('Error in enabling/disabling mute');
      }
    } else if (this.audioPort_muted.value == '') {
      alert('No audio ports available');
    }
  }

  updateDRCMode() {
    if (this.audioPort_drc.value != '' && this.drc.value != '') {
      if (this.drc.value == 'line') {
        this.drcValue = '0';
      } else if (this.drc.value == 'rf') {
        this.drcValue = '1';
      }
      try {
        this.setDRCMode(this.audioPort_drc.value, this.drcValue).then(response => {
          if (response != null && response.success) {
            this.showNotification('notification_drc', 'Successfully set drc value');
            this.updateDRCList();
          }
        });
      } catch (err) {
        alert('Error in setting drc value');
      }
    } else if (this.audioPort_drc.value == '') {
      alert('No audio ports are available');
    } else if (this.drc.value == '') {
      alert('No drc values available');
    }
  }

  updateGain() {
    try {
      if (this.audioPort_gain.value != '' && this.gain.value != '' && this.gain.value >= 0 && this.gain.value <= 100) {
        this.setGain(this.audioPort_gain.value, this.gain.value).then(response => {
          if (response != null && response.success) {
            this.showNotification('notification_gain', 'Successfully set gain');
            this.updateGainList();
          }
        });
      } else if (this.audioPort_gain.value == '') {
        alert('No audio ports are available');
      } else if (this.gain.value == '') {
        alert('No gain values are available');
      } else if (this.gain.value < 0 || this.gain.value > 100) {
        alert('Please provide gain value between 0 and 100');
      }
    } catch (err) {
      alert('Error in setting gain');
    }
  }

  updateDelay() {
    if (this.delay.value != '' && this.audioPort_delay.value != '') {
      try {
        this.setAudioDelay(this.delay.value, this.audioPort_delay.value).then(response => {
          var response = { success: true };
          if (response != null && response.success) {
            this.showNotification('notification_delay', 'Successfully set delay');
            this.getAudioDelay(this.audioPort_delay.value).then(response => {
              if (response.success && response.audioDelay != null) {
                this.delay.value = response.audioDelay;
              } else {
                this.delay.value = '';
              }
            });
          } else {
            this.delay.value = '';
            alert('Failed to set audio delay');
          }
        });
      } catch (err) {
        alert('Error in setting audio delay');
      }
    } else if (this.audioPort_delay.value == '') {
      alert('No audio ports are available');
    } else if (this.delay.value == '') {
      alert('Please provide delay value in ms');
    }
  }

  updateDelayOffset() {
    if (this.delayOffset.value != '' && this.audioPort_delayOffset.value != '') {
      try {
        this.setAudioDelayOffset(this.delayOffset.value, this.audioPort_delayOffset.value).then(response => {
          if (response != null && response.success) {
            this.showNotification('notification_delayOffset', 'Successfully set delay offset');
            this.getAudioDelayOffset(this.audioPort_delayOffset.value).then(response => {
              if (response.success && response.audioDelayOffset != null) {
                this.delayOffset.value = response.audioDelayOffset;
              } else {
                this.delayOffset.value = '';
              }
            });
          } else {
            this.delayOffset.value = '';
            alert('Failed to set delay offset');
          }
        });
      } catch (err) {
        alert('Error in enabling delay offset');
      }
    } else if (this.audioPort_delayOffset.value == '') {
      alert('No audio ports are available');
    } else if (this.delayOffset.value == '') {
      alert('No delay offset is available');
    }
  }

  getSupportedResolutions(display) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSupportedResolutions',
      params: { videoDisplay: display },
    };

    return this.api.req(_rest, _rpc);
  }

  getCurrentResolution(videoDisplay) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getCurrentResolution',
      params: { videoDisplay: videoDisplay },
    };

    return this.api.req(_rest, _rpc);
  }

  setCurrentResolution(videoDisplay, resolution) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setCurrentResolution',
      params: { videoDisplay: videoDisplay, resolution: resolution, persist: true },
    };

    return this.api.req(_rest, _rpc);
  }

  getSupportedTvResolutions(display) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSupportedTvResolutions',
      params: { videoDisplay: display },
    };

    return this.api.req(_rest, _rpc);
  }

  getSupportedSettopResolutions() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSupportedSettopResolutions',
    };

    return this.api.req(_rest, _rpc);
  }

  getDefaultResolution() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getDefaultResolution',
    };

    return this.api.req(_rest, _rpc);
  }

  getVideoPortStatusInStandby(port) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getVideoPortStatusInStandby',
      params: { portName: port },
    };

    return this.api.req(_rest, _rpc);
  }

  setVideoPortStatusInStandby(port, enabled) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setVideoPortStatusInStandby',
      params: { portName: port, enabled: enabled },
    };

    return this.api.req(_rest, _rpc);
  }

  getTvHDRSupport() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getTvHDRSupport',
    };

    return this.api.req(_rest, _rpc);
  }

  getSettopHDRSupport() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSettopHDRSupport',
    };

    return this.api.req(_rest, _rpc);
  }

  getTVHDRCapabilities() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getTVHDRCapabilities',
    };

    return this.api.req(_rest, _rpc);
  }

  getConnectedAudioPorts() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getConnectedAudioPorts',
    };

    return this.api.req(_rest, _rpc);
  }

  getSupportedAudioPorts() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSupportedAudioPorts',
    };

    return this.api.req(_rest, _rpc);
  }

  getCurrentOutputSettings() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getCurrentOutputSettings',
    };

    return this.api.req(_rest, _rpc);
  }

  supportedAudioModes(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSupportedAudioModes',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  getSoundMode() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSoundMode',
    };

    return this.api.req(_rest, _rpc);
  }

  setSoundMode(audioPort, soundMode) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setSoundMode',
      params: { audioPort: audioPort, soundMode: soundMode, persist: true },
    };

    return this.api.req(_rest, _rpc);
  }

  getActiveInput(display) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getActiveInput',
      params: { videoDisplay: display },
    };

    return this.api.req(_rest, _rpc);
  }
  getZoomSetting() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getZoomSetting',
    };

    return this.api.req(_rest, _rpc);
  }

  setZoomSetting(zoomSetting) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setZoomSetting',
      params: { zoomSetting: zoomSetting },
    };

    return this.api.req(_rest, _rpc);
  }

  getMS12AudioCompression(level) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getMS12AudioCompression',
    };

    return this.api.req(_rest, _rpc);
  }

  setMS12AudioCompression(level) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setMS12AudioCompression',
      params: { compresionLevel: level },
    };

    return this.api.req(_rest, _rpc);
  }

  getConnectedVideoDisplays() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getConnectedVideoDisplays',
    };

    return this.api.req(_rest, _rpc);
  }

  getSupportedVideoDisplays() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSupportedVideoDisplays',
    };

    return this.api.req(_rest, _rpc);
  }

  setDolbyVolumeMode(dolbyVolumeMode) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setDolbyVolumeMode',
      params: { dolbyVolumeMode: dolbyVolumeMode },
    };

    return this.api.req(_rest, _rpc);
  }

  getDolbyVolumeMode() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getDolbyVolumeMode',
    };

    return this.api.req(_rest, _rpc);
  }

  readEDID() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'readEDID',
    };

    return this.api.req(_rest, _rpc);
  }

  readHostEDID() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'readHostEDID',
    };

    return this.api.req(_rest, _rpc);
  }

  setDialogEnhancement(enhancerlevel) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setDialogEnhancement',
      params: { enhancerlevel: enhancerlevel },
    };

    return this.api.req(_rest, _rpc);
  }

  getDialogEnhancement() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getDialogEnhancement',
    };

    return this.api.req(_rest, _rpc);
  }

  setIntelligentEqualizerMode(equalizerMode) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setIntelligentEqualizerMode',
      params: { intelligentEqualizerMode: equalizerMode },
    };

    return this.api.req(_rest, _rpc);
  }

  getIntelligentEqualizerMode() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getIntelligentEqualizerMode',
    };

    return this.api.req(_rest, _rpc);
  }

  getSinkAtmosCapability() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSinkAtmosCapability',
    };

    return this.api.req(_rest, _rpc);
  }

  setAudioAtmosOutputMode(enable) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setAudioAtmosOutputMode',
      params: { enable: enable },
    };

    return this.api.req(_rest, _rpc);
  }

  isConnectedDeviceRepeater() {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'isConnectedDeviceRepeater',
    };

    return this.api.req(_rest, _rpc);
  }

  setVolumeLeveller(audioPort, level) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setVolumeLeveller',
      params: { audioPort: audioPort, level: level },
    };

    return this.api.req(_rest, _rpc);
  }

  getVolumeLeveller(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getVolumeLeveller',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setVolumeLevel(audioPort, volumeLevel) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setVolumeLevel',
      params: { audioPort: audioPort, volumeLevel: volumeLevel },
    };

    return this.api.req(_rest, _rpc);
  }

  getVolumeLevel(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getVolumeLevel',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setBassEnhancer(audioPort, bass) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setBassEnhancer',
      params: { audioPort: audioPort, bassBoost: bass },
    };

    return this.api.req(_rest, _rpc);
  }

  getBassEnhancer(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getBassEnhancer',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setSurroundVirtualizer(audioPort, boost) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setBassEnhancer',
      params: { audioPort: audioPort, boost: boost },
    };

    return this.api.req(_rest, _rpc);
  }

  getSurroundVirtualizer(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getSurroundVirtualizer',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setMISteering(audioPort, enable) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setMISteering',
      params: { audioPort: audioPort, MISteeringEnable: enable },
    };

    return this.api.req(_rest, _rpc);
  }

  getMISteering(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getMISteering',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  enableSurroundDecoder(audioPort, enable) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'enableSurroundDecoder',
      params: { audioPort: audioPort, surroundDecoderEnable: enable },
    };

    return this.api.req(_rest, _rpc);
  }

  isSurroundDecoderEnabled(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'isSurroundDecoderEnabled',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setDRCMode(audioPort, mode) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setDRCMode',
      params: { audioPort: audioPort, DRCMode: mode },
    };

    return this.api.req(_rest, _rpc);
  }

  getDRCMode(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getDRCMode',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setGain(audioPort, gain) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setDRCMode',
      params: { audioPort: audioPort, gain: gain },
    };

    return this.api.req(_rest, _rpc);
  }

  getGain(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getGain',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setMuted(audioPort, muted) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setDRCMode',
      params: { audioPort: audioPort, muted: muted },
    };

    return this.api.req(_rest, _rpc);
  }

  getMuted(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getGain',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setAudioDelay(audioDelay, audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setAudioDelay',
      params: { audioDelay: audioDelay, audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  getAudioDelay(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getAudioDelay',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  getAudioDelayOffset(audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'getAudioDelayOffset',
      params: { audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setAudioDelayOffset(audioDelayOffset, audioPort) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setAudioDelayOffset',
      params: { audioDelayOffset: audioDelayOffset, audioPort: audioPort },
    };

    return this.api.req(_rest, _rpc);
  }

  setScartParameter(scartParameter, scartParameterData) {
    const _rest = {
      method: 'GET',
      path: `${this.callsign}`,
    };

    const _rpc = {
      plugin: this.callsign,
      method: 'setScartParameter',
      params: { scartParameter: scartParameter, scartParameterData: scartParameterData },
    };

    return this.api.req(_rest, _rpc);
  }

  updateDisplayRelatedResponse() {
    this.getSupportedTvResolutions(this.video_display_resolution.value).then(response => {
      this.supported_tv_resolutions.innerHTML = response.supportedTvResolutions;
    });

    this.getSupportedSettopResolutions(this.video_display_resolution.value).then(response => {
      this.supported_stb_resolutions.innerHTML = response.supportedSettopResolutions;
    });
    this.getVideoPortStatusInStandby(this.select_port_standby.value).then(response => {
      if (response.videoPortStatusInStandby) {
        this.standby_mode.checked = true;
      } else {
        this.standby_mode.checked = false;
      }
    });
    this.updateActiveInput();
    this.getSupportedResolutions(this.video_display_resolution.value).then(response => {
      this.supported_resolutions.innerHTML = response.supportedResolutions;
      this.totalResolution = response.supportedResolutions;
      this.updateCurrentResolution();
    });
  }

  update() {
    this.getSupportedVideoDisplays().then(response => {
      this.supported_video_displays.innerHTML = response.supportedVideoDisplays;
      var videoDisplayElement = [
        this.video_display_resolution,
        this.video_display_current,
        this.select_port_standby,
        this.video_display_active,
      ];
      for (var i = 0; i < videoDisplayElement.length; i++) {
        for (var j = 0; j < response.supportedVideoDisplays.length; j++) {
          var option = document.createElement('option');
          option.text = response.supportedVideoDisplays[j];
          option.value = response.supportedVideoDisplays[j];
          videoDisplayElement[i].appendChild(option);
        }
        if (i == videoDisplayElement.length - 1) {
          this.updateDisplayRelatedResponse();
        }
      }
    });
    this.updateConnectedDisplay();
    this.getDefaultResolution().then(response => {
      if (response != null && response.success) {
        this.default_resolution.innerHTML = response.defaultResolution;
      }
    });

    this.getConnectedAudioPorts().then(response => {
      this.connected_audio_ports.innerHTML = response.connectedAudioPorts;
    });
    this.getSupportedAudioPorts().then(response => {
      this.supported_audio_ports.innerHTML = response.supportedAudioPorts;
      this.audioPort = response.supportedAudioPorts[0];
      var audioPortElement = [
        this.select_audio_port,
        this.audio_port,
        this.audioPort_leveller,
        this.audioPort_level,
        this.audioPort_bass,
        this.audioPort_boost,
        this.audioPort_steering,
        this.audioPort_surroundDecoder,
        this.audioPort_drc,
        this.audioPort_gain,
        this.audioPort_muted,
        this.audioPort_delay,
        this.audioPort_delayOffset,
      ];
      for (var i = 0; i < audioPortElement.length; i++) {
        for (var j = 0; j < response.supportedAudioPorts.length; j++) {
          var option = document.createElement('option');
          option.text = response.supportedAudioPorts[j];
          option.value = response.supportedAudioPorts[j];
          audioPortElement[i].appendChild(option);
        }
      }
      this.updateAudioMode();
      this.updateLeveller();
      this.updateLevel();
      this.updateBass();
      this.updateBoost();
      this.updateDRCList();
      this.updateGainList();
    });
    this.readEDID().then(response => {
      this.edid_hdmi.innerHTML = response.EDID;
    });
    this.readHostEDID().then(response => {
      if (response && response.EDID != '') {
        this.edid_host.innerHTML = response.EDID;
      } else {
        this.edid_host.innerHTML = '-';
      }
    });
    this.getTvHDRSupport().then(response => {
      this.hdr_tv.innerHTML = response.standards;
    });

    this.getSettopHDRSupport().then(response => {
      this.hdr_stb.innerHTML = response.standards;
    });
    this.getTVHDRCapabilities().then(response => {
      switch (response.capabilities) {
        case 0:
          this.hdr_tv_capabilities.innerHTML = 'HDRSTANDARD_NONE';
          break;
        case 1:
          this.hdr_tv_capabilities.innerHTML = 'HDRSTANDARD_HDR10';
          break;
        case 2:
          this.hdr_tv_capabilities.innerHTML = 'HDRSTANDARD_HLG';
          break;
        case 4:
          this.hdr_tv_capabilities.innerHTML = 'HDRSTANDARD_DolbyVision';
          break;
        case 8:
          this.hdr_tv_capabilities.innerHTML = 'HDRSTANDARD_TechnicolorPrime';
          break;
        default:
          this.hdr_tv_capabilities.innerHTML = response.capabilities;
      }
    });
    this.getCurrentOutputSettings().then(response => {
      this.color_space.innerHTML = response.colorSpace;
      this.color_depth.innerHTML = response.colorDepth;
      this.matrix_coefficients.innerHTML = response.matrixCoefficients;
      this.video_EOTF.innerHTML = response.videoEOTF;
    });
    this.getZoomSetting().then(response => {
      var supportedZoomSetting = [
        'FULL',
        'NONE',
        'Letterbox 16x9',
        'Letterbox 14x9',
        'CCO',
        'PanScan',
        'Letterbox 2.21 on 4x3',
        'Letterbox 2.21 on 16x9',
        'Platform',
        'Zoom 16x9',
        'Pillarbox 4x3',
        'Widescreen 4x3',
      ];
      var option = document.createElement('option');
      option.text = response.zoomSetting;
      option.value = response.zoomSetting;
      this.select_zoom_setting.appendChild(option);
      this.supportedZoomSettingFiltered = supportedZoomSetting.filter(x => response.zoomSetting != x);
      for (var i = 0; i < this.supportedZoomSettingFiltered.length; i++) {
        var option = document.createElement('option');
        option.text = this.supportedZoomSettingFiltered[i];
        option.value = this.supportedZoomSettingFiltered[i];
        this.select_zoom_setting.appendChild(option);
      }
    });
    var scartParameter = ['aspect_ratio', 'tv_startup', 'rgb', 'cvbs', 'macrovision', 'cgms'];
    for (var j = 0; j < scartParameter.length; j++) {
      var option = document.createElement('option');
      option.text = scartParameter[j];
      option.value = scartParameter[j];
      this.scart_param.appendChild(option);
    }
    this.updateScartData();
    this.updateSoundModeList();
    this.updateMS12Compression();
    this.getDolbyVolumeMode().then(response => {
      if (response && response.dolbyVolumeMode != null) {
        this.dolby_mode.checked = response.dolbyVolumeMode;
      }
    });
    this.getSinkAtmosCapability().then(response => {
      if (response != null && response.success) {
        this.sink_atmos.innerHTML = response.atmos_capability;
      } else {
        this.sink_atmos.innerHTML = '-';
      }
    });
    this.isConnectedDeviceRepeater().then(response => {
      if (response && response.HdcpRepeater != null) {
        this.repeater = response.HdcpRepeater;
      } else {
        this.repeater = '-';
      }
    });
    this.getMISteering(this.audioPort_steering.value).then(response => {
      if (response && response.MISteeringEnable != null) {
        this.mi_enable.checked = response.MISteeringEnable;
      } else {
        this.mi_enable.checked = false;
      }
    });
    this.isSurroundDecoderEnabled(this.audioPort_surroundDecoder.value).then(response => {
      if (response != null && response.surroundDecoderEnable != null) {
        this.surroundDecoder_enable.checked = response.surroundDecoderEnable;
      } else {
        this.surroundDecoder_enable.checked = false;
      }
    });
    this.getMuted(this.audioPort_muted.value).then(response => {
      if (response != null && response.muted != null) {
        this.muted_enable.checked = response.muted;
      } else {
        this.muted_enable.checked = false;
      }
    });

    this.getAudioDelay(this.audioPort_delay.value).then(response => {
      if (response != null && response.audioDelay != null) {
        this.delay.value = response.audioDelay;
      } else {
        this.delay.value = '';
      }
    });
    this.getAudioDelayOffset(this.audioPort_delayOffset.value).then(response => {
      if (response != null && response.audioDelayOffset != null) {
        this.delayOffset.value = response.audioDelayOffset;
      } else {
        this.delayOffset.value = '';
      }
    });
    this.updateEnhancerList();
    this.updateEqualizerList();
  }

  close() {
    if (this.onResolutionChanged && typeof this.onResolutionChanged.dispose === 'function') {
      this.onResolutionChanged.dispose();
      this.onResolutionChanged = null;
    }
    if (this.onZoomSettingUpdated && typeof this.onZoomSettingUpdated.dispose === 'function') {
      this.onZoomSettingUpdated.dispose();
      this.onZoomSettingUpdated = null;
    }
    if (this.onActiveInputChanged && typeof this.onActiveInputChanged.dispose === 'function') {
      this.onActiveInputChanged.dispose();
      this.onActiveInputChanged = null;
    }
    if (this.onConnectedVideoDisplaysUpdated && typeof this.onConnectedVideoDisplaysUpdated.dispose === 'function') {
      this.onConnectedVideoDisplaysUpdated.dispose();
      this.onConnectedVideoDisplaysUpdated = null;
    }
  }
}

export default DisplaySettings;
