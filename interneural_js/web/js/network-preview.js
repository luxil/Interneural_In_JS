//global for network preview
var networkPreview = makeNetworkPreview();
function makeNetworkPreview() {

    var element;
    var context;

    var WIDTH = 200;
    var HEIGHT = 200;
    var imageData;

    // init by setting the root element
    function init(selector) {
        // set up elements
        element = $(selector);
        element.append(createHeader());
        element.append(createCanvas());
        element.append(createGetPixelView());
        element.append(createRgbOutputPreview());
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

    function createGetPixelView() {
        var container = $('<div/>', {});

        var xContainer = $('<div/>', {
            class:"posPrevContainer"
        }).appendTo(container);
        var xLabel = $('<div/>', {
                text: "x: ",
                class: "prevPosLabel"
            }).appendTo(xContainer)
        ;

        var xInput = $('<input/>', {
                value: "100",
                id: "xPosInputPrev",
                class: "prevPosInput"
            }).appendTo(xContainer)
            .on('input', function () {enforceInt($(this));
                updateRgbPrew();
            })
            .on('focusout', function () {noEmptyOnFocusOut($(this));})
        ;

        var yContainer = $('<div/>', {
            class:"posPrevContainer"
        }).appendTo(container);
        var yLabel = $('<div/>', {
                text: "y: ",
               class: "prevPosLabel"
            }).appendTo(yContainer)
        ;

        var yInput = $('<input/>', {
                value: "100",
                id: "yPosInputPrev",
                class: "prevPosInput"
            }).appendTo(yContainer)
            .on('input', function () {
                enforceInt($(this));
                updateRgbPrew;
            })
            .on('focusout', function () {noEmptyOnFocusOut($(this));})
        ;

        return container;
    }

    function createRgbOutputPreview(){
        var container = $("<div/>", {
            id: "rgbOutputPreviewContainer"
        });
        var rLabel = $('<div/>', {
                text: "r: ",
                class: "rgbLabel"
            }).appendTo(container)
        ;
        var rLabelValue = $('<div/>', {
                text: " - ",
                id: "rLabelValue"
            }).appendTo(container)
        ;
        var gLabel = $('<div/>', {
                text: "g: ",
                class: "rgbLabel"
            }).appendTo(container)
        ;
        var gLabelValue = $('<div/>', {
                text: " - ",
                id: "gLabelValue"
            }).appendTo(container)
        ;
        var bLabel = $('<div/>', {
                text: "b: ",
                class: "rgbLabel"
            }).appendTo(container)
        ;
        var bLabelValue = $('<div/>', {
                text: " - ",
                id: "bLabelValue"
            }).appendTo(container)
        ;

        return container;
    }

    function updateRgbPrew(){
        var xValue = parseInt($("#xPosInputPrev").val());
        var yValue = parseInt($("#yPosInputPrev").val());
        var rgb = getRgbForPixel(xValue, yValue);
        if(rgb!= undefined) {
            $("#rLabelValue").text(rgb[0]);
            $("#gLabelValue").text(rgb[1]);
            $("#bLabelValue").text(rgb[2]);
        }
        else{
            $("#rLabelValue").text("-");
            $("#gLabelValue").text("-");
            $("#bLabelValue").text("-");
        }
    }

    // http://beej.us/blog/data/html5s-canvas-2-pixel/
    function paintCanvas(data) {
        imageData = context.createImageData(WIDTH, HEIGHT);

        // draw random dots
        for (var index = 0; index < WIDTH * HEIGHT; index++) {
            var x = index % WIDTH;
            var y = Math.floor(index / WIDTH);

            var r = data[index][0];
            var g = data[index][1];
            var b = data[index][2];

            setPixel(imageData, x, y, r, g, b, 255); // 255 opaque
        }
        // copy the image data back onto the canvas
        context.putImageData(imageData, 0, 0); // at coords 0,0
        // var x = 50;
        // var y = 50;
        // $("#getPixelView").text(x + ", " + y + ": " + getRgbForPixel(x,y));
        updateRgbPrew();
    }

    function getRgbForPixel(x, y) {
        if (imageData != undefined) {
            var index = (x + y * imageData.width) * 4;
            var r = imageData.data[index + 0];
            var g = imageData.data[index + 1];
            var b = imageData.data[index + 2];
            // var a = imageData.data[index + 3];

            return [r, g, b];
        }
    }

    function setPixel(imageData, x, y, r, g, b, a) {
        index = (x + y * imageData.width) * 4;
        imageData.data[index + 0] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    }

    //enforce that only an integer >= 200 is accepted
    function enforceInt(element) {
        element.val(element.val().replace(/[^\d]+/g, ''));
        element.val(function () {
            return (element.val() >= 200 ) ? 200 : element.val();
        })
    }

    //enforce that the value of the input can't be empty (for focusout)
    function noEmptyOnFocusOut(element) {
        element.val(function () {
            return (element.val() === '') ? 0 : element.val();
        })
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
