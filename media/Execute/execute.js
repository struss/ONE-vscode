// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();
// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

// Main function that gets executed once the webview DOM loads
function main() {
  let modelTyepList = [];
  console.log(os.homedir() + "/.one-vscode/Executor");
  try{
    const direc = fs.opendirSync(os.homedir() + "/.one-vscode/Executor");
    for (const dirent of direc){
      console.log(dirent.name);
      if(dirent.isDirectory()){
        modelTyepList.push(dirent.name);
      }
    }
  } catch(err){
    console.error(err);
  }
  console.log(modelTyepList);
  for (let index = 0; index < modelTyepList.length; index++) {
    const element = modelTyepList[index];
    var option = document.createElement("vscode-option");
    option.textContent = element;
    const jsonFile = fs.readFileSync(os.homedir() + "/.one-vscode/Executor/" + element + "/config.json");
    const jsonData = JSON.parse(jsonFile);
    option.value = jsonData.Type;
  }
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
  // Handle case for select item on value
  {
    if(modelDropDown.options[modelDropDown.selectedIndex].value !== ''){
      
    }
  }
}
