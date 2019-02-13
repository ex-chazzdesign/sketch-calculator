var Sketch = require('sketch');
var UI = require('sketch/ui')

var calculate = function(context) {

  var currentPage = Sketch.getSelectedDocument().selectedPage;
  var layers = currentPage.layers;
  for (var i=0; i < layers.length; i++) {
    if (layers[i].name.startsWith("=")) {
      processLayer(layers[i]);
    }
  }
}

var processLayer = function(layer) {  
  var str = layer.name.substring(1, layer.name.length);  

  while(str.includes("{")) {
    var token = str.substring(str.indexOf("{")+1, str.indexOf("}"));
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