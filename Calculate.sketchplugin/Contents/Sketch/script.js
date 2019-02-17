var Sketch = require('sketch');
var UI = require('sketch/ui')
var Artboard = require('sketch/dom').Artboard

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

  while(str.includes("{")) {
    var token = str.substring(str.indexOf("{")+1, str.indexOf("}"));

    // TO-DO: buscar solo en el mismo artboard, no en todo el documento
    var foundLayers = Sketch.getSelectedDocument().getLayersNamed(token);
    var foundLayer = null;

    if (foundLayers.length == 0) {
      UI.message(token+" not found :-(");
      layer.text = "ERR";
      return;
    } else {  
      for (var i=0; i<foundLayers.length; i++) {
        var l = foundLayers[i];
        if (l.getParentArtboard().id == artboard.id) {
          foundLayer = l;
        }        
      }

      if (foundLayer == null) {
        UI.message(token+" not found :-(");
        layer.text = "ERR";
        return;
      }

      // foundLayer = foundLayers[0];
      //console.log(foundLayer);
    }

    var value = foundLayer.text;
    str = str.substring(0,str.indexOf("{"))+value+str.substring(str.indexOf("}")+1,str.length);  
  }

  var finalValue = "";
  try {
    // Sustituimos "," por "." antes de pasarlo al eval
    str = str.replace(/,/g,".");    
    finalValue = eval(str);

  } catch (e) {    
    UI.message('Syntax error: '+str);
    layer.text = "ERR";
    return;    
  }

  finalValue = (finalValue+"").replace(".",",");
  layer.text = finalValue;
  
}