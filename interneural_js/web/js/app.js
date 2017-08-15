// function initSocksJS() {
//   if (!window.location.origin) { // Some browsers (mainly IE) do not have this property, so we need to build it manually...
//     window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : '');
//   }
//
//   var origin = window.location.origin;
//   var options = {
//     debug: true,
//     devel: true,
//     transports: ['websocket', 'xdr-streaming', 'xhr-streaming', 'iframe-eventsource', 'iframe-htmlfile', 'xdr-polling', 'xhr-polling', 'iframe-xhr-polling', 'jsonp-polling']
//   };
//   // establish the websocket connection
//   var sock = new SockJS(origin+'/message', undefined, options);
//
//   sock.onopen = function() {};
//   sock.onclose = function() {};
//   sock.onmessage = messageHandler;
//
//   return sock;
// }

var output = [],
    WIDTH = 200,
    HEIGHT = 200;
var bTimeUpdate = false;
var bUpdateMessage = true;
var msge;
var testCounter = 0;

$(function() {
    initWidgets();

    for (var i=0; i <WIDTH; i++){
        for (var j=0; j <HEIGHT; j++){
            output.push([155,155,155]);
        }
    }
    // var sock = initSocksJS();
    // initWidgets(sock);
});

function initWidgets() {
    // initialize the network graph d3 visualization
    networkGraph.init("#graph");

    // initialize getAdditionalInfo
    neuralNetwork.init(test);

    // initialize the graph configuration widget
    graphConfig.init("#graph-config", requestNetwork);
    function requestNetwork() {
        var layersMsg = {"id": 0, "layers": graphConfig.getConfig()};
        getMoreMessageInformations(JSON.stringify(layersMsg));
        /**
         * fertig
         */
        // console.log(JSON.stringify(layersMsg));
        // sock.send(JSON.stringify(layersMsg));
    }

    // initialize the training widget
    trainingData.init("#training", trainNetwork);
    function trainNetwork() {
        var trainingMsg = {"id": 1,
            "samples": trainingData.getSamples(),
            "iterations": trainingData.getIterationValue()};
        // sock.send(JSON.stringify(trainingMsg));
        getMoreMessageInformations(JSON.stringify(trainingMsg));
    }

    // initialize the preview widget
    networkPreview.init("#preview");
    // initialize the info widget
    networkInfo.init("#network-info");
}

function getMoreMessageInformations(message) {
    var layersMsg = JSON.parse(message);
    if(layersMsg.id ===0){
        msge = {"data":JSON.stringify(JSON.parse(neuralNetwork.expandedMessage(message)))};
        messageHandler(msge);
    } else{
        // startWorker()
        // testMessage = message;
        // msge = {"data":JSON.stringify(JSON.parse(neuralNetwork.expandedTraMessage(testMessage)))};
        // setTimeout(console.log("hi"), 50000)
        // var bTestTrue = neuralNetwork.updateTraMessage();
        if (bUpdateMessage===true){
            bUpdateMessage = false;
        // //     bUpdateMessage =false;
        // //     // setTimeout(function () {
        // //     //     console.log("Hey")
            msge = {"data":JSON.stringify(JSON.parse(neuralNetwork.expandedTraMessage(message)))};
        // //         bUpdateMessage = true;
        // //     // }, 100);
            messageHandler(msge)
        }
        test2(message);

    }

}

function messageHandler(msg) {
    var messageHandlerMap = {
        0: newNetworkHandler,
        1: updateNetworkHanlder
    }
    var message = JSON.parse(msg.data);
    messageHandlerMap[message.id](message);
}

function newNetworkHandler(message) {
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

function updateNetworkHanlder(message) {
    //if bTimeUpdate true -> chronometer functions
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
        // console.log("update")
        networkPreview.paintCanvas(message.output.data);
        networkGraph.update(message.graph);
        networkInfo.updateInfo(message.graph); // update training info
        trainingData.gotResponse(); // inform training that a response arrived
    }
}

function startWorker() {
    if(typeof(Worker) !== "undefined") {
        // if(typeof(w) == "undefined") {
        w = new Worker(URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'})));
        // }
        w.onmessage = function(event) {
            document.getElementById("result").innerHTML = event.data;
        };
    } else {
        document.getElementById("result").innerHTML = "Sorry! No Web Worker support.";
    }
}

function worker_function(){
    // msge = {"data":JSON.stringify(JSON.parse(getAdditionalInfo.expandedTraMessage(testMessage)))};
    // var test = importScripts('getAdditionalInfo.js');
    // test.expandedTraMessage(testMessage);
    // test();
    console.log("hallo")
}

function test(message) {
    bUpdateMessage = true;
    msge = {"data":message};
    //         bUpdateMessage = true;
    //     // }, 100);
    // }
    messageHandler(msge)
}

function test2(m) {
    //neuronal network parameters
    var Neuron = synaptic.Neuron,
        Layer = synaptic.Layer,
        Network = synaptic.Network,
        Trainer = synaptic.Trainer,
        Architect = synaptic.Architect,

        myPerceptron, myTrainer
    ;

    myPerceptron = new Architect.Perceptron(2,6,6,3);
    myTrainer = new Trainer(myPerceptron);

    var message = JSON.parse(m)
    var trainingSet = [];
    output = [];

    var samples = message.samples;

    //create TrainingsSet
    var rgbArr = [[255,0,0],[0,255,0],[0,0,255]];
    for (var j = 0; j < samples.length; j++) {
        var x = samples[j].x / WIDTH;
        var y = samples[j].y / HEIGHT;
        var r = rgbArr[samples[j].color][0] / 255;
        var g = rgbArr[samples[j].color][1] / 255;
        var b = rgbArr[samples[j].color][2] / 255;
        trainingSet.push({
            input:[x, y],
            output:[r, g, b]});
        // trainingOutput[Math.floor(samples[j].x)][Math.floor(samples[j].y)]=[r, g, b];
    }

    // var iterations = (message.iterations*10)/(100/message.iterations);
    var iterations = message.iterations*10;
    // var dynamicRate =  .01/(1+.0005*iterations);
    var dynamicRate =  .01/(0.1+.0005*iterations);
    // dynamicRate=0.05
    console.log(dynamicRate);

    // train the network
    myTrainer.trainAsync(trainingSet,{
        rate: dynamicRate,
        iterations: iterations,
        error: 5*dynamicRate,
        shuffle: true,
        cost: Trainer.cost.CROSS_ENTROPY
    }).then(results => {
        // console.log('done!', results.error);
        // error = results.error;
        messageHandler(msge);
    });
    // messageHandler(msge);
}


