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
/*
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*
Some part of this code refers to
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/blob/b807107df40271e83ea6d36828357fdb10d71f12/default/hello-world/src/panels/HelloWorldPanel.ts
*/
import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import {getUri} from '../Utils/Uri';
/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
 export class ExecuteSetPanel {
    public static currentPanel: ExecuteSetPanel | undefined;
    private readonly _panel: WebviewPanel;
    private readonly _externalUri: Uri;
    private _disposables: Disposable[] = [];
  
    /**
     * The ExecuteSetPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    private constructor(panel: WebviewPanel, extensionUri: Uri) {
      this._panel = panel;
      this._externalUri = extensionUri;
  
      // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
      // the panel or when the panel is closed programmatically)
      this._panel.onDidDispose(this.dispose, null, this._disposables);
  
      // Set the HTML content for the webview panel
      this._panel.webview.html = this._getWebviewContent(this._panel.webview, this._externalUri);
  
      // Set an event listener to listen for messages passed from the webview context
      this._setWebviewMessageListener(this._panel.webview);
    }
  
    /**
     * Renders the current webview panel if it exists otherwise a new webview panel
     * will be created and displayed.
     *
     * @param extensionUri The URI of the directory containing the extension.
     */
    public static render(extensionUri: Uri) {
      if (ExecuteSetPanel.currentPanel) {
        // If the webview panel already exists reveal it
        ExecuteSetPanel.currentPanel._panel.reveal(ViewColumn.One);
      } else {
        // If a webview panel does not already exist create and show a new one
        const panel = window.createWebviewPanel(
          // Panel view type
          "showExecutorType",
          // Panel title
          "Executor Env settings",
          // The editor column the panel should be displayed in
          ViewColumn.One,
          // Extra panel configurations
          {
            // Enable JavaScript in the webview
            enableScripts: true,
          }
        );
  
        ExecuteSetPanel.currentPanel = new ExecuteSetPanel(panel, extensionUri);
      }
    }
  
    /**
     * Cleans up and disposes of webview resources when the webview panel is closed.
     */
    public dispose() {
      ExecuteSetPanel.currentPanel = undefined;
  
      // Dispose of the current webview panel
      this._panel.dispose();
  
      // Dispose of all disposables (i.e. commands) for the current webview panel
      while (this._disposables.length) {
        const disposable = this._disposables.pop();
        if (disposable) {
          disposable.dispose();
        }
      }
    }
  
    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where references to CSS and JavaScript files/packages
     * (such as the Webview UI Toolkit) are created and inserted into the webview HTML.
     *
     * @param webview A reference to the extension webview
     * @param extensionUri The URI of the directory containing the extension
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
      const toolkitUri = getUri(webview, extensionUri, [
        "node_modules",
        "@vscode",
        "webview-ui-toolkit",
        "dist",
        "toolkit.js",
      ]);
      const mainUri = getUri(webview, extensionUri, ['media', 'Execute', 'execute.js']);
  
      // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
      return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script type="module" src="${toolkitUri}"></script>
            <script type="module" src="${mainUri}"></script>
          </head>
          <header>
            <h2> Choose a Type of executor or Add a new one </h2>
            <vscode-dropdown id="modelType">
              <vscode-option value="">add new one......</vscode-option>
            </vscode-dropdown>
          </header>
          <body>
            <div>
              <vscode-text-field id="inputDeviceType">Input Device Type</vscode-text-field>
            </div>
            <div>
              <vscode-text-field id="inputModelType">Input Model Type</vscode-text-field>
            </div>
            <div>
              <vscode-text-area id="installCheck" rows="10" cols="100">Install Check</vscode-text-area>
              <vscode-button id="loadInstallCheck">load from file</vscode-button>
            </div>
            <div>
              <vscode-text-area id="install" rows="10" cols="100">Install</vscode-text-area>
              <vscode-button id="loadInstall">load from file</vscode-button>
            </div>
            <div>
              <vscode-text-area id="executionScript" placeHolder="Execute Script will run model like '<execute-script> --model <model_path> --input_data <input_data_path> --output_result <output_data_path>'" rows="10" cols="100">Execute Script</vscode-text-area>
              <vscode-button id="loadExecuteScript">load from file</vscode-button>
            </div>
          </body>
          <footer align="right">
            <vscode-button id="save">Save</vscode-button>
          </footer>
        </html>
      `;
    }

    private _updateWebviewContent(){
      this._panel.webview.html = this._getWebviewContent(this._panel.webview, this._externalUri);
    }

    private _saveSetting(message: any){
      
    }
  
    /**
     * Sets up an event listener to listen for messages passed from the webview context and
     * executes code based on the message that is recieved.
     *
     * @param webview A reference to the extension webview
     * @param context A reference to the extension context
     */
    private _setWebviewMessageListener(webview: Webview) {
      webview.onDidReceiveMessage(
        (message: any) => {
          console.log(message);
          const command = message.command;
          switch (command) {
            case "Save":
                this._saveSetting(message);
              return;
            case "DropDownChange":
              this._updateWebviewContent();
              return;
          }
        },
        undefined,
        this._disposables
      );
    }
  }
