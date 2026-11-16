# If not stated otherwise in this file or this component's LICENSE file the
# following copyright and licenses apply:
#
# Copyright 2020 Metrological
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

cmake_minimum_required(VERSION 3.12)

project(ThunderUI)

option(AUDIT_AND_FIX "Automatic fix vulnerabilities where possible" OFF)
option(USE_OPENSSL_LEGACY_PROVIDER "Use the openssl legacy provider for Node ≥ 17" OFF)

set(NODE_BINARY_PATH "" CACHE PATH "Optional path to Node.js binary")
set(NPM_BINARY_PATH "" CACHE PATH "Optional path to npm binary")

include(GNUInstallDirs)

# Find Node.js
find_program(NODE_EXECUTABLE
    NAMES node
    HINTS ${NODE_BINARY_PATH}
    ENV NODE_HOME
)

# Find npm
find_program(NPM_EXECUTABLE
    NAMES npm
    HINTS ${NPM_BINARY_PATH}
    ENV NPM_HOME                
)

if(NOT NODE_EXECUTABLE)
    message(FATAL_ERROR "Could not find Node.js")
endif()
if(NOT NPM_EXECUTABLE)
    message(FATAL_ERROR "Could not find npm")
endif()

message(STATUS "Using Node.js: ${NODE_EXECUTABLE}")
message(STATUS "Using npm: ${NPM_EXECUTABLE}")

function(detect_version CMD OUTVAR)
    execute_process(
        COMMAND ${CMD} --version
        OUTPUT_VARIABLE _ver
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )
    if(_ver MATCHES "^v?([0-9]+)\\.([0-9]+)\\.([0-9]+)")
        set(${OUTVAR}_VERSION "${CMAKE_MATCH_0}" PARENT_SCOPE)
        set(${OUTVAR}_MAJOR   "${CMAKE_MATCH_1}" PARENT_SCOPE)
        set(${OUTVAR}_MINOR   "${CMAKE_MATCH_2}" PARENT_SCOPE)
        set(${OUTVAR}_PATCH   "${CMAKE_MATCH_3}" PARENT_SCOPE)
    else()
        message(FATAL_ERROR "Could not parse version from ${CMD} (got '${_ver}')")
    endif()
endfunction()

# Detect Node.js and npm versions
detect_version(${NODE_EXECUTABLE} NODE)
detect_version(${NPM_EXECUTABLE} NPM)

set(NODE_OPTIONS_LIST "")

# Automatically enable legacy provider if Node >= 17
if(NODE_MAJOR GREATER_EQUAL 17)
    set(USE_OPENSSL_LEGACY_PROVIDER ON)
    message(STATUS "Using OpenSSL legacy provider because Node >= 17")
endif()

if(USE_OPENSSL_LEGACY_PROVIDER)
    list(APPEND NODE_OPTIONS_LIST "--openssl-legacy-provider")
endif()

string(JOIN " " NODE_OPTIONS_STR ${NODE_OPTIONS_LIST})
message(STATUS "NODE_OPTIONS: ${NODE_OPTIONS_STR}")

add_custom_target (npm-target-install ALL
  COMMAND ${NPM_EXECUTABLE} install --prefix ${CMAKE_SOURCE_DIR}
)

add_custom_target(run-build ALL
    DEPENDS npm-target-install
    COMMAND ${CMAKE_COMMAND} -E env
            NODE_OPTIONS="${NODE_OPTIONS_STR}"
            ${NPM_EXECUTABLE} run build --prefix ${CMAKE_SOURCE_DIR}
)

if(AUDIT_AND_FIX)
  add_custom_target (audit-fix ALL
    DEPENDS npm-target-install
    COMMAND ${NPM_EXECUTABLE} audit fix --prefix ${CMAKE_SOURCE_DIR}
  )
  
  add_dependencies(run-build audit-fix)
endif()

install(DIRECTORY "${CMAKE_SOURCE_DIR}/dist/"
    DESTINATION ${CMAKE_INSTALL_DATAROOTDIR}/Thunder/Controller/UI
    FILE_PERMISSIONS OWNER_READ OWNER_WRITE GROUP_READ WORLD_READ
    COMPONENT Thunder_Runtime
)
