/**
 * Created by Linh Do on 22.08.2017.
 */
var selectExercise = makeSelectExercise();
function makeSelectExercise() {
    var element;
    var selExCallback;
    var exerciseModes = ["free mode", "exercise 1", "exercise 2", "exercise 3"];
    var exerciseModesFunc = [null, exercise1, exercise2, exercise3];
    var checkFunc = function () {
    };

    function init(selector, callback) {
        element = $(selector);
        element2 = $("#exerciseDescription");
        selExCallback = callback;
        element.append(createHeader());
        element.append(createSelectExDropDown());
        element.append(createExerciseSolved());
        element.append(createAllTasksSolved());
        element.append(createResetExercise());
        element2.append(createExerciseDescription());
        $("#exerciseDescrContainer").hide();
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
            text: "reset",
            click: function () {changeExercise($("#selectExerciseDD").find(":selected").index());}
        })

        return button;
    }

    function createExerciseDescription(){
        var container = $('<div/>', {
            id: "exerciseDescrContainer"
        });

        var header = $('<div/>', {
            text: 'exercise description',
            id: "exerciseDescrHeader"
        }).appendTo(container);

        var box = $('<div/>', {
            text: '\n-',
            id: "exerciseDescrBox"
        }).appendTo(container);

        return container;
    }

    function changeExercise(value){
        //free mode
        if (value === 0) {
            selExCallback();
            $("#exerciseDescrContainer").hide();
            $("#allTasksSolved").empty();
            $("#trainButton").show();
            $("#applyNetwork").show();
            checkFunc = function () {
                
            }
        // exercise 1
        } else if (typeof (value) === "number"){
            $("#exerciseDescrContainer").show();
            exerciseModesFunc[value]();

        } else if (value === 2 ){
            exercise2();
        } else if (value === 3 ){
            exercise3();
        } else{
            console.log("no exercise found");
        }
    }

    function exercise1() {
        selExCallback();
        nnConfig.doApplyNetwork();

        //update Exercise Description
        $("#exerciseDescrBox").empty();
        addDescriptionLine("You can change the activation function and the learning rate.");
        addDescriptionLine("Click on the button [apply] to create the network. Then you can train the network. ");
        addDescriptionLine("For every activation function (look at the task list on the right) after 20 iterations:");
        addDescriptionLine("- sample coverage should be 100%");
        addDescriptionLine("- rgb-value of pixel (100/100) should be: r>251, g=0; b:=0");
        addDescriptionLine("If you have solved a task of the task list the text of the activationfunction will turn green");


        //update tasklist on the right
        $("#exerciseTasksContainer").empty().text("tasklist\n---------------------------");
        addTasksToExContainer("logistic");
        addTasksToExContainer("relu");
        addTasksToExContainer("tanh");
        addTasksToExContainer("identity");
        $("#allTasksSolved").text("Not all tasks solved!");

        //set configurations
        $(".layer").addClass("disabledbutton");
        $("#addLayerButton").hide();
        trainingData.setSamples([{color:0, x:100, y:100}]);
        $(".editSamplesContainer").hide();
        $("#svgTraining").css("pointer-events", "none");
        $("#maxIterationsInput").val(20).addClass("disabledbutton");
        $("#inputLearningRate").val(0.1);
        trainingData.applyMaxIterations();
        trainingData.updateIterations(1);
        $(".iteration-slider").prop('disabled', true);
        $("#samplesConfigDiv").hide();
        $("#trainButton").hide();
        $("#applyNetwork").on("click", function () {
            $("#trainButton").show();
        });

        //update checkfunction which tests which tasks are solved
        checkFunc = function(){
            var sampleCoverage = networkInfo.getSampleCoverage();
            var rgb = networkPreview.getRgbForPixel(100, 100);
            var activationFunction = nnConfig.getActivationFunction();
            var sampledTrained = networkInfo.getSamplesTrained();

            if(sampleCoverage===100 && checkRGBArray(rgb, [251,0,0]) && sampledTrained>19){
                markTaskDone(activationFunction);
            }

            function checkRGBArray(array1, array2){
                var bSameArray = true;
                array1.forEach(function (value, i) {
                    if (i===0){
                        if(value <= array2[i])  bSameArray=false;
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
        addDescriptionLine("For every activation function after 10 iterations:");
        addDescriptionLine("- sample coverage should be 100%");

        //update tasklist on the right
        $("#exerciseTasksContainer").empty();
        $("#exerciseTasksContainer").text("tasklist\n---------------------------");
        addTasksToExContainer("logistic");
        addTasksToExContainer("relu");
        addTasksToExContainer("tanh");
        addTasksToExContainer("identity");
        $("#allTasksSolved").text("Not all tasks solved!");

        //set configurations
        $(".delete-button").hide();
        $(".layer").addClass("disabledbutton");
        $("#addLayerButton").hide();
        trainingData.setSamples([{color:0, x:50, y:50},{color:2, x:150, y:150}]);
        $(".editSamplesContainer").hide();
        $("#svgTraining").css("pointer-events", "none");
        $("#maxIterationsInput").val(10).addClass("disabledbutton");
        $("#maxIterationsButton").hide();
        trainingData.applyMaxIterations();
        trainingData.updateIterations(1);
        $(".iteration-slider").addClass("disabledbutton");
        $("#samplesConfigDiv").hide();

        //update checkfunction which tests which tasks are solved
        checkFunc = function(){
            var sampleCoverage = networkInfo.getSampleCoverage();
            var activationFunction = nnConfig.getActivationFunction();
            var sampledTrained = networkInfo.getSamplesTrained();

            if(sampleCoverage===100 && sampledTrained>9){
                markTaskDone(activationFunction);
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

    function exercise3() {
        selExCallback();

        //update Exercise Description
        $("#exerciseDescrBox").empty();
        addDescriptionLine("For every activation function sample coverage should be 100%.");
        addDescriptionLine("- logistic: after 10000 iterations");
        addDescriptionLine("- relu: after 400 iterations");
        addDescriptionLine("- tanh: after 20000 iterations");
        addDescriptionLine("- identity: after 20000 iterations");

        //update tasklist on the right
        $("#exerciseTasksContainer").empty().text("tasklist\n---------------------------");
        addTasksToExContainer("logistic");
        addTasksToExContainer("relu");
        addTasksToExContainer("tanh");
        addTasksToExContainer("identity");
        $("#allTasksSolved").text("Not all tasks solved!");

        //set configurations
        setHiddenLayers([9,9]);
        nnConfig.doApplyNetwork();
        $(".delete-button").hide();
        $(".layer").addClass("disabledbutton");
        $("#addLayerButton").hide();
        trainingData.setSamples([{color:0, x:50, y:50},{color:2, x:150, y:150}]);
        $(".editSamplesContainer").hide();
        $("#svgTraining").css("pointer-events", "none");
        trainingData.updateIterations(150);
        $("#samplesConfigDiv").hide();
        $("#trainButton").hide();
        $("#applyNetwork").hide();
        $("#maxIterationsButton").on("click", function () {
            $("#trainButton").show();
            $("#applyNetwork").show();
        });

        //update checkfunction which tests which tasks are solved
        checkFunc = function(){
            var sampleCoverage = networkInfo.getSampleCoverage();
            var activationFunction = nnConfig.getActivationFunction();
            var sampledTrained = networkInfo.getSamplesTrained();

            if(sampleCoverage===100){
                if(activationFunction==="logistic"&&sampledTrained<=10000){
                    markTaskDone(activationFunction)
                }
                if(activationFunction==="relu"&&sampledTrained<=400){
                    markTaskDone(activationFunction)
                }
                if(activationFunction==="identity"&&sampledTrained<=20000){
                    markTaskDone(activationFunction)
                }
                if(activationFunction==="tanh"&&sampledTrained<20000){
                    markTaskDone(activationFunction)
                }

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

    function markTaskDone(activationFunction) {
        var idString = "#exID_" + activationFunction;
        if(!($(idString).hasClass("exTaskDone")))   $(idString).addClass("exTaskDone");
        var bAllTasksDone = true;
        $(".exerciseTask").each(function() {
            if(!$( this ).hasClass("exTaskDone")){
                bAllTasksDone = false;
            };
        });
        updateAllTasksDoneText(bAllTasksDone);

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
    }

    function setHiddenLayers(array){
        graphConfig.removeAll();
        array.forEach(function(value) {
            graphConfig.addLayer(value);
        });
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

