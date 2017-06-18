/**
 * Created by Linh Do on 18.06.2017.
 */
//global for network graph config
var getAdditionalInfo = makeGetAdditionalInfo();
function makeGetAdditionalInfo() {

    var myPerceptron;

    var percLayers = [];
    var layers = [];

    // init
    function init() {

    }

    function expandedMessage(message){
        var msg = JSON.parse(message);
        var layers = {};
        myPerceptron = neuralNetwork.createPerceptron(msg.layers);
        orderLayers(function () {
            msg.layers.forEach(function (p1, p2, p3) {
                layers[p2] = {
                    "numberOfNeurons": msg.layers[p2],
                    "weights":{
                        "data": JSON.parse(getWeigthsData(p2))
                    }
                };
            });

            var graph = {
                "layers": layers
            }

            var expandedMessage = {
                "id": msg.id,
                "graph": graph
            }
        });
        return JSON.stringify(expandedMessage);
    }

    function orderLayers(callback){
        percLayers = [];
        if(Object.keys(myPerceptron.layers).length >2) {
            percLayers.push(myPerceptron.layers.input);
            for (var layer in myPerceptron.layers.hidden)  percLayers.push(myPerceptron.layers.hidden[layer]);
            percLayers.push(myPerceptron.layers.output);
        }
        else if(Object.keys(myPerceptron.layers).length==2) {
            for (var layer in myPerceptron.layers)  percLayers.push(myPerceptron.layers[layer]);
        }
        callback();
    }

    function getWeigthsData(layerindex) {
        var weigthsData = [];
        var layer = percLayers[layerindex];
        for (var j=0; j< layer.list.length; j++) {
            var neuron = layer.list[j];
            //for (var connection in neuron.connections.projected){
            Object.keys(neuron.connections.projected).forEach(function(key) {
                console.log(neuron.connections.projected[key].weight);
            });
        }

        return JSON.stringify(weigthsData);
    }

    // expose public functions
    return {
        init: function () {
            return init()
        },
        expandedMessage: function (message) {
            return expandedMessage(message)
        }
    }
}
