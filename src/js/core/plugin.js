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
/** The base plugin class applies for all plugins. Each plugin must match the name as it is returned from the WPE Framework
 * The supports object toggles what the plugin supports for the main ui
 */

class Plugin {
    /** Constructor
     * @{param} Name of the plugin for display on the UI
     * @{param} Support object to indicate plugin capabilities for the UI. Such as suspend/resume, toggle visibility and whether or not the plugin renders
     */
    constructor(pluginData, api) {
        this.api = api;
        this.callsign = pluginData.callsign;
        this.configuration = pluginData.configuration;
        this.classname = pluginData.classname;
        this.state = pluginData.state; // Suspended, Resumed, Deactivated, Activated
        this.supportsSuspended = false;
        this.supportsVisibility = false;
        this.renderInMenu = true;
        this.displayName = undefined;
        this.rendered = false;
    }

    activate(plugin) {
        const _rest = {
            method  : 'PUT',
            path    : `Controller/Activate/${plugin ? plugin : this.callsign}`
        };

        const _rpc = {
            plugin : 'Controller',
            method : 'activate',
            params : {'callsign': plugin ? plugin : this.callsign}
        };

        return this.api.req(_rest, _rpc)
    };

    deactivate(plugin) {
        const _rest = {
            method  : 'PUT',
            path    : `Controller/Deactivate/${plugin ? plugin : this.callsign}`,
            body    : null
        };

        const _rpc = {
            plugin : 'Controller',
            method : 'deactivate',
            params : {'callsign': plugin ? plugin : this.callsign}
        };

        return this.api.req(_rest, _rpc)
    };

    suspend(plugin) {
        const _rest = {
            method  : 'PUT',
            path    : `Controller/Suspend/${plugin ? plugin : this.callsign}`,
            body    : null
        };

        const _rpc = {
            plugin : 'Controller',
            method : 'suspend',
            params : {'callsign': plugin ? plugin : this.callsign}
        };

        return this.api.req(_rest, _rpc)
    };

    resume(plugin) {
        const _rest = {
            method  : 'PUT',
            path    : `Controller/Resume/${plugin ? plugin : this.callsign}`,
            body    : null
        };

        const _rpc = {
            plugin : 'Controller',
            method : 'resume',
            params : {'callsign': plugin ? plugin : this.callsign}
        };

        return this.api.req(_rest, _rpc)
    };

    show(plugin) {
        const _rest = {
            method  : 'POST',
            path    : `${plugin ? plugin : this.callsign}/Show`,
            body    : null
        };

        const _rpc = {
            plugin : plugin ? plugin : this.callsign,
            method : 'visibility',
            params : 'visible'
        };

        //FIXME JSONRPC show command doesnt work
        return this.api.req(_rest)
    };

    hide(plugin) {
        const _rest = {
            method  : 'POST',
            path    : `${plugin ? plugin : this.callsign}/Hide`,
            body    : null
        };

        const _rpc = {
            plugin : this.callsign,
            method : 'visibility',
            params : 'hidden'
        };

        //FIXME JSONRPC hide command doesnt work
        return this.api.req(_rest)
    };

    status(plugin) {
        const _rest = {
            method  : 'GET',
            path    : plugin ? plugin : this.callsign
        };

        const _rpc = {
            plugin : plugin ? plugin : this.callsign,
            method : 'status'
        };

        return this.api.req(_rest, _rpc);
    }


    /** The render function is called when the plugin needs to render on screen */
    render()        {
        this.rendered = true;
    }


    /** Theclose function is called when the plugin needs to clean up */
    close()         {
        this.rendered = false;
    }
}

export default Plugin;
