/**
 * Created by Linh Do on 18.06.2017.
 */
//global for network graph config
var getAdditionalInfo = makeGetAdditionalInfo();
function makeGetAdditionalInfo() {

    var myPerceptron;

    var percLayers = [];
    var weightsDataList = [];
    var weightsData = [];
    var biasArr = [];
    var samplesTrained = 0;
    var expandedMessage;

    // init
    function init() {
        neuralNetwork.init();
        samplesTrained = 0;
    }

    //for newNetworkhandler
    function createExpandedMessage(message){
        var msg = JSON.parse(message);
        var layers = [];
        myPerceptron = neuralNetwork.createPerceptron(msg.layers);
        samplesTrained = 0;
        orderLayers(createExpandedMessageInfos);

        function createExpandedMessageInfos() {
            //add layers
            msg.layers.forEach(function (p1, p2, p3) { //p2 = index of the layer
                if(p2 < percLayers.length-1) {
                    layers[p2] = {
                        "numberOfNeurons": msg.layers[p2],
                        "weights": {
                            // "data": JSON.parse(getWeigthsData(p2))
                            "data": weightsData[p2]
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
        }
        return JSON.stringify(expandedMessage);
    }

    //for updateNetworkhandler
    function expandedTraMessage(message){
        // var expandedTraMessage;
        var msg = JSON.parse(message);
        var layers = [];
        msg.iterations = msg.iterations * (msg.iterations);
        samplesTrained += msg.iterations;
        var trainingsResults = JSON.parse(neuralNetwork.trainTest(msg)); //trainingsResults has two properties: myPerceptron and output
        createExpandedMessageInfos();
        function createExpandedMessageInfos() {
            expandedMessage.graph.samplesTrained = samplesTrained;
            expandedMessage.output.data = trainingsResults.output;
            expandedMessage.id = msg.id;
            updateWeightInfos(trainingsResults);
        }
        return JSON.stringify(expandedMessage);
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

        var oldFromIndex=-1;
        weightsDataList = [];
        weightsData = [];
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
                    weightsDataList.push({"layerid":i,"weigth":weigth,"to":to,"from":from});
                    if (weightsData[i] === undefined) {
                        weightsData[i] = [];
                        biasArr[i]=[]
                    }
                    if(oldFromIndex!=from){
                        oldFromIndex=from;
                        fromindex++;
                    }
                    if (weightsData[i][fromindex] === undefined) {
                        weightsData[i][fromindex] = [];
                        biasArr[i][fromindex]=[];

                    }
                    weightsData[i][fromindex].push(weigth*12);
                    biasArr[i][fromindex].push(bias*12);

                });
            }
            if(weightsData[i]!=undefined) {
                var len = weightsData[i].length;
                weightsData[i][len] = biasArr[i][0];
            }
        }
        weightsData[percLayers.length]=undefined;
        callback();
    }


    function updateWeightInfos(trainingResults){
        // var layers = expandedMessage.graph.layers;
        // for(var i = 0; i< layers.length-1; i++) {
        //     for(var j = 0; j< expandedMessage.graph.layers[i].weights.data.length; j++) {
        //         for(var k = 0; k< expandedMessage.graph.layers[i].weights.data[j].length; k++) {
        //             // console.log(expandedMessage.graph.layers[i].weights.data[j]);
        //             expandedMessage.graph.layers[i].weights.data[j][k]=2;
        //         }
        //     }
        // }

        var oldFromNeuronID = -1;
        var dataID = 0;
        var layerIndex;

        for(var i = 0; i< trainingResults.myPerceptron.connections.length; i++) {

            var layerNameOfNeuron_i = trainingResults.myPerceptron.neurons[parseInt(trainingResults.myPerceptron.connections[i].from)].layer;
            var fromNeuronID = parseInt(trainingResults.myPerceptron.connections[i].from);
            var oldLayerIndex=layerIndex;
            if( layerNameOfNeuron_i=== "input"){
                layerIndex = 0;
            } else if(layerNameOfNeuron_i=== "output"){
                layerIndex = expandedMessage.graph.layers.length-1;
            } else{
                layerIndex = parseInt(layerNameOfNeuron_i)+1;
            }

            if(layerIndex!=oldLayerIndex){
                dataID=0;
            }

            if(oldFromNeuronID===-1 ){
                expandedMessage.graph.layers[layerIndex].weights.data[dataID] = [];
            }
            else if(oldFromNeuronID!=fromNeuronID && oldFromNeuronID!=-1){
                dataID ++;
                expandedMessage.graph.layers[layerIndex].weights.data[dataID] = [];
            }
            oldFromNeuronID = fromNeuronID;
            expandedMessage.graph.layers[layerIndex].weights.data[dataID].push(parseFloat(trainingResults.myPerceptron.connections[i].weight));
        }
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
            return createExpandedMessage(message)
        },
        expandedTraMessage: function (message) {
            return expandedTraMessage(message)
        },
        expTest: function (message) {
            return expTest(message)
        }
    }
}
