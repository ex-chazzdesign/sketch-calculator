let Sketch = require('sketch');
let UI = require('sketch/ui')
let Artboard = require('sketch/dom').Artboard

const REGEX_FIELDS = /\{(.*?)\}/g;
const TYPES = {
  ARTBOARD: 'Artboard',
  GROUP: 'Group'
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

let searchLayersByName = function (name, artboard) {

  var local = true;
  if (name.startsWith('*')) {
    name = name.substring(1);
    local = false;
  }

  // Primero busco todos los layers con ese nombre
  let foundLayers = Sketch.getSelectedDocument().getLayersNamed(name);
  
  let result = [];
  if (local) {
    for (var i=0; i<foundLayers.length; i++) {
      // Recorro y pillo solo los que pertenecen al mismo artboard
      if (foundLayers[i].getParentArtboard().id == artboard.id) {
        result.push(foundLayers[i]);
      }
    }
  } else {
    result = foundLayers;
  }

  return result;
}

let processLayer = function (layer) {

  let artboard = layer.getParentArtboard();
  let str = layer.name.substring(1);  
  let calc = str;

  while ((m = REGEX_FIELDS.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === REGEX_FIELDS.lastIndex) {
      REGEX_FIELDS.lastIndex++;
    }

    let token = m[1] // This is: A1
    let foundLayers = searchLayersByName(token, artboard);

    if (foundLayers && foundLayers.length) {
      let foundLayer = foundLayers[0];
      let value = foundLayers[0].text;
      //calc = calc.replace(new RegExp(m[0], 'g'), value); // Me estaba dando problemas con el '*'
      calc = calc.replace(m[0], value);
    }
  }

  try {
    calc = calc.replace(/,/g,".");    
    let finalValue = eval(calc);
    finalValue = (finalValue + '').replace('.', ',');
    layer.text = finalValue;
  } catch (e) {    
    showError(layer, e)
  }
}

let showError = function (layer, e) {
  UI.message(`Syntax error: ${e}`);
  layer.text = '!ERR';
  return;
}

var changedName = function (context) {
  console.log("Changed name!");
  calculate();
}

var changedText = function (context) {
  
  let layerName = Sketch.fromNative(context.actionContext.layer).name;
  let currentPage = Sketch.getSelectedDocument().selectedPage;
  let foundLayers = deepSearch(currentPage.layers, "{"+layerName+"}");
  foundLayers = foundLayers.concat(deepSearch(currentPage.layers, "{*"+layerName+"}")); // Uh
  for (let i=0; i<foundLayers.length; i++) {
    processLayer(foundLayers[i]);
  }

}

var deepSearch = function(layers, string) {
  let foundLayers = [];
  for (let i=0; i<layers.length; i++) {    
    let currentLayer = layers[i];
    if ((currentLayer.type === TYPES.GROUP)||(currentLayer.type === TYPES.ARTBOARD)){
      foundLayers = foundLayers.concat(deepSearch(currentLayer.layers, string));
    } else {
      if (currentLayer.name.includes(string)) {
        foundLayers.push(currentLayer);
      }
    }    
  }
  return foundLayers;
}

