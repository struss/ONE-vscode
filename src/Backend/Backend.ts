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

const assert = require('assert');
import {Backend} from './API';
import {gToolchainEnvMap, ToolchainEnv} from '../Toolchain/ToolchainEnv';
import {Logger} from '../Utils/Logger';
import {Executor} from './Executor';

/**
 * Interface of backend map
 * - Use Object class to use the only string key
 */
interface BackendMap {
  [key: string]: Backend;
}

interface ExecutorMap {
  [key: string]: Executor;
}

// List of backend extensions registered
let globalBackendMap: BackendMap = {};

let globalExecutorMap: ExecutorMap = {};

function backendRegistrationApi() {
  const logTag = 'backendRegistrationApi';
  let registrationAPI = {
    registerBackend(backend: Backend) {
      const backendName = backend.name();
      assert(backendName.length > 0);
      globalBackendMap[backendName] = backend;
      const compiler = backend.compiler();
      if (compiler) {
        gToolchainEnvMap[backend.name()] = new ToolchainEnv(compiler);
      }
      const executor = backend.executor();
      if (executor) {
        globalExecutorMap[backend.name()] = executor;
      }
      Logger.info(logTag, 'Backend', backendName, 'was registered into ONE-vscode.');
    },
    registerExecutor(executor: Executor) {
      globalExecutorMap[executor.getName()] = executor;
    }
  };

  return registrationAPI;
}

export {globalBackendMap, globalExecutorMap, backendRegistrationApi};
