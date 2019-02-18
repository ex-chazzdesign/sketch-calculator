var Sketch = require('sketch');
var UI = require('sketch/ui')
var Artboard = require('sketch/dom').Artboard

const REGEX_FIELDS = /\{([A-Z]\d{1,2})\}/gm;

var calculate = function(context) {

  var currentPage = Sketch.getSelectedDocument().selectedPage;
  var layers = currentPage.layers;
  for (var i=0; i < layers.length; i++) {
    if (layers[i].type == 'Artboard') {      
      processGroup(layers[i]);
    } else {      
      // Lo que no está en ningún artboard por ahora no lo procesamos
      // console.log(layers[i].name+" no es un artboard");
    }
  }
}

var processGroup = function(group) {

  var layers = group.layers;
  for (var i=0; i < layers.length; i++) {

    if (layers[i].type == 'Group'){
      processGroup(layers[i]);      
    }

    if (layers[i].name.startsWith("=")) {
      processLayer(layers[i]);
    }
  }
}

var processLayer = function(layer) {
  var artboard = layer.getParentArtboard();

  var str = layer.name.substring(1, layer.name.length);  
  var calc = str

  while ((m = REGEX_FIELDS.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === REGEX_FIELDS.lastIndex) {
      REGEX_FIELDS.lastIndex++;
    }

    let token = m[1] // This is: A1
    var foundLayers = Sketch.getSelectedDocument().getLayersNamed(token);

    if (foundLayers && foundLayers.length) {
      let foundLayer = foundLayers[0];
      let value = +foundLayer.text; // Transform text to number
      calc = calc.replace(new RegExp(m[0], 'g'), value);
    }
  }

  let finalValue = "";

  try {
    finalValue = eval(calc);
  } catch (e) {    
    UI.message('Syntax error: '+ str + e);
    layer.text = "ERR";
    return;
  }

  finalValue = (finalValue + '').replace('.', ',');
  layer.text = finalValue;
}

function changedText(context) {
  console.log("Cambiado texto");
  calculate();
}
