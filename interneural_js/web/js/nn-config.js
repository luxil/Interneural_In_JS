/**
 * Created by Linh Do on 16.08.2017.
 */
var nnConfig = makeNnConfig();
function makeNnConfig() {

    var element;

    var learningRate = 0.01;
    var activationFunction = "logistic";
    var activationFunctions = ["logistic", "relu", "tanh", "identity"];
    var learningRates = [0.001, 0.01, 0.1];


    function init(selector) {
        element = $(selector);
        element.append(createConfigOptions());
        element.append(createActivationFunctionSelect());
        element.append(createLearningRatesSelect());
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

    function getConfig() {
        return {
            "learningRate": parseFloat($("#inputLearningRate").val()),
            "activationFunction": activationFunction
        };
    }

    function mtime(func){
        var t0 = performance.now();
        func();
        var t1 = performance.now();
        console.log((t1 - t0) + " milliseconds.")
    }


    return {
        init: function (selector, callback) {
            return init(selector, callback)
        },
        getConfig: function () {
            return getConfig()
        }
    }

}