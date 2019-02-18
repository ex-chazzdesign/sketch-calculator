let Sketch = require('sketch');
let UI = require('sketch/ui')
let Artboard = require('sketch/dom').Artboard

const REGEX_FIELDS = /\{([A-Z]\d{1,2})\}/gm;
const TYPES = {
  ARTBOARD: 'Artboard',
  GROUP: 'Group'
} 

let calculate = function (context) {

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

let searchLayersByName = function (name) {
  return Sketch.getSelectedDocument().getLayersNamed(name);
}

let processLayer = function (layer) {
  let artboard = layer.getParentArtboard();

  let str = layer.name.substring(1);  
  let calc = str

  while ((m = REGEX_FIELDS.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === REGEX_FIELDS.lastIndex) {
      REGEX_FIELDS.lastIndex++;
    }

    let token = m[1] // This is: A1
    let foundLayers = searchLayersByName(token);

    if (foundLayers && foundLayers.length) {
      let foundLayer = foundLayers[0];
      let value = +foundLayer.text; // Transform text to number
      calc = calc.replace(new RegExp(m[0], 'g'), value);
    }
  }

  try {
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

let changedText = function (context) {
  console.log('Text changed');
  calculate();
}
