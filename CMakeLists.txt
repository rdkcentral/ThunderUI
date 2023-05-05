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

cmake_minimum_required(VERSION 3.3)

project(WPEFrameworkUI)

set(NPM "${NPM_BINARY_PATH}npm")

option(AUDIT_AND_FIX "Automatic fix vulnerabilities where possible" OFF)

message(STATUS "NPN: ${NPM}")

add_custom_target (npm-target-install ALL
  COMMAND ${NPM} install --prefix ${CMAKE_SOURCE_DIR}
)

add_custom_target (run-build ALL
  DEPENDS npm-target-install
  COMMAND NODE_OPTIONS=--openssl-legacy-provider ${NPM} run build --prefix ${CMAKE_SOURCE_DIR}
)

if(AUDIT_AND_FIX)
  add_custom_target (audit-fix ALL
    DEPENDS npm-target-install
    COMMAND ${NPM} audit fix --prefix ${CMAKE_SOURCE_DIR}
  )
  
  add_dependencies(run-build audit-fix)
endif()

install(DIRECTORY "${CMAKE_SOURCE_DIR}/dist/"
    DESTINATION share/WPEFramework/Controller/UI
    FILE_PERMISSIONS OWNER_READ OWNER_WRITE GROUP_READ WORLD_READ 
)
