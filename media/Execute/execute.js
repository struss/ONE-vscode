// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();
// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

// Main function that gets executed once the webview DOM loads
function main() {
  const modelDropDown = document.getElementById("modelType");
  const inputDeviceType = document.getElementById("inputDeviceType");
  const inputModelType = document.getElementById("inputModelType");
  const saveButton = document.getElementById("save");
  saveButton.addEventListener("click", function(){
    vscode.postMessage({
      command:"Save",
    });    
  });
  modelDropDown.addEventListener("change", function(){
    vscode.postMessage({
      command: "DropDownChange",
      changedValue: modelDropDown.options[modelDropDown.selectedIndex].value,
    });
    if(modelDropDown.options[modelDropDown.selectedIndex].value===''){
      inputDeviceType.value = "";
    }else{
      inputDeviceType.value = modelDropDown.options[modelDropDown.selectedIndex].textContent;
    }
  });
  inputModelType.addEventListener("input", function(e){
    vscode.postMessage({
      command: "modelTypeEdit",
      value: e.target.value,
    });
  });
}
