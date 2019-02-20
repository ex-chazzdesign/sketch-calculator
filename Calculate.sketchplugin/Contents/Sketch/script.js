let Sketch = require('sketch');
let UI = require('sketch/ui')
let Artboard = require('sketch/dom').Artboard

const REGEX_FIELDS = /\{(.*?)\}/g;
const REGEX_COMMAND = /^=(.*?)\(.*?\)/;
const TYPES = {
  ARTBOARD: 'Artboard',
  GROUP: 'Group'
} 

let searchLayersByName = function (name) {
  return Sketch.getSelectedDocument().getLayersNamed(name);
}

var extractVariables = function(str) {
  let matches = []

  while ((m = REGEX_FIELDS.exec(str)) !== null) {

    if (m.index === REGEX_FIELDS.lastIndex) {
      REGEX_FIELDS.lastIndex++;
    }

    matches.push(m[1])
  }

  return matches
}

var extractCommand = function(str) {
  let matches = REGEX_COMMAND.exec(str);

  if (matches && matches.length === 2) {
    return matches[1]
  }

  return undefined
}

var calculate = function (context) {

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

let extractValues = function(variables) {
  let values = [];

  for (var i = 0; i < variables.length; i++) {
    let variable = variables[i];
    let foundLayers = searchLayersByName(variable);

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
    case 'CONCAT': {
      const reducer = (acc, value) => acc.value + ' ' +  value.value;
      text = values.reduce(reducer);
      break;
    }
    case 'UPPER': {
      text = values[0].value.toUpperCase();
      break;
    }
    case 'LOWER': {
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

  for (var i = 0; i < values.length; i++) {
    let token = values[i];
    str = str.replace(new RegExp(`\{${token.variable}\}`, 'g'), token.value);
  }

  try {
    str = str.replace(/,/g, '.');    
    let finalValue = eval(str);
    layer.text = (finalValue + '').replace('.', ',');
  } catch (e) {    
    showError(layer, e)
  }
}

let processLayer = function (layer) {
  let artboard = layer.getParentArtboard();
  let command = extractCommand(layer.name);

  let variables = extractVariables(layer.name);
  let values = extractValues(variables);


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

var changedText = function (context) {
  console.log('Text changed');
  calculate();
}

