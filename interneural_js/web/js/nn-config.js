/**
 * Created by Linh Do on 16.08.2017.
 */
var nnConfig = makeNnConfig();
function makeNnConfig() {

    var element;


    var applyCallback;
    var applyMaxItCallback;

    var learningRate = 0.01;
    var activationFunction = "logistic";
    var activationFunctions = ["logistic", "relu", "tanh", "identity"];
    var maxIterations;

    var $maxIterationsInput;
    var maxIterationsButton;

    function init(selector, callback, callback2) {
        applyCallback = callback;
        applyMaxItCallback = callback2;
        element = $(selector);
        element.append(createConfigOptions());
        element.append(createActivationFunctionSelect());
        element.append(createLearningRatesSelect());
        addMaxIterationsConf();
        addApplyButton();
    }

    function createConfigOptions(){
        var header = $('<div/>',
            {
                text: 'network config',
                click: function () {
                }
            });
        header.addClass("headerNnConfig");
        return header;
    }

    function createActivationFunctionSelect() {
        var divContainer = $("<div>");

        //ul li select with dropdown: http://jsfiddle.net/amitabhaghosh197/f69o462r/

        var ulElement = $("<ul>",{
            class : "ulActFuncOptions"
        });

        var liElement = $("<li>",{
            class: "init",
            text : activationFunction,
            value : activationFunction
        });
        ulElement.append(liElement)

        activationFunctions.forEach(function (entry, i){
            var newClass = "liActFuncOptions";
            if(entry===activationFunction) {
                newClass = "liActFuncOptions selected";
            }
            var liElement = $("<li>",{
                id: entry,
                class: newClass,
                value: entry,
                text: entry + ""
            });
            ulElement.append(liElement);
        });

        divContainer.append(ulElement);

        var allOptions = ulElement.children('li:not(.init)');

        ulElement.on("click", ".init", function() {
            $(this).closest("ul").children('li:not(.init)').slideDown();
        });

        ulElement.on("click", "li:not(.init)", function() {
            allOptions.removeClass('selected');
            $(this).addClass('selected');
            ulElement.children('.init').html($(this).html());
            activationFunction = $(this).attr("value");
            allOptions.slideUp();
        });

        return divContainer;
    }

    function createLearningRatesSelect(){
        var input = $('<input>',{
            id : "inputLearningRate",
            value: learningRate
        });

        return input;
    }

    // callback on click
    function addApplyButton() {
        var button = $('<button/>',
            {
                text: 'apply',
                click: function () {
                    applyMaxIterations();
                    applyCallback();
                }
            });
        button.addClass("good-button");
        element.parent().append(button);
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
        element.parent().append(maxIterationsContainer);
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

    function getLearningRate(){
        return parseFloat($("#inputLearningRate").val());
    }

    function getActivationFunction() {
        return activationFunction
    }

    function getMaxIterationConfig() {
        return maxIterations;
    }

    function mtime(func){
        var t0 = performance.now();
        func();
        var t1 = performance.now();
        console.log((t1 - t0) + " milliseconds.")
    }


    return {
        init: function (selector, callback, callback2) {
            return init(selector, callback, callback2)
        },
        getActivationFunction: function () {
            return getActivationFunction()
        },
        getLearningRate: function () {
            return getLearningRate()
        },
        getMaxIterationConfig: function () {
            return getMaxIterationConfig()
        }
    }

}