/**
 * Created by Linh Do on 22.08.2017.
 */
var selectExercise = makeSelectExercise();
function makeSelectExercise() {
    var element;
    var selExCallback;
    var exerciseModes = ["free mode", "exercise 1", "exercise 2"];
    var checkFunc = function () {};

    function init(selector, callback) {
        element = $(selector);
        selExCallback = callback;
        element.append(createHeader());
        element.append(createSelectExDropDown());
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

    function createSelectExDropDown(){
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
                id: 'exerciseTasksContainer'
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
            addDescriptionLine("-");
            $("#exerciseTasksContainer").empty();
            $("#allTasksSolved").empty();
            checkFunc = function () {
                
            }
        // exercise 1
        } else if (value === 1){
            exercise1();

        } else if (value === 2 ){
            exercise1();
        } else if (value === 3 ){
            selExCallback();
        } else{
            console.log("no exercise found");
        }
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

    function updateAllTasksDoneText(bAllDone){
        if(bAllDone){
            if($("#allTasksSolved").hasClass("notAllTasksSolved"))  $("#allTasksSolved").removeClass("notAllTasksSolved");
            if(!$("#allTasksSolved").hasClass("notAllTasksSolved")) $("#allTasksSolved").addClass("allTasksSolved");
            $("#allTasksSolved").text("\nAll tasks solved. \nYou can choose another exercise");
        } else{
            if($("#allTasksSolved").hasClass("allTasksSolved"))         $("#allTasksSolved").removeClass("allTasksSolved");
            if(!$("#allTasksSolved").hasClass("notAllTasksSolved"))     $("#allTasksSolved").addClass("notAllTasksSolved");
            $("#allTasksSolved").text("Not all tasks solved!");
        }
    }

    function exercise1() {
        selExCallback();
        nnConfig.doApplyNetwork();

        //update Exercise Description
        $("#exerciseDescrBox").empty();
        addDescriptionLine("For every activation function after 20 iterations:");
        addDescriptionLine("- sample coverage should be 100%");
        addDescriptionLine("- rgb-value of pixel (100/100) should be: (r:252, g:0; b:0)");

        //update tasklist on the right
        $("#exerciseTasksContainer").empty();
        $("#exerciseTasksContainer").text("tasklist\n---------------------------");
        addTasksToExContainer("logistic");
        addTasksToExContainer("relu");
        addTasksToExContainer("tanh");
        addTasksToExContainer("identity");
        $("#allTasksSolved").text("Not all tasks solved!");

        //set configurations
        $("#addLayerButton").hide();
        trainingData.setSamples([{color:0, x:100, y:100}]);
        $(".editSamplesContainer").hide();
        $("#svgTraining").css("pointer-events", "none");
        $("#maxIterationsInput").val(20).attr("readonly", true);
        trainingData.applyMaxIterations();
        trainingData.updateIterations(1);
        $(".iteration-slider").prop('disabled', true);
        $("#samplesConfigDiv").hide();

        //update checkfunction which tests which tasks are solved
        checkFunc = function(){
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
                updateAllTasksDoneText(bAllTasksDone);
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
    }

    function exercise2() {
        selExCallback();
        nnConfig.doApplyNetwork();

        //update Exercise Description
        $("#exerciseDescrBox").empty();
        addDescriptionLine("For every activation function after 20 iterations:");
        addDescriptionLine("- sample coverage should be 100%");
        addDescriptionLine("- rgb-value of pixel (100/100) should be: (r:252, g:0; b:0)");

        //update tasklist on the right
        $("#exerciseTasksContainer").empty();
        $("#exerciseTasksContainer").text("tasklist\n---------------------------");
        addTasksToExContainer("logistic");
        addTasksToExContainer("relu");
        addTasksToExContainer("tanh");
        addTasksToExContainer("identity");
        $("#allTasksSolved").text("Not all tasks solved!");

        //set configurations
        $("#addLayerButton").hide();
        trainingData.setSamples([{color:0, x:100, y:100}]);
        $(".editSamplesContainer").hide();
        $("#svgTraining").css("pointer-events", "none");
        $("#maxIterationsInput").val(20).attr("readonly", true);
        trainingData.applyMaxIterations();
        trainingData.updateIterations(1);
        $(".iteration-slider").prop('disabled', true);
        $("#samplesConfigDiv").hide();

        //update checkfunction which tests which tasks are solved
        checkFunc = function(){
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
                updateAllTasksDoneText(bAllTasksDone);
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
    }

    return {
        init: function (selector, callback) {
            return init(selector, callback);
        },
        checkFunc: function () {
            return checkFunc();
        }
    }
}

