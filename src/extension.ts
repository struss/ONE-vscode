/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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

import * as vscode from 'vscode';
import * as ssh2 from 'ssh2';
import * as fs from 'fs';
import * as os from 'os';

import {backendRegistrationApi} from './Backend/Backend';
import {CfgEditorPanel} from './CfgEditor/CfgEditorPanel';
import {decoder} from './Circlereader/Circlereader';
import {Circletracer} from './Circletracer';
import {CompilePanel} from './Compile/CompilePanel';
import {ExecuteSetPanel} from './Execute/ExecuteSetPanel';
import {ConfigPanel} from './Config/ConfigPanel';
import {createStatusBarItem} from './Config/ConfigStatusBar';
import {CodelensProvider} from './Editor/CodelensProvider';
import {HoverProvider} from './Editor/HoverProvider';
import {Jsontracer} from './Jsontracer';
import {OneExplorer} from './OneExplorer';
import {Project} from './Project';
import {Utils} from './Utils';

/**
 * Set vscode context that is used globally
 */
function setGlobalContext() {
  // These contexts are used to show "Compile" menu in File Explorer view
  //
  // 1. When a file is right-clicked (e.g., .pb, .tflite, etc)
  // 2. When a dir is right-clicked (e.g., Keras model or saved model)

  let compilableFileExts = ['.pb', '.tflite', '.onnx'];
  vscode.commands.executeCommand('setContext', 'onevscode.compilableExtList', compilableFileExts);

  // TODO Search directories containing Keras model or saved model
  //
  // Refer to https://github.com/Samsung/ONE-vscode/issues/331#issuecomment-1081295299 for
  // experience with directory path format.
  let dirList: string[] = [/* NYI */];
  vscode.commands.executeCommand('setContext', 'onevscode.compilableDirList', dirList);
}

export function activate(context: vscode.ExtensionContext) {
  console.log('one-vscode activate OK');

  setGlobalContext();

  new OneExplorer(context);

  // ONE view
  let refreshCompiler = vscode.commands.registerCommand('onevscode.refresh-compiler', () => {
    console.log('refresh-compiler: NYI');
  });
  context.subscriptions.push(refreshCompiler);
  let installCompiler = vscode.commands.registerCommand('onevscode.install-compiler', () => {
    console.log('install-compiler: NYI');
  });
  context.subscriptions.push(installCompiler);
  let addExecutor = vscode.commands.registerCommand('onevscode.connect-executor', async () => {
    let modelTyepList = [];
    try{
      const dir = fs.opendirSync(os.homedir() + "/.one-vscode/Executor");
      for await (const dirent of dir){
        console.log(dirent.name);
        if(dirent.isDirectory()){
          modelTyepList.push(dirent.name);
        }
      }
    } catch(err){
      console.error(err);
    }
    if(modelTyepList.length === 0){
      console.log("No Model Type Added.");
      vscode.window.showErrorMessage('No Executor Type. Please set Executor type first.');
      return;
    }
    const modelSelectOptions: vscode.QuickPickOptions = {canPickMany: false, ignoreFocusOut: false, placeHolder: 'Select Type of executor to add'};
    const modelType = await vscode.window.showQuickPick(modelTyepList, modelSelectOptions);

    if(modelType === undefined){
      vscode.window.showErrorMessage('No model type selected');
      return;
    }

    const selectOptions: vscode.QuickPickOptions = {canPickMany: false, ignoreFocusOut: false};
    const isLocal = await vscode.window.showQuickPick(['Local', 'remote'], selectOptions);

    if(isLocal === undefined){
      vscode.window.showErrorMessage('Select type of execute env');
      return;
    } else {
      if(isLocal.valueOf() === 'Local')
      {
        console.log('local execution env selected');
        // Add config on this.
        return;
      }
    }

    let ip, username, passwd;
    let port = 22;

    const ipOptions: vscode
        .InputBoxOptions = {ignoreFocusOut: false, password: false, placeHolder: '', prompt: 'Enter IP for Execution Device'};
    const ipResult = await vscode.window.showInputBox(ipOptions);

    if (ipResult === undefined) {
      vscode.window.showErrorMessage('please Enter IP.');
      return;
    } else {
      let ipInfo = ipResult.valueOf().split(':');
      ip = ipInfo[0];
      if(ipInfo.length !== 1){
        port = parseInt(ipInfo[1]);
      }
      const re = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      
      if(!re.test(ip)){
        vscode.window.showErrorMessage('Invalid IP: ' + ip);
        return;
      }
    }

    const userNameOptions: vscode.InputBoxOptions = {ignoreFocusOut: false, password: false, placeHolder: '', prompt: 'Enter username for Execution Device'};
    const userNameResult = await vscode.window.showInputBox(userNameOptions);

    if(userNameResult === undefined) {
      vscode.window.showErrorMessage('username not entered.');
    } else {
      username = userNameResult.valueOf();
    }


    const passwdOptions: vscode.InputBoxOptions = {ignoreFocusOut: false, password: true, placeHolder: '', prompt: 'Enter password for Execution Device'};
    const passwdResult = await vscode.window.showInputBox(passwdOptions);

    if (passwdResult === undefined) {
      vscode.window.showErrorMessage('Password not entered.');
    } else {
      passwd = passwdResult.valueOf();
    }

    var conn = new ssh2.Client();
    conn.on('ready', ()=>{
      console.log('Client :: ready');
      conn.shell((err: Error | undefined, stream: ssh2.ClientChannel)=>{
        if(err){
          throw err;
        }
        stream.on('close', (code: any, signal: any)=>{
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
        }).on('data', (data: any)=>{
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data: any)=>{
          console.log('STDERR: ' + data);
        });
        stream.end('ls -l\nexit\n');
      });
    }).connect({
      host: ip,
      port: port,
      username: username,
      password: passwd
    });
  });
  context.subscriptions.push(addExecutor);
  let setExecutor = vscode.commands.registerCommand('onevscode.setting-executor', () => {
    ExecuteSetPanel.render(context.extensionUri);
  });
  context.subscriptions.push(setExecutor);

  // show compilation page
  let compileWebView = vscode.commands.registerCommand('onevscode.show-compile-webview', () => {
    CompilePanel.render(context.extensionUri);
  });
  context.subscriptions.push(compileWebView);

  context.subscriptions.push(CfgEditorPanel.register(context));

  let logger = new Utils.Logger();
  let projectBuilder = new Project.Builder(logger);

  projectBuilder.init();

  let disposableOneBuild = vscode.commands.registerCommand('onevscode.build', () => {
    console.log('one build...');
    projectBuilder.build(context);
  });
  context.subscriptions.push(disposableOneBuild);

  let disposableOneImport = vscode.commands.registerCommand('onevscode.import', () => {
    console.log('one import...');
    projectBuilder.import(context);
  });
  context.subscriptions.push(disposableOneImport);

  let disposableOneJsontracer = vscode.commands.registerCommand('onevscode.json-tracer', () => {
    console.log('one json tracer...');
    Jsontracer.createOrShow(context.extensionUri);
  });
  context.subscriptions.push(disposableOneJsontracer);

  let disposableOneConfigurationSettings =
      vscode.commands.registerCommand('onevscode.configuration-settings', () => {
        ConfigPanel.createOrShow(context);
        console.log('one configuration settings...');
      });
  context.subscriptions.push(disposableOneConfigurationSettings);

  createStatusBarItem(context);

  let disposableToggleCodelens =
      vscode.commands.registerCommand('onevscode.toggle-codelens', () => {
        let codelensState =
            vscode.workspace.getConfiguration('one-vscode').get('enableCodelens', true);
        vscode.workspace.getConfiguration('one-vscode')
            .update('enableCodelens', !codelensState, true);
      });
  context.subscriptions.push(disposableToggleCodelens);

  let codelens = new CodelensProvider();
  let disposableCodelens = vscode.languages.registerCodeLensProvider('ini', codelens);
  context.subscriptions.push(disposableCodelens);

  let hover = new HoverProvider();
  let disposableHover = vscode.languages.registerHoverProvider('ini', hover);
  context.subscriptions.push(disposableHover);

  let disposableOneCircleTracer = vscode.commands.registerCommand('onevscode.circle-tracer', () => {
    console.log('one circle tracer...');
    const options: vscode.OpenDialogOptions = {
      canSelectMany: false,
      openLabel: 'Open',
      /* eslint-disable */
      filters: {'Circle files': ['circle'], 'All files': ['*']}
      /* eslint-enable */
    };
    vscode.window.showOpenDialog(options).then(fileUri => {
      if (fileUri && fileUri[0]) {
        const circleToJson = decoder(fileUri[0].fsPath);
        Circletracer.createOrShow(context.extensionUri, circleToJson);
      }
    });
  });
  context.subscriptions.push(disposableOneCircleTracer);

  // returning backend registration function that will be called by backend extensions
  return backendRegistrationApi();
}

export function deactivate() {
  // TODO do cleanup
}
