
var bTimeUpdate = false;
var msge;

$(function() {
    initWidgetsAndNeuralNetwork();
});

function initWidgetsAndNeuralNetwork() {
    // initialize the network graph d3 visualization
    networkGraph.init("#graph");

    // initialize the neural network parameters
    neuralNetwork.init(updateMessage);
    function updateMessage(message){
        updateNetwork(message)
    }

    // initialize the graph configuration widget
    graphConfig.init("#graph-config", requestNetwork);
    nnConfig.init("#nn-config");

    function requestNetwork() {
        var nnConfigMsg = nnConfig.getConfig();
        neuralNetwork.setNNConfig(JSON.stringify(nnConfigMsg));
        var requestMsg = {"id": 0, "layers": graphConfig.getConfig()};
        var graphConfigMessage = JSON.parse(neuralNetwork.setGraphConfig(JSON.stringify(requestMsg)));
        newNetwork(graphConfigMessage);
    }

    // initialize the training widget
    trainingData.init("#training", trainNetwork);
    function trainNetwork() {
        var trainingMsg = {"id": 1,
            "samples": trainingData.getSamples(),
            "iterations": trainingData.getIterationValue()};
        neuralNetwork.expandedTraMessage(JSON.stringify(trainingMsg));
    }

    // initialize the preview widget
    networkPreview.init("#preview");

    // initialize the info widget
    networkInfo.init("#network-info");
}

function newNetwork(message) {
    trainingData.gotResponse(); // inform training that a response arrived
    // resetting old network
    graphConfig.removeAll();
    // loading new network
    networkGraph.load(message.graph);
    $.each(networkGraph.getActiveLayers(), function(idx, layer) {
        graphConfig.addLayer(layer);
    });
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
    } else{
        networkPreview.paintCanvas(message.output.data);
        networkGraph.update(message.graph);
        networkInfo.updateInfo(message.graph); // update training info
        trainingData.gotResponse(); // inform training that a response arrived
    }
}



