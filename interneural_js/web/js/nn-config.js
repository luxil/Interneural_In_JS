/**
 * Created by Linh Do on 16.08.2017.
 */
var nnConfig = makeNnConfig();
function makeNnConfig() {

    var element;


    var applyCallback;

    var learningRate = 0.001;
    var activationFunction;
    var activationFunctions = ["logistic", "relu", "tanh", "identity"];

    function init(selector, callback) {
        applyCallback = callback;
        element = $(selector);
        element.empty();
        activationFunction = activationFunctions[0];
        element.append(createConfigOptions());
        element.append(createActivationFunctionSelect());
        element.append(createLearningRatesSelect());
        //don't add apply button if it already exists
        if(!$("#applyNetwork").length) element.parent().append(addApplyButton());
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
        var divContainer = $("<div>",{
            class: "nnConfigContainerRow"
        });

        //ul li select with dropdown: http://jsfiddle.net/amitabhaghosh197/f69o462r/
        var ulElement = $("<ul>",{
            class : "ulActFuncOptions"
        });

        var liElement = $("<li>",{
            class: "init",
            text : activationFunction + " ▼",
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

        var divToolActFunc= $("<div>",{
            text: "?",
            title: "activation function",
            class: "tooltip"
        }).appendTo(divContainer);

        return divContainer;
    }

    function createLearningRatesSelect(){
        var divContainer = $("<div>",{
            class: "nnConfigContainerRow"
        });

        var input = $('<input>',{
            id : "inputLearningRate",
            value: learningRate
        }).on('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        }).appendTo(divContainer);

        var divToolActFunc= $("<div>",{
            text: "?",
            title: "learning rate",
            class: "tooltip"
        }).appendTo(divContainer);

        return divContainer;
    }

    // callback on click
    function addApplyButton() {
        var button = $('<button/>',
            {
                id: "applyNetwork",
                text: 'apply',
                click: function () {
                    applyCallback();
                }
            });
        button.addClass("good-button");
        return button;
    }


    function getLearningRate(){
        return parseFloat($("#inputLearningRate").val());
    }

    function getActivationFunction() {
        return activationFunction
    }


    function mtime(func){
        var t0 = performance.now();
        func();
        var t1 = performance.now();
        console.log((t1 - t0) + " milliseconds.")
    }

    function doApplyNetwork(){
        applyCallback()
    };


    return {
        init: function (selector, callback) {
            return init(selector, callback)
        },
        getActivationFunction: function () {
            return getActivationFunction()
        },
        getLearningRate: function () {
            return getLearningRate()
        },
        doApplyNetwork: function () {
            return doApplyNetwork()
        }
    }

}