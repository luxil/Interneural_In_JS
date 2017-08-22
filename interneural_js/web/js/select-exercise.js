/**
 * Created by Linh Do on 22.08.2017.
 */
var selectExercise = makeSelectExercise();
function makeSelectExercise() {
    var element;
    var selExCallback;
    var exerciseModes = ["free mode", "exercise 1", "exercise 2"];

    function init(selector, callback) {
        element = $(selector);
        selExCallback = callback;
        element.append(createHeader());
        element.append(createSelectDD());
        element.append(createResetExercise());
    }

    function createHeader() {
        var header = $('<button/>',
            {
                text: 'select exercise',
                class: "header"
            });
        return header;
    }

    function createSelectDD(){
        var divContainer = $("<div>",{
            class: "selectExerciseContainer"
        });

        var divSelectExercise = $("<select/>",{
            id: "selectExerciseDD"
        }).on('change', function (value, index) {
           changeExercise($(this).find(":selected").index());
           // changeExercise($(this).val());
        }).appendTo(divContainer);

        exerciseModes.forEach(function (value, index) {
            var option = $("<option/>",{
                text: value
            }).appendTo(divSelectExercise);
        });

        return divContainer;
    }

    function createResetExercise(){
        var button = $("<button/>", {
            text: "reset exercise",
            click: function () {changeExercise($("#selectExerciseDD").find(":selected").index());}
        })

        return button;
    }

    function changeExercise(value){
        //free mode
        if (value === 0) {
            history.go(0);  //refresh the page
        // exercise 1
        } else if (value === 1){
            selExCallback();
            nnConfig.doApplyNetwork();
            $("#addLayerButton").hide();
            trainingData.setSamples([{color:0, x:100, y:100}]);
            $(".editSamplesContainer").hide();
            $("#samplesConfigDiv").hide();
            $("#svgTraining").css("pointer-events", "none");
            $("#exerciseDescrBox").text("\nReach a sample coverage of 100%");

        } else if (value === 2 ){
            selExCallback();
        } else if (value === 3 ){
            selExCallback();
        } else{
            console.log("no exercise found");
        }
    }

    function resetExercise(){

    }

    return {
        init: function (selector, callback) {
            return init(selector, callback);
        }
    }
}

