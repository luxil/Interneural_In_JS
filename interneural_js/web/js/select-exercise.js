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
        element.append(createExerciseSolved());
        element.append(createAllTasksSolved());
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

    function createExerciseSolved(){
        var container = $('<div/>',
            {
                id: 'exerciseTasksContainer',
                text: "Tasklist"
            });
        return container;
    }

    function createAllTasksSolved(){
        var container = $('<div/>',
            {
                id: 'allTasksSolved',
                class: "notAllTasksSolved",
                text: ""
            });
        return container;
    }

    function addTasksToExContainer(text){
        var div = $('<div/>',
            {
                text: text,
                id: "exID_" + text,
                class: "exerciseTask"
            }).appendTo($("#exerciseTasksContainer"));
    }

    function addDescriptionLine(text){
        var div = $('<div/>',
            {
                text: text,
                id: "exID_" + text
            }).appendTo($("#exerciseDescrBox"));
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
            selExCallback();
            $("#exerciseDescrBox").empty();
            $("#exerciseTasksContainer").empty();
        // exercise 1
        } else if (value === 1){
            selExCallback();
            nnConfig.doApplyNetwork();
            $("#exerciseDescrBox").empty();
            $("#exerciseTasksContainer").empty();
            $("#allTasksSolved").text("Not all tasks solved!");

            $("#addLayerButton").hide();
            trainingData.setSamples([{color:0, x:100, y:100}]);
            $(".editSamplesContainer").hide();
            $("#samplesConfigDiv").hide();
            $("#svgTraining").css("pointer-events", "none");
            addDescriptionLine("For every activation function after 20 iterations:");
            addDescriptionLine("- sample coverage should be 100%");
            addDescriptionLine("- rgb-value of pixel (100/100) should be: (r:252, g:0; b:0)");
            $("#maxIterationsInput").val(20).attr("readonly", true);
            trainingData.applyMaxIterations();
            trainingData.updateIterations(1);
            addTasksToExContainer("logistic");
            addTasksToExContainer("relu");
            addTasksToExContainer("tanh");
            addTasksToExContainer("identity");
        } else if (value === 2 ){
            selExCallback();
            $("#exerciseDescrBox").empty();
            $("#exerciseTasksContainer").empty();
        } else if (value === 3 ){
            selExCallback();
        } else{
            console.log("no exercise found");
        }
    }

    function check(){
        var sampleCoverage = networkInfo.getSampleCoverage();
        var rgb = networkPreview.getRgbForPixel(100, 100);
        var activationFunction = nnConfig.getActivationFunction();
        var sampledTrained = networkInfo.getSamplesTrained();

        if(sampleCoverage===100 && checkRGBArray(rgb, [252,0,0]) && sampledTrained>19){
            var idString = "#exID_" + activationFunction;
            $(idString).addClass("exTaskDone");
            var bAllTasksDone = true;
            $(".exerciseTask").each(function() {
               if(!$( this ).hasClass("exTaskDone")){
                   bAllTasksDone = false;
               };
            });
            console.log(bAllTasksDone);
            if(bAllTasksDone){
                $("#allTasksSolved").removeClass("notAllTasksSolved");
                $("#allTasksSolved").addClass("allTasksSolved");
                $("#allTasksSolved").text("All tasks solved. \nYou can choose another exercise");
            };
        }

        function checkRGBArray(array1, array2){
            var bSameArray = true;
            array1.forEach(function (value, i) {
                if (i===0){
                    if(value < array2[i])  bSameArray=false;
                }
                else {
                    if(value != array2[i])  bSameArray=false;
                }
            });
            return bSameArray;
        }
    }

    return {
        init: function (selector, callback) {
            return init(selector, callback);
        },
        check: function () {
            return check();
        }
    }
}

