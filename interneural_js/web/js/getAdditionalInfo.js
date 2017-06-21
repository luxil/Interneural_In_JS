/**
 * Created by Linh Do on 18.06.2017.
 */
//global for network graph config
var getAdditionalInfo = makeGetAdditionalInfo();
function makeGetAdditionalInfo() {

    var myPerceptron;

    var percLayers = [];
    var weigthsDataList = [];
    var weigthsData = [];
    var biasArr = [];

    // init
    function init() {
        neuralNetwork.init();
    }

    function expandedMessage(message){
        var expandedMessage;
        var msg = JSON.parse(message);
        var layers = [];
        myPerceptron = neuralNetwork.createPerceptron(msg.layers);
        orderLayers(function () {
            //add layers
            msg.layers.forEach(function (p1, p2, p3) {
                if(p2 < percLayers.length-1) {
                    layers[p2] = {
                        "numberOfNeurons": msg.layers[p2],
                        "weights": {
                            "data": JSON.parse(getWeigthsData(p2))
                        }
                    };
                }else{
                    layers[p2] = {
                        "numberOfNeurons": msg.layers[p2],
                        "weights": null
                    };
                }
            });

            var graph = {
                "layers": layers,
                "sampleCoverage": 0,
                "samplesTrained":0,
                "weightChange":0
            }

            var output = {
                "data":getOutputArray()
            }

            expandedMessage = {
                "id": msg.id,
                "graph": graph,
                "output":output
            }
        });
        return JSON.stringify(expandedMessage);
    }

    function expandedTraMessage(message){
        var expandedTraMessage;
        expandedTraMessage = {"jo":"jo"};
        var msg = JSON.parse(message);
        var layers = [];
        var trainigsResults = JSON.parse(neuralNetwork.trainTest(msg));
        // myPerceptron = neuralNetwork.createPerceptron(msg.layers);
        // orderLayers(function () {
        //     //add layers
        //     msg.layers.forEach(function (p1, p2, p3) {
        //         if(p2 < percLayers.length-1) {
        //             layers[p2] = {
        //                 "numberOfNeurons": msg.layers[p2],
        //                 "weights": {
        //                     "data": JSON.parse(getWeigthsData(p2))
        //                 }
        //             };
        //         }else{
        //             layers[p2] = {
        //                 "numberOfNeurons": msg.layers[p2],
        //                 "weights": null
        //             };
        //         }
        //     });
        //
            var graph = {
                "layers": layers,
                "sampleCoverage": 0,
                "samplesTrained":0,
                "weightChange":0
            }

            var output = {
                "data":trainigsResults.output
            }
        //
            expandedTraMessage = {
                "id": msg.id,
                "graph": graph,
                "output":output
            }
        // });
        return JSON.stringify(expandedTraMessage);
    }

    function expTest(message){
        var expandedTraMessage;
        var msg = JSON.parse(message);
        var layers = [];
        //var trainigsResults = JSON.parse(neuralNetwork.trainTest(msg));
            var graph = {
                "layers": layers,
                "sampleCoverage": 0,
                "samplesTrained":0,
                "weightChange":0
            }

            var output = {
                "data":neuralNetwork.getOutput()
            }
        //
            expandedTraMessage = {
                "id": msg.id,
                "graph": graph,
                "output":output
            }
        // });
        return JSON.stringify(expandedTraMessage);
    }

    function orderLayers(callback){
        percLayers = [];
        if(Object.keys(myPerceptron.layers).length >2) {
            percLayers.push(myPerceptron.layers.input);
            for (var layer in myPerceptron.layers.hidden)  percLayers.push(myPerceptron.layers.hidden[layer]);
            percLayers.push(myPerceptron.layers.output);
        }
        else if(Object.keys(myPerceptron.layers).length ===2) {
            for (var layer in myPerceptron.layers)  percLayers.push(myPerceptron.layers[layer]);
        }


        var oldfromindex=-1;
        weigthsDataList = [];
        weigthsData = [];
        for(var i = 0; i< percLayers.length; i++) {
            var layer = percLayers[i];
            var fromindex=-1;
            var bias = [];
            for (var j = 0; j < layer.list.length; j++) {
                var neuron = layer.list[j];
                Object.keys(neuron.connections.projected).forEach(function (key) {
                    var weigth = neuron.connections.projected[key].weight;
                    var to = neuron.connections.projected[key].to.ID;
                    var from = neuron.connections.projected[key].from.ID;
                    var bias = neuron.connections.projected[key].to.bias;
                    weigthsDataList.push({"layerid":i,"weigth":weigth,"to":to,"from":from});
                    if (weigthsData[i] === undefined) {
                        weigthsData[i] = [];
                        biasArr[i]=[]
                    }
                    if(oldfromindex!=from){
                        oldfromindex=from;
                        fromindex++;
                    }
                    if (weigthsData[i][fromindex] === undefined) {
                        weigthsData[i][fromindex] = [];
                        biasArr[i][fromindex]=[];

                    }
                    weigthsData[i][fromindex].push(weigth*12);
                    biasArr[i][fromindex].push(bias*12);

                });
            }
            if(weigthsData[i]!=undefined) {
                var len = weigthsData[i].length;
                weigthsData[i][len] = biasArr[i][0];
            }
        }
        weigthsData[percLayers.length]=undefined;
        callback();
    }

    function getWeigthsData(layerindex) {
        // weigthsData[layerindex].push(weigthsData[layerindex][0]);
        return JSON.stringify(weigthsData[layerindex]);
    }

    function getOutputArray() {
        return neuralNetwork.getOutput();
    }

    // expose public functions
    return {
        init: function () {
            return init()
        },
        expandedMessage: function (message) {
            return expandedMessage(message)
        },
        expandedTraMessage: function (message) {
            return expandedTraMessage(message)
        },
        expTest: function (message) {
            return expTest(message)
        }
    }
}
