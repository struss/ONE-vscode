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
import * as fs from 'fs';
import * as os from 'os';
import * as json from 'jsonc-parser';

enum NodeType {
    host,
    modelType,
    device
}

/*  
NodeType will comse from json.

env.json contains json array (host[])


json object for each Nodetype will be:

host{
    name : string <'local' | IP String>
    type : string <'host' | 'modelType' | 'device'>
    port: number
    modeltype : modelType[]
}

modelType{
    name : string
    type : string <'host' | 'modelType' | 'device'>
    devices : devices[]
}

device{
    name : string
    type : string <'host' | 'modelType' | 'device'>
    version : string
}

*/

interface Node {
    name: string;
    type: NodeType;
    offset: number;
}

export class ExecutorNode extends vscode.TreeItem
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly node: Node,
    ) {
        super(label, collapsibleState);

        if (node.type === NodeType.host) {
        this.iconPath = new vscode.ThemeIcon('gear');
        } else if (node.type === NodeType.modelType) {
        this.iconPath = new vscode.ThemeIcon('folder');
        } else if (node.type === NodeType.device) {
        this.iconPath = new vscode.ThemeIcon('terminal');
        }
    }

    getOffset() : number{
        return this.node.offset;
    }
}

class ExecuteEnvProvider implements vscode.TreeDataProvider<ExecutorNode>{
	private _onDidChangeTreeData: vscode.EventEmitter<ExecutorNode|undefined|void> =
      new vscode.EventEmitter<ExecutorNode|undefined|void>();
    readonly onDidChangeTreeData: vscode.Event<ExecutorNode|undefined|void> =
      this._onDidChangeTreeData.event;

	private tree: json.Node;
    private text: string;
    
	constructor(){
		this.text = fs.readFileSync(os.homedir() + "/.one-vscode/Executor/env.json",'utf-8');
		this.tree = json.parseTree(this.text);
	}

	refresh(): void {
		this.text = fs.readFileSync(os.homedir() + "/.one-vscode/Executor/env.json",'utf-8');
		this.tree = json.parseTree(this.text);
		this._onDidChangeTreeData.fire();
	}
	  
	getTreeItem(node: ExecutorNode): vscode.TreeItem {
		return node;
	}
	
	getChildren(eNode?: ExecutorNode): vscode.ProviderResult<ExecutorNode[]> {
		if (eNode) {
            const eNodes: ExecutorNode[] = [];
            const childrenNodes = this.getChildrenNodes(eNode.getOffset());
            for(const node of childrenNodes){
                if(node.type === NodeType.host){
                    eNodes.push(new ExecutorNode(node.name === 'local' ?  node.name : "remote( " + node.name + " )", vscode.TreeItemCollapsibleState.Expanded, node));
                } else if(node.type === NodeType.modelType){
                    eNodes.push(new ExecutorNode(node.name, vscode.TreeItemCollapsibleState.Collapsed, node));
                } else {
                    eNodes.push(new ExecutorNode(node.name, vscode.TreeItemCollapsibleState.None, node));
                }
            }
			return Promise.resolve(eNodes);
		} else {
			return Promise.resolve(this.tree ? this.getRootTree(this.tree) : []);
		}
	}

    private getRootTree(node: json.Node) : ExecutorNode[] {
        const eNodes: ExecutorNode[] = [];
        if(node.children){
            for(const object of node.children){
                const jsonOdj =  json.getNodeValue(object);
                eNodes.push(new ExecutorNode(jsonOdj.name, vscode.TreeItemCollapsibleState.Expanded,<Node>{ name:jsonOdj.name, type: NodeType.host, offset: object.offset}));
            }
        }
        return eNodes;
    }

	private getChildrenNodes(offset: number): Node[] {
		const offsets: Node[] = [];
		const node = json.findNodeAtLocation(this.tree, json.getLocation(this.text, offset).path);
        const jsonObject = json.getNodeValue(node);
        try {
            for(const v of this.getProperty(node)){
                const children = this.getProperty(v);
                if(children[1].type === 'array'){
                    for(const i of this.getProperty(children[1])){
                        const tmpObject = json.getNodeValue(i);
                        if(jsonObject.type === "host"){
                            offsets.push(<Node>{ name:tmpObject.name, type: NodeType.modelType, offset: i.offset});
                        } else {
                            offsets.push(<Node>{ name:tmpObject.name, type: NodeType.device, offset: i.offset});
                        }
                    }
                }
            }
        } catch (error) {
            offsets.length = 0;
        }
		return offsets;
	}

    private getProperty(node: json.Node): json.Node[]{
        return node.children? node.children:[];
    }
}

export class ExecutorView {
    constructor(context: vscode.ExtensionContext){
        if (!fs.existsSync(os.homedir() + "/.one-vscode/Executor/env.json")){
            fs.closeSync(fs.openSync(os.homedir() + "/.one-vscode/Executor/env.json", 'w'));
        }
		const executorEnvProvider = new ExecuteEnvProvider();
        context.subscriptions.push(vscode.window.registerTreeDataProvider('ExecutorView', executorEnvProvider));
    }
}