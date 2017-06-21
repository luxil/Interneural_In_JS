$(function() {
  var sock = initSocksJS();
  initWidgets(sock);
});

function initSocksJS() {
  if (!window.location.origin) { // Some browsers (mainly IE) do not have this property, so we need to build it manually...
    window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : '');
  }

  var origin = window.location.origin;
  var options = {
    debug: true,
    devel: true,
    transports: ['websocket', 'xdr-streaming', 'xhr-streaming', 'iframe-eventsource', 'iframe-htmlfile', 'xdr-polling', 'xhr-polling', 'iframe-xhr-polling', 'jsonp-polling']
  };
  // establish the websocket connection
  var sock = new SockJS(origin+'/message', undefined, options);

  sock.onopen = function() {};
  sock.onclose = function() {};
  sock.onmessage = messageHandler;

  return sock;
}

function messageHandler(msg) {
  // console.log(msg);
  var messageHandlerMap = {
    0: newNetworkHandler,
    1: updateNetworkHanlder
  }
  var message = JSON.parse(msg.data);
  messageHandlerMap[message.id](message);
}

function newNetworkHandler(message) {
  // console.log(message);
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
  // console.log("updateNetworkHanlder: "+(message));
  // console.log((message));
  trainingData.gotResponse(); // inform training that a response arrived
  networkGraph.update(message.graph);
  networkPreview.paintCanvas(message.output.data);
  networkInfo.updateInfo(message.graph); // update training info
}

function initWidgets(sock) {
  // initialize the network graph d3 visualization
  networkGraph.init("#graph");

  // initialize the graph configuration widget
  graphConfig.init("#graph-config", requestNetwork);
  function requestNetwork() {
    var layersMsg = {"id": 0, "layers": graphConfig.getConfig()};
    sock.send(JSON.stringify(layersMsg));
  }

  // initialize the training widget
  trainingData.init("#training", trainNetwork);
  function trainNetwork() {
    var trainingMsg = {"id": 1,
                        "samples": trainingData.getSamples(),
                        "iterations": trainingData.getIterationValue()};
    console.log(trainingMsg);
    sock.send(JSON.stringify(trainingMsg));
  }

  // initialize the preview widget
  networkPreview.init("#preview");
  // initialize the info widget
  networkInfo.init("#network-info");
}
