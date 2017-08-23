
var bTimeUpdate = false;

$(function() {
    initWidgetsAndNeuralNetwork();
});

function initWidgetsAndNeuralNetwork() {
    init();
    selectExercise.init("#select-exercise", init);
    function init() {

        // initialize the neural network parameters
        neuralNetwork.init(updateMessage);
        function updateMessage(message){
            updateNetwork(message)
        }

        // initialize the graph configuration widget
        graphConfig.init("#graph-config");
        nnConfig.init("#nn-config", requestNetwork);
        nnConfigInfo.init("#nn-config-info", function () {
            console.log("nnConfigcb");
        });

        function requestNetwork() {
            var nnMessage = {
                "id": 0,
                "layers": graphConfig.getLayersConfig(),
                "learningRate": nnConfig.getLearningRate(),
                "activationFunction": nnConfig.getActivationFunction(),
                "maxIterations": trainingData.getMaxIterationConfig()
            };
            var message = neuralNetwork.setConfig(JSON.stringify(nnMessage));
            var graphConfigMessage = JSON.parse(message);
            newNetwork(graphConfigMessage);
        }

        // initialize the network graph d3 visualization
        networkGraph.init("#graph");

        function updateMaxIterations() {
            neuralNetwork.updateMaxIterations(JSON.stringify({"maxIterations": trainingData.getMaxIterationConfig()}));
            nnConfigInfo.updateMaxIterationsInfo(trainingData.getMaxIterationConfig());
        }

        // initialize the training widget
        trainingData.init("#training", trainNetwork, updateMaxIterations);
        function trainNetwork() {
            var trainingMsg = {"id": 1,
                "samples": trainingData.getSamples(),
                "iterations": trainingData.getIterationValue(),
                "maxIterations": trainingData.getMaxIterationConfig()
            };
            neuralNetwork.startTraining(JSON.stringify(trainingMsg));
        }

        // initialize the preview widget
        networkPreview.init("#preview");

        // initialize the info widget
        networkInfo.init("#network-info");
        requestNetwork();
    }
}

function newNetwork(message) {
    trainingData.gotResponse(message.bMaxIterationsReached); // inform training that a response arrived
    // resetting old network
    // graphConfig.removeAll();
    // loading new network
    networkGraph.load(message.graph);
    nnConfigInfo.setNetworkConfigInfo(message.nnConfigInfo);
    // $.each(networkGraph.getActiveLayers(), function(idx, layer) {
    //     graphConfig.addLayer(layer);
    // });
    networkPreview.paintCanvas(message.output.data); // print Output image
    networkInfo.updateInfo(message.graph); // update training info
}

function updateNetwork(message) {
    //if bTimeUpdate === true -> chronometer functions and log to console
    if(bTimeUpdate) {
        var t_start = performance.now();
        networkPreview.paintCanvas(message.output.data);
        var t1 = performance.now();
        console.log((t1 - t_start) + " milliseconds. networkPreview")

        var t0 = performance.now();
        networkGraph.update(message.graph);
        t1 = performance.now();
        console.log((t1 - t0) + " milliseconds. networkGraph")

        t0 = performance.now();
        networkInfo.updateInfo(message.graph); // update training info
        t1 = performance.now();
        console.log((t1 - t0) + " milliseconds. networkInfo")

        t0 = performance.now();
        trainingData.gotResponse(); // inform training that a response arrived
        t1 = performance.now();
        console.log((t1 - t0) + " milliseconds. trainingData")

        console.log((t1 - t_start) + " milliseconds. totalTimeUpdate")
    }
    else{
        //if maxIterations reached don't update anything
        if(!message.bMaxIterationsReached) {
            networkPreview.paintCanvas(message.output.data);
            networkGraph.update(message.graph);
            networkInfo.updateInfo(message.graph); // update training info
            selectExercise.checkFunc();
        }
        trainingData.gotResponse(message.bMaxIterationsReached); // inform training that a response arrived
    }
}



