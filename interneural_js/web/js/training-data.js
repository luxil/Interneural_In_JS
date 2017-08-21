//global for training data widget
var trainingData = makeTrainingData();
function makeTrainingData() {

    var element; // widget root object
    var trainCallback; // callback for widget action
    var applyMaxItCallback;
    var $maxIterationsInput;
    var maxIterationsButton;

    var samples = []; // stores all the training samples
    var iterations = 10; // num of iterations to go over
    var selPointId=-1;  //id of the selected point
    var bSamplePointClicked = false;  //to check whether mouseclick was on a samplepoint
    var maxIterations;

    var svg; // d3 canvas root
    var sample; // d3 data

    var isTraining = false; // ongoing training
    var isWaitingForResponse = false; // check if still awaiting response
    var trainingButton;

    // some constants for the widget
    var width = 200;
    var height = 200;
    var radius = 5; // circle radius

    colors = ["red", "green", "blue"];
    colorCodes = ["#d62728", "#2ca02c", "#1f77b4"];
    picked = 0;

    var TRAINING_TEXT = 'train network';
    var STOP_TRAINING_TEXT = 'stop training';

    // init by setting the root element and a callback for the buttons
    function init(selector, callback, callback2) {
        trainCallback = callback;
        applyMaxItCallback = callback2;
        // set up elements
        element = $(selector);
        element.append(createHeader());
        element.append(createCanvas(selector));
        element.append(createEditASample());
        element.append(createColorSelect());
        element.append(createIterationSlider());
        trainingButton = createTrainButton()
        element.append(trainingButton);
        element.append(addMaxIterationsConf());
        element.append(createSamplesOption());
        return true;
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

    // create and set up the d3 canvas element
    function createCanvas(selector) {
        var canvasElement = $("<div/>");
        svg = d3.select(selector).append("svg")
            .attr("width", width+40)
            .attr("height", height+40)
            .on("click", addSamplePoint)
        ;

        //Create the Scale we will use for the Axis
        var axisScale = d3.scale.linear().domain([0, width]).range([0, width]);
        var yAxisScale = d3.scale.linear().domain([0, height]).range([0, height]);

        // Create the Axis
        // var xAxis = d3.svg.axis().scale(axisScale);
        var xAxis = d3.svg.axis()
            .scale(axisScale)
            .tickValues([50,100,150,200])
            .tickSize(10, 0)
        ;

        var yAxis = d3.svg.axis()
            .orient("right")
            .scale(yAxisScale)
            .tickValues([50,100,150,200])
            .tickSize(10, 0)
        ;

        //Create an SVG group Element for the Axis elements and call the xAxis function
        // var xAxisGroup =
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll(".tick")
            .style("stroke", "black")
        .selectAll(".tick text")
            .style("text-anchor", "start")
            .attr("x", -13)
            .attr("y", 15)
            .attr("font-size", "12")

        ;

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + height + ",0)")
            .call(yAxis)
            .selectAll(".tick")
                .style("stroke", "black")
            .selectAll(".tick text")
                .style("text-anchor", "start")
                .attr("x", 13)
                .attr("y", -5)
            .attr("font-size", "12")
        ;


        var borderPath = svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .style("stroke", "#373737")
            .style("fill", "none")
            .style("stroke-width", 1);

        sample = svg.selectAll(".sample-node");
        updateD3SamplePoints();
        return canvasElement;
    }

    function createEditASample() {
        var editASampleDiv= $("<div/>",{
            id : "samplesConfigDiv"
        });

        var sampleLabel = $('<div/>', {
                text: "sample",
                id: 'sampleLabel'
            }).appendTo(editASampleDiv)
        ;

        var xLabel = $('<div/>', {
                text: "x",
                class: 'xPosLabel'
            }).appendTo(editASampleDiv)
        ;

        var xInput = $('<input/>', {
                value: "-",
                readOnly: true,
                id: "xPosInput"
            }).appendTo(editASampleDiv)
        ;

        var yLabel = $('<div/>', {
                text: "y",
                class: 'yPosLabel'
            }).appendTo(editASampleDiv)
        ;

        var yInput = $('<input/>', {
                value: "-",
                readOnly: true,
                id: "yPosInput"
            }).appendTo(editASampleDiv)
        ;

        var deleteSampleButton = $('<button/>', {
                text: "delete sample",
                id: 'deleteSamplePointButton',
                click: function () {
                    if(selPointId!=-1){
                        samples[selPointId]=samples[samples.length-1];  //replace sample with the selected index with the last sample of the array
                        samples.splice((samples.length-1),1);   //delete last sample and reduce the length of the array
                        selPointId = -1;
                        updateD3SamplePointsFixed();
                    }
                }
            }).appendTo(editASampleDiv)
        ;

        var canvasSampleList= $("<div/>",
            {
                id: 'sampleList',
            }).appendTo(editASampleDiv)
        ;

        var selectList = $("<select/>"
            ,{id: "selectList"
        }).attr("size","8").appendTo(canvasSampleList)      //number of size -> how many samples should be listed
        ;

        return editASampleDiv;
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

    // callback on click
    function createTrainButton() {
        var button = $('<button/>',
            {
                id: "trainButton",
                text: TRAINING_TEXT + "(x" + iterations + ")",
                click: function () {
                    isTraining = !isTraining;
                    updateTrainingButtonText();
                    $(this).toggleClass('good-button bad-button');
                    // toggle training
                    if (isTraining && !isWaitingForResponse) {
                        isWaitingForResponse = true;
                        //code before the pause
                        trainCallback();
                    }

                }
            });
        button.addClass('good-button');
        return button;
    }
    function updateTrainingButtonText(){
        trainingButton.text(isTraining ? STOP_TRAINING_TEXT + "(x" + iterations + ")": TRAINING_TEXT + " (x" + iterations + ")");
    }

    function createSamplesOption() {
        var samplesOption = $("<div/>", {
            class : "sample-edits"
        });

        var button2 = $('<button/>',
            {
                text: "load samples",
                id: 'loadSamples',
                click: function () {
                    samples = JSON.parse(localStorage.getItem('samples'));
                    selPointId = -1;
                    updateD3SamplePointsFixed();
                    selectSample(samples.length-1);
                }
            }).appendTo(samplesOption)
        ;

        var button3 = $('<button/>',
            {
                text: "save samples",
                id: 'saveSamples',
                click: function () {
                    localStorage.setItem('samples', JSON.stringify(samples));
                }
            }).appendTo(samplesOption)
        ;

        var button = $('<button/>',
            {
                text: 'clear samples',
                class: 'bad-button',
                click: function () {
                    selPointId =-1;
                    clearSamples();
                }
            }).appendTo(samplesOption)
        ;

        return samplesOption;
    }

    function updateIterations(value) {
        updateTrainingButtonText();
        iterations = parseInt(value);
    }

    // adds a new sample point to the canvas
    function addSamplePoint() {
        //add sample point if mouseclick was not on a sample point circle
        if(bSamplePointClicked === false) {
            if (d3.event.defaultPrevented) return;
            var point = d3.mouse(this);
            var x = Math.floor(Math.min(Math.max(point[0], 0 + radius), width - radius));
            var y = Math.floor(Math.min(Math.max(point[1], 0 + radius), height - radius));
            var samplePoint = {x: x, y: y, color: picked};
            samples.push(samplePoint)
            updateD3SamplePoints();
            selectSample(samples.length-1);
        }   else {
            bSamplePointClicked = false;
        }
    }

    // update method for new d3 sample point
    function updateD3SamplePoints() {

        sample = sample.data(samples);
        sample.enter().append("circle")
            .attr("class", "sample-node")
            .attr("r", radius)
            .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"})
            .attr("id", function (d,i) {
                return "c_"+i;
            })
            .attr("nr", function (d,i) {
                return i;})
            .on("mouseover", handleMouseOverSample)   //mouseover text (tooltip): http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
            .on("mousedown", handleMouseDownSample)
            .on("mouseout", handleMouseOutSample)
            .style("fill", function(d) { return colorCodes[d.color]; })
            .style("cursor", "pointer")
            .style("stroke-width", (radius/5*2))    // set the stroke width
            .style("stroke", function(d) { return colorCodes[d.color]; })      // set the stroke line colour
            .call(drag);
        sample.exit().remove();
        updateSampleList();
    }

    function updateD3SamplePointsFixed() {
        var tSamples = samples; //tSamples = temporary Samples
        clearSamples();     //to update the visualization of the samples with d3 first all samples have to be deleted
        // updateSampleList();
        samples = tSamples;
        updateD3SamplePoints();
    }

    // http://stackoverflow.com/questions/19911514/how-can-i-click-to-add-or-drag-in-d3
    var drag = d3.behavior.drag().on("drag", dragmove);
    function dragmove() {
        // updateD3SamplePoints the position of the graphic
        var x = Math.min(Math.max(d3.event.x, 0 + radius), width - radius);
        var y = Math.min(Math.max(d3.event.y, 0 + radius), height - radius);
        d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
        // updateD3SamplePoints the actual datum
        var sample = d3.select(this).datum();
        sample.x = Math.floor(x);
        sample.y = Math.floor(y);

        // updateD3SamplePoints position info of the sample point
        var xPos=Math.floor(x)+15;
        var yPos=Math.floor(y);
        if(xPos>120)  xPos=x-80;
        if(yPos<120)  yPos=y+20;
        d3.select("#textSample").attr({  // Create an id for text so we can select it later for removing on mouseout
            x: xPos,
            y: yPos
        })
            .text(function() {
                return Math.floor(x) + "/" + Math.floor(y);  // Value of the text
            });

        $("#xPosInput").val(Math.floor(samples[selPointId].x));
        $("#yPosInput").val(Math.floor(samples[selPointId].y));
        updateSampleList();
    }

    // returns the given sample data
    function getSamples() {
        return samples;
    }

    // reacts to server response depending on training status
    function gotResponse(bMaxIterationsReached) {
        isWaitingForResponse = false;
        if (isTraining&&!bMaxIterationsReached) {
            isWaitingForResponse = true;
            $("#trainButton").removeClass().addClass();
            $("#trainButton").addClass("bad-button");
            //code before the pause
            trainCallback();
        }else{
            isTraining = false;
            updateTrainingButtonText();
            $("#trainButton").removeClass().addClass();
            $("#trainButton").addClass("good-button");
        }
    }


    /**
     *
     * Create Event Handlers for mouse
     */
    function handleMouseOverSample(d, i) {

        d3.select(this).attr({r: radius * 1.5});    //change sample point -> radius *1.5 when hovered

        var x = Math.floor(samples[d3.select(this).attr("nr")].x);
        var y = Math.floor(samples[d3.select(this).attr("nr")].y);

        // Specify where to put label of positioninfo text
        var xPos=x+15;
        var yPos=y;
        if(xPos>120)  xPos=x-80
        if(yPos<120)  yPos=y+20

        svg.append("text").attr({
            id: "textSample",  // Create an id for text so we can select it later for removing on mouseout for example
            x: xPos,
            y: yPos
        })
            .text(function() {
                return x + "/" + y;  // Value of the text
            });

        //blur() -> unfocus inputfields; important for drag'n'drop samples
        if ($("#xPosInput").is(':focus')) $("#xPosInput").blur();
        if ($("#yPosInput").is(':focus')) $("#yPosInput").blur();
    }

    function handleMouseOutSample(d, i) {
        //change sample point -> normal radius when not hovered anymore
        d3.select(this).attr({r: radius});
        d3.select(this).attr({r: radius});
        removeRect("#textSample");
    }

    function handleMouseDownSample(d, i) {
        //mouseclick was on a sample point
        bSamplePointClicked = true;
        selectSample(d3.select(this).attr("nr"));
    }

    function removeRect(id){
        // Select text by id and then remove
        d3.selectAll(id).remove();  // Remove text location

    }

    function clearSamples() {
        if(selPointId===-1){
            $("#yPosInput").attr({"readOnly":true, "value":"-"});
            $("#yPosInput").val("-");
            $("#xPosInput").attr({"readOnly":true, "value":"-"});
            $("#xPosInput").val("-");
        }
        samples = [];
        updateD3SamplePoints();
    }

    function selectSample(newIndex){
        if(newIndex!=-1) {
            if (selPointId != -1) {
                //change old selected samplepoint -> normal radius
                d3.select("#c_" + selPointId)
                    .attr({r: radius})
                    .style("stroke", d3.select("#c_" + selPointId).style("fill"))      // set the line colour
                ;
            }

            //change new selected sample point
            d3.select("#c_" + newIndex)
                .attr({r: radius})
                .style("stroke", "black")
            ;
            selPointId = newIndex;      //updateD3SamplePoints ID of the selected sample point

            $("#yPosInput").attr("readOnly", false);
            $("#xPosInput").attr("readOnly", false);
            $("#xPosInput").val(Math.floor(samples[selPointId].x));
            $("#yPosInput").val(Math.floor(samples[selPointId].y));

            $("#xPosInput").on('input', function () {enforceInt($(this));});
            $("#yPosInput").on('input', function () {enforceInt($(this));});
            $("#xPosInput").on('focusout', function () {noEmptyOnFocusOut($(this));});
            $("#yPosInput").on('focusout', function () {noEmptyOnFocusOut($(this));});

            $("#selectList").val(""+selPointId);
        }
    }

    function updateSampleList() {
            $("#selectList").empty();

            samples.forEach(function (entry , i) {
                var option = $("<option/>", {
                    id: "opt_" + i,
                    value: i,
                    text: i + " (" + Math.floor(entry.x) + " / " +Math.floor(entry.y) + ")",
                });
                option.on("click", function () {selectSample($(this).val());});
                option.css("background-color", colorCodes[entry.color])
                option.css("color", "white")

                $("#selectList").append(option);
            });
    }

    //enforce that only an integer under width+1 is accepted
    function enforceInt(element) {
        element.val(element.val().replace(/[^\d]+/g, ''));
        element.val(function () {
            return (element.val() >= width ) ? width : element.val();
        })
        changePosOfSelected();
    }

    //enforce that the value of the input can't be empty (for focusout)
    function noEmptyOnFocusOut(element) {
        element.val(function () {
            return (element.val() === '') ? 0 : element.val();
        })
        changePosOfSelected();

    }

    function changePosOfSelected() {
        if(selPointId!=-1) {
            samples[selPointId].x = $("#xPosInput").val() != "" ? Math.floor(parseInt($("#xPosInput").val())) : 0;
            samples[selPointId].y = $("#yPosInput").val() != "" ? Math.floor(parseInt($("#yPosInput").val())) : 0;
            d3.select("#c_" + selPointId)
                .attr({r: radius})
                .style("stroke", "black")
                .attr("transform", "translate("+ samples[selPointId].x +"," + samples[selPointId].y + ")")
            ;
            $("#opt_" + selPointId).text(selPointId + " (" + samples[selPointId].x + " / " + samples[selPointId].y + ")");
        }
    }

    function getMaxIterationConfig() {
        return maxIterations;
    }

    function applyMaxIterations() {
        if(maxIterationsButton.hasClass("green-button")){
            maxIterations =  $maxIterationsInput.val();
            maxIterationsButton.addClass("green-button-clicked");
            maxIterationsButton.text("applied");
            maxIterationsButton.attr('disabled', true);
            applyMaxItCallback();
        }

    }

    function addMaxIterationsConf(){
        var maxIterationsContainer = $('<div/>', {
            id: "maxIterationsContainer"
        });

        var maxIterationsLabel = $('<div/>', {
                text: "max. Iterations: ",
                id: 'maxIterationsLabel'
            }).appendTo(maxIterationsContainer)
        ;

        $maxIterationsInput = $('<input/>', {
            value: "",
            // readOnly: true,
            id: "maxIterationsInput"
        }).on("input", function() {
            var $input = $(this);
            //allows only integer for input
            $input.val($input.val().replace(/[^\d]+/g,''));
            if($("#maxIterationsButton").hasClass("green-button-clicked")){
                $("#maxIterationsButton").removeClass("green-button-clicked");
                $("#maxIterationsButton").attr('disabled', false);
                $("#maxIterationsButton").text("ok");
            }
        }).appendTo(maxIterationsContainer);
        ;

        maxIterationsButton = $('<button/>', {
            text: "ok",
            // readOnly: true,
            id: "maxIterationsButton",
            class: "green-button",
            click: function () {
                applyMaxIterations();
            }
        }).appendTo(maxIterationsContainer)
        ;
        return maxIterationsContainer;
    }

    // expose public functions
    return {
        init: function (selector, callback, callback2) {
            return init(selector, callback, callback2)
        },
        getSamples: function () {
            return getSamples();
        },
        getIterationValue: function() {
            return iterations;
        },
        gotResponse: function (bMaxIterationsReached) {
            return gotResponse(bMaxIterationsReached);
        },
        getMaxIterationConfig: function () {
            return getMaxIterationConfig()
        }
    }
}
