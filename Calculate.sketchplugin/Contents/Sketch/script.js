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

  var str = layer.name.substring(1, layer.name.length);  
  var artboard = layer.getParentArtboard();

  while(str.includes("{")) {
    var token = str.substring(str.indexOf("{")+1, str.indexOf("}"));

    // TO-DO: buscar solo en el mismo artboard, no en todo el documento
    var foundLayers = Sketch.getSelectedDocument().getLayersNamed(token);

    if (foundLayers.length == 0) {
      UI.message('No se ha encontrado '+token);
      layer.text = "ERR";
      return;
    }
    var value = foundLayers[0].text;    
    str = str.substring(0,str.indexOf("{"))+value+str.substring(str.indexOf("}")+1,str.length);  
  }

  var finalValue = "";
  try {
    finalValue = eval(str);
  } catch (e) {    
    UI.message('Error de sintaxis: '+str);
    layer.text = "ERR";
    return;    
  }

  layer.text = finalValue+"";
  
}