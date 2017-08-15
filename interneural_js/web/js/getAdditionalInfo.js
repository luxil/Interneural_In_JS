/**
 * Created by Linh Do on 18.06.2017.
 */
//global for network graph config
var neuralNetwork = makeNeuralNetwork();
function makeNeuralNetwork() {

    var myPerceptron;

    var percLayers = [];
    var weightsDataList = [];
    var weightsData = [];
    var biasArr = [];
    var samplesTrained = 0;
    var expandedMessage;
    var weightArray;
    var weightChange;
    var bReadyToUpdate = true;
    var error;

    //neuronal network parameters
    var Neuron = synaptic.Neuron,
        Layer = synaptic.Layer,
        Network = synaptic.Network,
        Trainer = synaptic.Trainer,
        // Architect = synaptic.Architect,

        myPerceptron, myTrainer,
        output = [],
        WIDTH = 200,
        HEIGHT = 200,
        trainingOutput
    ;


    function init() {
        samplesTrained = 0;
        weightArray= [];
        trainingOutput = new Array(WIDTH);
        error = 0;
        for (var i = 0; i < trainingOutput.length; i++) {
            trainingOutput[i] = new Array(HEIGHT);
        }

        for (var i=0; i <WIDTH; i++){
            for (var j=0; j <HEIGHT; j++){
                output.push([255,255,255]);
            }
        }
    }
    //for newNetworkhandler
    function createExpandedMessage(message){
        init();
        var msg = JSON.parse(message);
        var layers = [];
        myPerceptron = createPerceptron(msg.layers);
        orderLayers(createExpandedMessageInfos);

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

        function createExpandedMessageInfos() {
            //add layers
            msg.layers.forEach(function (p1, p2, p3) { //p2 = index of the layer
                if(p2 < percLayers.length-1) {
                    layers[p2] = {
                        "numberOfNeurons": msg.layers[p2],
                        "weights": {
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

            var graphObj = {
                "layers": layers,
                "sampleCoverage": 0,
                "samplesTrained":0,
                "weightChange":0
            }

            var outputObj = {
                "data": output
            }

            expandedMessage = {
                "id": msg.id,
                "graph": graphObj,
                "output":outputObj
            }
        }

        return JSON.stringify(expandedMessage);
    }

    //for updateNetworkhandler
    function expandedTraMessage(message){
        var msg = JSON.parse(message);
        msg.iterations = msg.iterations * 10;
        samplesTrained += msg.iterations;
        var trainingsResults = JSON.parse(trainTest(msg)); //trainingsResults has two properties: myPerceptron and output

        updateWeightInfos(createExpandedMessageInfos);
        function updateWeightInfos(callback) {
            var newWeightChange = 0;
            if(trainingsResults.myPerceptron.connections!=undefined && weightArray.length!=0){
                for (var i = 0; i < trainingsResults.myPerceptron.connections.length; i++ ) {
                    newWeightChange += Math.abs(trainingsResults.myPerceptron.connections[i].weight-weightArray[i]);
                    weightArray[i]=trainingsResults.myPerceptron.connections[i].weight;
                }
            }else if (trainingsResults.myPerceptron.connections!=undefined){
                for (var i = 0; i < trainingsResults.myPerceptron.connections.length; i++ ){
                    weightArray.push(trainingsResults.myPerceptron.connections[i].weight)
                }
            }
            weightChange = newWeightChange;

            var oldFromNeuronID = -1;
            var dataID = 0;
            var layerIndex;

            for(var i = 0; i< trainingsResults.myPerceptron.connections.length; i++) {

                var layerNameOfNeuron_i = trainingsResults.myPerceptron.neurons[parseInt(trainingsResults.myPerceptron.connections[i].from)].layer;
                var fromNeuronID = parseInt(trainingsResults.myPerceptron.connections[i].from);
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
                expandedMessage.graph.layers[layerIndex].weights.data[dataID].push(parseFloat(trainingsResults.myPerceptron.connections[i].weight));
            }
            callback();
        }

        function createExpandedMessageInfos() {
            expandedMessage.id = msg.id;
            expandedMessage.graph.samplesTrained = trainingsResults.samplesTrained;
            expandedMessage.graph.weightChange = weightChange;
            expandedMessage.graph.sampleCoverage=trainingsResults.sampleCoverage;
            expandedMessage.output.data = trainingsResults.output;
        }
        return JSON.stringify(expandedMessage);
    }


    function getWeightChange(trainingsResults) {
        //get mean weight change
        var meanWeightChange=0;
        if(trainingsResults.myPerceptron.connections!=undefined && weightArray.length!=0){
            for (var i = 0; i < trainingsResults.myPerceptron.connections.length; i++ ) {
                meanWeightChange += Math.abs(trainingsResults.myPerceptron.connections[i].weight-weightArray[i]);
                weightArray[i]=trainingsResults.myPerceptron.connections[i].weight;
            }
        }else if (trainingsResults.myPerceptron.connections!=undefined){
            for (var i = 0; i < trainingsResults.myPerceptron.connections.length; i++ ){
                weightArray.push(trainingsResults.myPerceptron.connections[i].weight)
            }
        }
        return meanWeightChange;
    }


    /**
     *
     * neuronal network functions
     *
     */

    function createPerceptron(layers) {
        Neuron.resetUid();
        var percLayers = [];
        if(layers.length>2) {
            myPerceptron = applyToConstructor(Architect.Perceptron, layers);
        }
        else if(layers.length==2) {
            myPerceptron=applyToConstructor(twoLayerPerceptron, layers);
        }
        myTrainer = new Trainer(myPerceptron);
        // console.log(myTrainer);
        return myPerceptron;
    }

    function twoLayerPerceptron(input, output){
        // create the layers
        var inputLayer = new Layer(input);
        var outputLayer = new Layer(output);

        // connect the layers
        inputLayer.project(outputLayer);

        // set the layers
        this.set({
            input: inputLayer,
            output: outputLayer
        });
    }
    // extend the prototype chain
    twoLayerPerceptron.prototype = new Network();
    twoLayerPerceptron.prototype.constructor = twoLayerPerceptron;


    //to use apply with a constructor; apply() method calls a function with a given this value and arguments provided as an array
    function applyToConstructor(constructor, argArray) {
        var args = [null].concat(argArray);
        var factoryFunction = constructor.bind.apply(constructor, args);
        return new factoryFunction();
    }

    function trainTest(message){
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
            trainingOutput[Math.floor(samples[j].x)][Math.floor(samples[j].y)]=[r, g, b];
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
            // log: 1000,
            cost: Trainer.cost.CROSS_ENTROPY
            // schedule: {
            //     every: 100, // repeat this task every 500 iterations
            //     do: function(data) {
            //         // custom log
            //         console.log("error", data.error, "iterations", data.iterations, "rate", data.rate);
            //         // if (someCondition)
            //         //     return true; // abort/stop training
            //     }
            // }
        // }).then(results => function () {
        //     bReadyToUpdate = true;
        //     console.log(results);
        });
        // }).then(results => {console.log('done!', results.error); error = results.error; gcallback() });





///////////
//         var rgbArr = [[255,0,0],[0,255,0],[0,0,255]];
//         for (var j = 0; j < samples.length; j++) {
//             var x = samples[j].x / WIDTH;
//             var y = samples[j].y / HEIGHT;
//             var r = rgbArr[samples[j].color][0] / 255;
//             var g = rgbArr[samples[j].color][1] / 255;
//             var b = rgbArr[samples[j].color][2] / 255;
//             var rgb = myPerceptron.activate([x, y]);
//             myPerceptron.propagate(dynamicRate, [r, g, b]);
//             // trainingSet.push({
//             //     input:[x, y],
//             //     output:[r, g, b]});
//             // trainingOutput[Math.floor(samples[j].x)][Math.floor(samples[j].y)]=[r, g, b];
//         }
        ///////////////////////////




        var countTrueMatches = 0;
        for (var i=0; i <WIDTH; i++){
            for (var j=0; j <HEIGHT; j++) {
                var rgb = myPerceptron.activate([j / HEIGHT, i / WIDTH]);
                if(trainingOutput[i][j] != undefined){
                    rgb = rgb;
                    if( clipTo_0_or_1(rgb[0]) === trainingOutput[i][j][0] && clipTo_0_or_1(rgb[1]) === trainingOutput[i][j][1] && clipTo_0_or_1(rgb[2]) === trainingOutput[i][j][2]){
                        countTrueMatches++;
                    }
                }
                if ((i % 2 === 0)&&(j % 2 ===0)) {
                    output.push([rgb[0] * 255, rgb[1] * 255, rgb[2] * 255]);
                }
            }
        }
        var sampleCoverage = (countTrueMatches/trainingSet.length);



        // var test = myPerceptron.activate([90/WIDTH,90/HEIGHT]);
        // console.log("test: "+ test);
        // console.log(myPerceptron.activate([0,1]));
        // console.log(myPerceptron.activate([samples[10].x/100,samples[10].y/100]));
        returnObj = {
            "output":output,
            "myPerceptron":myPerceptron,
            "sampleCoverage":sampleCoverage,
            "samplesTrained": (samplesTrained += iterations)
        }
        return JSON.stringify(returnObj);
    }


    function clipTo_0_or_1(value) {
        var newValue=-1;
        if (value<0.10){
            newValue = 0;
        } else if (value>0.90){
            newValue = 1;
        }

        return newValue;
    }


    function updateTraMessage() {
        if (bReadyToUpdate){
            bReadyToUpdate = false;
            return true;

        }
        return false;
    }

    var Architect = {

        // Multilayer Perceptron
        Perceptron: function Perceptron() {

            var args = Array.prototype.slice.call(arguments); // convert arguments to Array
            if (args.length < 3)
                throw new Error("not enough layers (minimum 3) !!");

            var inputs = args.shift(); // first argument
            var outputs = args.pop(); // last argument
            var layers = args; // all the arguments in the middle

            var input = new Layer(inputs);
            input.set({squash: Neuron.squash.LOGISTIC});
            var hidden = [];
            var output = new Layer(outputs);
            output.set({squash: Neuron.squash.LOGISTIC});

            var previous = input;

            // generate hidden layers
            for (var level in layers) {
                var size = layers[level];
                var layer = new Layer(size);
                layer.set({squash: Neuron.squash.LOGISTIC});
                hidden.push(layer);
                previous.project(layer);
                previous = layer;
            }
            previous.project(output);

            // set layers of the neural network
            this.set({
                input: input,
                hidden: hidden,
                output: output
            });

            // trainer for the network
            this.trainer = new Trainer(this);
        }
    }
    for (var architecture in Architect) {
        Architect[architecture].prototype = new Network();
        Architect[architecture].prototype.constructor = Architect[architecture];
    }

    // expose public functions
    return {
        init: function (selector) {
            return init(selector);
        },
        expandedMessage: function (message) {
            return createExpandedMessage(message)
        },
        expandedTraMessage: function (message) {
            return expandedTraMessage(message)
        },updateTraMessage: function () {
            return updateTraMessage()
        }
    }
}
