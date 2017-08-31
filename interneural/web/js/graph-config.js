//global for network graph config
var graphConfig = makeGraphConfig();
function makeGraphConfig() {

  var INPUT_NODES = 2; // input is always 2D, since we have coordinates
  var OUTPUT_NODES = 3; // output is always 3D for RGB values
  var MAX_NEURONS = 9; // maximun number of neurons per layer
  var MAX_LAYERS = 6; // maximun number of layers

  var element;
  var layersElement;
  var applyCallback;
  var addButton;

  // since the barration plugin has no convenient way to get values
  // without the event, we need to keep track of them here
  var layers = [];
  var values = [];


  // init by setting the root element and a callback for our button
  function init(selector, callback) {
    applyCallback = callback;
    // set up elements
    element = $(selector);
    element.append(createHeader());
    layersElement = $("<div/>");
    element.append(layersElement);
    addAddButton(); // consistency...
    addApplyButton();
    // init the input and output layer with default values and readonly
    initDefaultLayers();
    return true;
  }

  function createHeader() {
    var header = $('<button/>',
    {
      text: 'network topology',
      click: function () {
        console.log("collapse?");
      }
    });
    header.addClass("header");
    return header;
  }

  function initDefaultLayers() {
    // input player always has two nodes
    var firstLayer = createLayer(INPUT_NODES, true);
    layersElement.append(firstLayer);
    layers.push(firstLayer);
    values.push(INPUT_NODES);

    // output layer always has three nodes
    var lastLayer = createLayer(OUTPUT_NODES, true);
    layersElement.append(lastLayer);
    layers.push(lastLayer);
    values.push(OUTPUT_NODES);
  }

  function addLayer(layer, initial) {
    $(layers[layers.length-1]).before(layer);
    layers.splice(-1, 0, layer);
    values.splice(-1, 0, initial);
    // custom layers may not exceed 5
    if (layers.length > MAX_LAYERS) {
      addButton.hide();
    }
  }

  function createLayer(initial, readonly) {
    var select = createSelect(MAX_NEURONS);
    var layer = $("<div/>");
    layer.addClass("layer");
    $(layer).append(select);
    // first and last layer are readonly
    if (!readonly) $(layer).append(createDeleteButton());
    applyBarrating(select, initial, readonly);
    return layer;
  }

  // creates small delete button to remove layers
  function createDeleteButton() {
    var button = $('<button/>',
    {
      text: 'X',
      click: function (event) {
        var idx = $(event.target).closest('.layer').index();
        removeLayer(idx);
      }
    });
    button.addClass("delete-button");
    return button;
  }

  function createSelect(maxOption) {
    var select = $("<select/>")
    for (var i = 1; i < maxOption+1; i++) {
      select.append($("<option/>").attr("value", i).text(i));
    }
    return select;
  }

  function applyBarrating(selectElement, initial, readonly) {
    selectElement.barrating({
      theme: 'bars-reversed',
      showSelectedRating: false,
      showValues: false,
      readonly: readonly,
      initialRating: initial,
      onSelect: function(value, text, event) {
        if (typeof(event) !== 'undefined') {
          // rating was clicked by a user
          var idx = $(event.target).closest('.layer').index();
          values[idx] = parseInt(value);
        }
      }
    });
  }

  function removeAll() {
    for (var i=layers.length-1; i>0; i--) {
      removeLayer(i);
    }
  }

  function removeLayer(index) {
    // make sure we dont remove the default layers
    if (index >= 1 && index < layers.length-1) {
      var layer = layers[index];
      layer.find('select').barrating('destroy');
      layer.remove();
      layers.splice(index, 1);
      values.splice(index, 1);
    }
    if (layers.length <= MAX_LAYERS) {
      addButton.show();
    }
  }

  // callback on click
  function addApplyButton() {
    var button = $('<button/>',
    {
      text: 'apply',
      click: function () { applyCallback(); }
    });
    button.addClass("good-button");
    element.append(button);
  }

  function addAddButton() {
    addButton = $('<button/>',
    {
      text: 'add layer',
      click: function () {
        addLayer(createLayer(1, false), 1);
      }
    });
    addButton.addClass("add-button");
    element.append(addButton);
  }

  // return an array containing all network layer values values
  function getConfig() {
    return values;
  }

  // expose public functions
  return {
    init: function (selector, callback) {
      return init(selector, callback)
    },
    addLayer: function (initial) {
      return addLayer(createLayer(initial, false), initial)
    },
    removeLayer: function(index) {
      return removeLayer(index)
    },
    getConfig: function () {
      return getConfig()
    },
    removeAll: function () {
      return removeAll()
    }
  }
}
