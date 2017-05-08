/**
 * Created by Linh Do on 30.03.2017.
 */

//global for training data widget
var trainingData = makeTrainingData();
function makeTrainingData() {

    var element; // widget root object
    var trainCallback; // callback for widget action

    var samples = []; // stores all the training samples
    var iterations = 10; // num of iterations to go over

    var svg; // d3 canvas root
    var sample; // d3 data

    var isTraining = false; // ongoing training
    var isWaitingForResponse = false; // check if still awaiting response
    var trainingButton;

    // some constants for the widget
    var width = 250;
    var height = 250;
    var radius = 5; // circle radius

    colors = ["red", "green", "blue"];
    colorCodes = ["#d62728", "#2ca02c", "#1f77b4"];
    picked = 0;

    var TRAINING_TEXT = 'train network';
    var STOP_TRAINING_TEXT = 'stop training';

    // init by setting the root element and a callback for the buttons
    function init(selector, callback) {
        trainCallback = callback;
        // set up elements
        element = $(selector);
        element.append(createHeader());
        element.append(createCanvas(selector));
        element.append(createIterationSlider());
        element.append(createColorSelect());
        trainingButton = createTrainButton()
        element.append(trainingButton);
        element.append(createClearButton());
        element.append(createTrainTestButton());
        element.append(createTrainTestButton50());
        element.append(createTrainTestButton100());

        return true;
    }

    // create and set up the d3 canvas element
    function createCanvas(selector) {
        var canvasElement = $("<div/>");
        svg = d3.select(selector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("click", addSamplePoint);

        var borderPath = svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .style("stroke", "#373737")
            .style("fill", "none")
            .style("stroke-width", 1);

        sample = svg.selectAll(".sample-node");
        update();
        return canvasElement;
    }

    function createColorSelect() {
        var colorElement = $("<div/>", {
            class : "color-picks"
        });
        $.each(colors, function(colorIndex, colorName) {
            var btnID = "training-color-" + colorName;

            // create the invisible radio button
            var radioBtn = $('<input />', {
                id: btnID,
                type : "radio",
                name : "trainingColor",
                value : colorIndex
            }).appendTo(colorElement);
            radioBtn.change(function(e) {
                picked = parseInt(e.target.value);
            });
            // check button by default
            if (colorIndex == picked) radioBtn.prop("checked", true);
            // create a label to style the button
            var labelContent = $("<div />", {
                class : "color-pick-" + colorName
            });
            $("<label />", {
                for : btnID,
                html : labelContent,
            }).insertAfter(radioBtn);
        });
        return colorElement;
    }

    function createIterationSlider() {
        var slider = $('<input/>');
        slider.prop('type', 'range');
        slider.prop('min', 1);
        slider.prop('max', 150);
        slider.prop('value', iterations);

        slider.addClass("iteration-slider");
        slider.on("input", function() {
            updateIterations(this.value);
        }).on("change", function() {
            updateIterations(this.value);
        });
        return slider;
    }

    function updateIterations(value) {
        updateTrainingButtonText();
        iterations = parseInt(value);
    }

    // adds a new sample point to the canvas
    function addSamplePoint() {
        if (d3.event.defaultPrevented) return;
        var point = d3.mouse(this);
        var x = Math.min(Math.max(point[0], 0 + radius), width - radius);
        var y = Math.min(Math.max(point[1], 0 + radius), height - radius);
        var rgbArr = [[255,0,0],[0,255,0],[0,0,255]];
        var samplePoint = {x: x, y: y, r: rgbArr[picked][0], g: rgbArr[picked][1], b: rgbArr[picked][2], color:picked};
        samples.push(samplePoint)
        update();
    }

    // update method for new d3 canvas objects
    function update() {
        sample = sample.data(samples);
        sample.enter().append("circle")
            .attr("class", "sample-node")
            .attr("r", radius)
            .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"})
            .style("fill", function(d) { return colorCodes[d.color]; })
            .style("cursor", "pointer")
            .call(drag);
        sample.exit().remove();
    }

    // http://stackoverflow.com/questions/19911514/how-can-i-click-to-add-or-drag-in-d3
    var drag = d3.behavior.drag().on("drag", dragmove);
    function dragmove() {
        // update the position of the graphic
        var x = Math.min(Math.max(d3.event.x, 0 + radius), width - radius);
        var y = Math.min(Math.max(d3.event.y, 0 + radius), height - radius);
        d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
        // update the actual datum
        var sample = d3.select(this).datum();
        sample.x = x;
        sample.y = y;
    }

    function createHeader() {
        var header = $('<button/>',
            {
                text: 'training',
                click: function () {
                    console.log("collapse?");
                }
            });
        header.addClass("header");
        return header;
    }

    // callback on click
    function createTrainButton() {
        var button = $('<button/>',
            {
                text: TRAINING_TEXT + "(x" + iterations + ")",
                click: function () {
                    // toggle training
                    if (!isTraining && !isWaitingForResponse) {
                        isWaitingForResponse = true;
                        trainCallback();
                    }
                    isTraining = !isTraining;
                    updateTrainingButtonText();
                    $(this).toggleClass('good-button bad-button');
                }
            });
        button.addClass('good-button');
        return button;
    }
    function updateTrainingButtonText(){
        trainingButton.text(isTraining ? STOP_TRAINING_TEXT + "(x" + iterations + ")": TRAINING_TEXT + " (x" + iterations + ")");
    }

    function createClearButton() {
        var button = $('<button/>',
            {
                text: 'clear samples',
                click: function () {
                    samples = [];
                    update();
                }
            });
        button.addClass('bad-button');
        return button;
    }

    // returns the given sample data
    function getSamples() {
        return samples;
    }

    // reacts to server response depending on training status
    function gotResponse() {
        isWaitingForResponse = false;
        if (isTraining) {
            isWaitingForResponse = true;
            trainCallback();
        }
    }

    //for testing
    function createTrainTestButton() {
        var button = $('<button/>',
            {
                text: 'trainTest',
                click: function () {
                    networkPreview.paintCanvas(neuralNetwork.trainTest(1));
                }
            });
        button.addClass('bad-button');
        return button;
    }
    //for testing
    function createTrainTestButton50() {
        var button = $('<button/>',
            {
                text: 'trainTest50',
                click: function () {
                    networkPreview.paintCanvas(neuralNetwork.trainTest(50));
                }
            });
        button.addClass('bad-button');
        return button;
    }
    //for testing
    function createTrainTestButton100() {
        var button = $('<button/>',
            {
                text: 'trainTest100',
                click: function () {
                    networkPreview.paintCanvas(neuralNetwork.trainTest(100));
                }
            });
        button.addClass('bad-button');
        return button;
    }

    // expose public functions
    return {
        init: function (selector, callback) {
            return init(selector, callback)
        },
        getSamples: function () {
            return getSamples();
        },
        getIterationValue: function() {
            return iterations;
        },
        gotResponse: function () {
            return gotResponse();
        }
    }
}

