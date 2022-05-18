/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Command} from '../Backend/Command';
import {Connection} from './Device';

interface DeviceType {
  // Specified name for certain device type.
  name(): string;

  // device Executable ext
  getExecutableExt(): string[];

  // list specified name for connectable devices
  getConnectableDevices(connect: Connection): string[];

  // check certain device connected
  checkConnected(connect: Connection, name: string): boolean;

  // Need to add inference and profile action.
  // or Need more command for execution like copy file etc....
}

export {DeviceType};
