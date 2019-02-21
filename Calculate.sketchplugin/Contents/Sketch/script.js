let Sketch = require('sketch');
let UI = require('sketch/ui')
let Artboard = require('sketch/dom').Artboard

const REGEX = {
  FIELDS: /\{(.*?)\}/g,
  COMMAND: /^=(.*?)\(.*?\)/
}

const COMMANDS = {
  CONCAT: 'CONCAT',
  UPPER: 'UPPER',
  LOWER: 'LOWER'
}

const TYPES = {
  ARTBOARD: 'Artboard',
  GROUP: 'Group'
}

let searchLayersByName = function (name, artboard) {
  let local = true;

  if (name.startsWith('*')) {
    name = name.substring(1);
    local = false;
  }

  let foundLayers = Sketch.getSelectedDocument().getLayersNamed(name);

  let result = [];

  if (local) {
    for (let i = 0; i<foundLayers.length; i++) {
      if (foundLayers[i].getParentArtboard().id === artboard.id) {
        result.push(foundLayers[i]);
      }
    }
  } else {
    result = foundLayers;
  }

  return result;
}

let extractVariables = function(str) {
  let matches = []

  while ((m = REGEX.FIELDS.exec(str)) !== null) {

    if (m.index === REGEX.FIELDS.lastIndex) {
      REGEX.FIELDS.lastIndex++;
    }

    matches.push(m[1])
  }

  return matches
}

let extractCommand = function(str) {
  let matches = REGEX.COMMAND.exec(str);

  if (matches && matches.length === 2) {
    return matches[1]
  }

  return undefined
}

var calculate = function () {

  let currentPage = Sketch.getSelectedDocument().selectedPage;
  let layers = currentPage.layers;

  for (let i = 0; i < layers.length; i++) {
    let layer = layers[i];

    if (layer.type === TYPES.ARTBOARD) {      
      processGroup(layer);
    } else {
      // Lo que no está en ningún artboard por ahora no lo procesamos
      // console.log(layers[i].name+" no es un artboard");
    }
  }
}

let processGroup = function (group) {
  let layers = group.layers;

  for (let i = 0; i < layers.length; i++) {
    let layer = layers[i];

    if (layer.type === TYPES.GROUP){
      processGroup(layer);
    }

    if (layer.name.startsWith('=')) {
      processLayer(layer);
    }
  }
}

let extractValues = function(variables, artboard) {
  let values = [];

  for (let i = 0; i < variables.length; i++) {
    let variable = variables[i];
    let foundLayers = searchLayersByName(variable, artboard);

    if (foundLayers && foundLayers[0]) {
      let value = foundLayers[0].text;
      values.push({ variable, value });
    }
  }

  return values;
}

let doCommand = function (layer, command, values) {
  let text = undefined;

  switch(command) {
    case COMMANDS.CONCAT: {
      text = values.map((v) => v.value).join(' ');
      break;
    }
    case COMMANDS.UPPER: {
      text = values[0].value.toUpperCase();
      break;
    }
    case COMMANDS.LOWER: {
      text = values[0].value.toLowerCase();
      break;
    }
  }

  if (text) {
    layer.text = text
  }
}

let doCalculation = function (layer, values) {
  let str = layer.name.substring(1); 

  for (let i = 0; i < values.length; i++) {
    let token = values[i];

    str = str.replace(`{${token.variable}}`, token.value);
  }

  try {
    result = str.replace(/,/g, '.');
    layer.text = eval(result).toString().replace('.', ',');
  } catch (e) {    
    showError(layer, e)
  }
}

let processLayer = function (layer) {
  let artboard = layer.getParentArtboard();
  let command = extractCommand(layer.name);

  let variables = extractVariables(layer.name);
  let values = extractValues(variables, artboard);

  if (command) {
    doCommand(layer, command, values)
  } else {
    doCalculation(layer, values);
  }
}

let showError = function (layer, e) {
  UI.message(`Syntax error: ${e}`);
  layer.text = '!ERR';
  return;
}

var changedText = function (currentContext) {
  let layerName = Sketch.fromNative(currentContext.actionContext.layer).name;
  let currentPage = Sketch.getSelectedDocument().selectedPage;
  let foundLayers = deepSearch(currentPage.layers, `{${layerName}}`);

  foundLayers = foundLayers.concat(deepSearch(currentPage.layers, `{*${layerName}}`));

  for (let i = 0; i < foundLayers.length; i++) {
    processLayer(foundLayers[i]);
  }
}

let deepSearch = function(layers, layerName) {
  let foundLayers = [];

  for (let i = 0; i < layers.length; i++) {
    let currentLayer = layers[i];

    if (currentLayer.type === TYPES.GROUP ||currentLayer.type === TYPES.ARTBOARD){
      foundLayers = foundLayers.concat(deepSearch(currentLayer.layers, layerName));
    } else if (currentLayer.name.includes(layerName)) {
      foundLayers.push(currentLayer);
    }
  }

  return foundLayers;
}

var changedName = function () {
  console.log('Name changed!');
  calculate();
}
