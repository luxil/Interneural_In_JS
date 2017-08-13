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
var msge;
var testMessage;

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
    getAdditionalInfo.init();

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
    var addInfosToLayerMsg = {};
    var layersMsg = JSON.parse(message);
    if(layersMsg.id ===0){
        msge = {"data":JSON.stringify(JSON.parse(getAdditionalInfo.expandedMessage(message)))};
    } else{
        // var t_start = performance.now();
        testMessage = message;
        // startWorker();
        msge = {"data":JSON.stringify(JSON.parse(getAdditionalInfo.expandedTraMessage(testMessage)))};
        // var t1 = performance.now();
        // console.log((t1 - t_start) + " milliseconds. networkPreview")
    }
    messageHandler(msge);
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
    self.window = self;
    importScripts('/synaptic.js');

    var Neuron = synaptic.Neuron,
        Layer = synaptic.Layer,
        Network = synaptic.Network,
        Trainer = synaptic.Trainer,
        Architect = synaptic.Architect,

        myPerceptron, myTrainer,
        output = [],
        WIDTH = 200,
        HEIGHT = 200,
        perceptronDat,
        trainingOutput,
        weightArray
    ;
}


