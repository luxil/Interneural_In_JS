/**
 * Created by Linh Do on 30.03.2017.
 */

$(document).ready(function(){
    var sock = null;
    initWidgets(sock);
});


function initWidgets(sock) {
    // initialize the network graph d3 visualization
    networkGraph.init("#graph");

    // initialize the graph configuration widget
    graphConfig.init("#graph-config", requestNetwork);
    function requestNetwork() {
        var layersMsg = {"id": 0, "layers": graphConfig.getLayersConfig()};
        var msg = JSON.stringify(layersMsg);
        console.log(msg);
        messageHandler(msg);
        //sock.send(JSON.stringify(layersMsg));
    }

    // initialize the training widget
    trainingData.init("#training", trainNetwork);
    function trainNetwork() {
        var trainingMsg = {"id": 1,
           "samples": trainingData.getSamples(),
           "iterations": trainingData.getIterationValue()};
        messageHandler(JSON.stringify(trainingMsg));
        // sock.send(JSON.stringify(trainingMsg));
    }

    // initialize the neural network
    neuralNetwork.init(null);

    // initialize the preview widget
    networkPreview.init("#preview");
    //// initialize the info widget
    //networkInfo.init("#network-info");
}

function messageHandler(msg) {

    var messageHandlerMap = {
        0: newNetworkHandler,
        1: updateNetworkHanlder
    }
    var message = JSON.parse(msg);
    messageHandlerMap[message.id](message);
}


function newNetworkHandler(message) {
    trainingData.gotResponse(); // inform training that a response arrived
    // resetting old network
    graphConfig.removeAll();
    //Create PerceptronInfo
    neuralNetwork.createPerceptron(message.layers);
    // loading new network with trainer
    networkGraph.load(neuralNetwork.getPerceptronDat());
    $.each(networkGraph.getActiveLayers(), function(idx, layer) {
        graphConfig.addLayer(layer);
    });
    networkPreview.paintCanvas(neuralNetwork.getOutput()); // print Output image
    //networkInfo.updateInfo(message.graph); // update training info
}

function updateNetworkHanlder(message) {
    trainingData.gotResponse(); // inform training that a response arrived
    neuralNetwork.trainTest(message);
    networkGraph.update(neuralNetwork.getPerceptronDat());
    networkPreview.paintCanvas(neuralNetwork.getOutput());
    //networkInfo.updateInfo(message.graph); // update training info
}




