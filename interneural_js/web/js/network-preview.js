//global for network preview
var networkPreview = makeNetworkPreview();
function makeNetworkPreview() {

  var element;
  var context;

  var WIDTH = 100;
  var HEIGHT = 100;

  // init by setting the root element
  function init(selector) {
    // set up elements
    element = $(selector);
    element.append(createHeader());
    element.append(createCanvas());
    return true;
  }

  function createCanvas() {
    var canvas = $('<canvas/>');
    canvas.prop('width', WIDTH)
    canvas.prop('height', HEIGHT)
    canvas.addClass("preview-canvas");
    context = canvas[0].getContext('2d');
    return canvas;
  }

  function createHeader() {
    var header = $('<button/>',
    {
      text: 'output preview',
      click: function () {
        console.log("collapse?");
      }
    });
    header.addClass("header");
    return header;
  }

  // http://beej.us/blog/data/html5s-canvas-2-pixel/
  function paintCanvas(data) {
    console.log(data);
    var imageData = context.createImageData(WIDTH, HEIGHT);

    // draw random dots
    for (var index = 0; index < WIDTH*HEIGHT; index++) {
      var x = index%WIDTH;
      var y = Math.floor(index/WIDTH);

      var r = data[index][0];
      var g = data[index][1];
      var b = data[index][2];

      setPixel(imageData, x, y, r, g, b, 255); // 255 opaque
    }

    // copy the image data back onto the canvas
    context.putImageData(imageData, 0, 0); // at coords 0,0
  }

  function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
  }

  // expose public functions
  return {
    init: function (selector) {
      return init(selector)
    },
    paintCanvas: function (data) {
      return paintCanvas(data)
    }
  }
}
